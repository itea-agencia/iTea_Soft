const prisma = require('../config/db');
const { Prisma } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

// Rango de fechas de los query params. Antes cada endpoint hacia `new Date(x).toISOString()`
// directo, y `?dateFrom=xyz` lo tumbaba con un 500. Devuelve { error } si no sirve.
function readDateRange(query) {
  const parse = (value) => {
    if (value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? NaN : date;
  };
  const from = parse(query.dateFrom);
  const to = parse(query.dateTo);
  if (Number.isNaN(from) || Number.isNaN(to)) return { error: 'Fecha inválida' };
  if (from && to && from > to) return { error: 'La fecha inicial es posterior a la final' };
  return { from, to };
}

// Fechas e id de usuario como parametros, no pegados al texto: estas consultas usaban
// $queryRawUnsafe con interpolacion, inyectable apenas alguien sumara un filtro de texto.
// `column` es siempre un literal del codigo, nunca algo del request.
const dateCond = (column, { from, to }) => Prisma.sql`${from ? Prisma.sql`AND ${Prisma.raw(column)} >= ${from}` : Prisma.empty} ${to ? Prisma.sql`AND ${Prisma.raw(column)} <= ${to}` : Prisma.empty}`;
const userCond = (req, column) => (req.permissionScope === 'own' ? Prisma.sql`AND ${Prisma.raw(column)} = ${req.user.id}` : Prisma.empty);

exports.dashboard = async (req, res, next) => {
  try {
    const range = readDateRange(req.query);
    if (range.error) return error(res, range.error, 400, 'VALIDATION_ERROR');
    const { from, to } = range;
    const currentYear = new Date().getFullYear();

    const where = { status: { not: 'anulado' } };
    if (from || to) {
      where.creadoAt = {};
      if (from) where.creadoAt.gte = from;
      if (to) where.creadoAt.lte = to;
    }
    if (req.permissionScope === 'own') {
      where.usuarioId = req.user.id;
    }

    // totalRevenue y creditTa suman ta_cre_total: monto_total = costo + ta + ta_cre, y sin
    // el TA CRE la T.A ingresada no coincidia con la ganancia por categoria (que ya lo
    // sumaba) y el desglose de la modal no cerraba con el pendiente (venta #169: faltaban
    // 135.000).
    const aggregatesSql = Prisma.sql`
      SELECT
        COUNT(*)::int as "totalOperations",
        COALESCE(SUM(CASE WHEN status = 'pagado' THEN ta_total + COALESCE(ta_cre_total, 0) WHEN status = 'abonado' AND monto_total > 0 THEN ((ta_total + COALESCE(ta_cre_total, 0)) * (COALESCE(monto_pagado_credito, 0) / monto_total)) ELSE 0 END), 0) as "totalRevenue",
        COALESCE(SUM(CASE WHEN status IN ('credito', 'abonado') THEN (monto_total - COALESCE(monto_pagado_credito, 0)) ELSE 0 END), 0) as "pendingBalance",
        COUNT(CASE WHEN status IN ('credito', 'abonado') THEN 1 END)::int as "pendingCount",
        COALESCE(SUM(CASE WHEN status = 'pagado' THEN costo_proveedor_total WHEN status = 'abonado' AND monto_total > 0 THEN (costo_proveedor_total * (COALESCE(monto_pagado_credito, 0) / monto_total)) ELSE 0 END), 0) as "suppliersTotal",
        COALESCE(SUM(CASE WHEN status = 'pagado' THEN monto_total ELSE 0 END), 0) as "paids",
        COALESCE(SUM(CASE WHEN status = 'credito' THEN monto_total ELSE 0 END), 0) as "credits",
        COALESCE(SUM(CASE WHEN status = 'abonado' THEN monto_total ELSE 0 END), 0) as "partPaids",
        COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM creado_at) = ${currentYear} THEN monto_total ELSE 0 END), 0) as "currentYearSales",
        COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM creado_at) = ${currentYear - 1} THEN monto_total ELSE 0 END), 0) as "prevYearSales",
        COALESCE(SUM(CASE WHEN status IN ('credito', 'abonado') AND monto_total > 0 THEN (costo_proveedor_total * ((monto_total - COALESCE(monto_pagado_credito, 0)) / monto_total)) ELSE 0 END), 0) as "creditProveedores",
        COALESCE(SUM(CASE WHEN status IN ('credito', 'abonado') AND monto_total > 0 THEN ((ta_total + COALESCE(ta_cre_total, 0)) * ((monto_total - COALESCE(monto_pagado_credito, 0)) / monto_total)) ELSE 0 END), 0) as "creditTa"
      FROM ventas
      WHERE deleted_at IS NULL AND status != 'anulado' ${dateCond('creado_at', range)} ${userCond(req, 'usuario_id')}
    `;

    let clientsWhere = { deletedAt: null };
    if (req.permissionScope === 'own') {
      clientsWhere.creadoPorId = req.user.id;
    }
    if (from || to) {
      clientsWhere.fechaRegistro = {};
      if (from) clientsWhere.fechaRegistro.gte = from;
      if (to) clientsWhere.fechaRegistro.lte = to;
    }

    // Run all DB queries in parallel
    // Un tiquete es por pasajero: una venta de tiqueteria con dos pasajeros son dos
    // tiquetes, cada uno con su numero en pasajeros_detalle. Contar filas de detalle_venta
    // daba uno. Un detalle sin pasajeros (ventas viejas) cuenta como un tiquete.
    const ventaTiquetes = { categoria: 'tiqueteria', venta: { ...where, deletedAt: null } };
    const [aggregatesRaw, categoryStats, totalClients, activeClients, recentSales, supplierCount, tiquetesPorPasajero, tiquetesSinPasajero] = await Promise.all([
      prisma.$queryRaw(aggregatesSql),
      prisma.detalleVenta.groupBy({
        by: ['categoria'],
        _sum: { subtotal: true, ta: true, taCre: true },
        _count: true,
        where: { venta: { ...where, deletedAt: null } }
      }),
      prisma.clientes.count({ where: clientsWhere }),
      prisma.clientes.count({ where: { ...clientsWhere, persona: { status: 'active' } } }),
      prisma.ventas.findMany({
        where: { ...where, deletedAt: null },
        orderBy: { creadoAt: 'desc' },
        take: 5,
        include: {
          cliente: { select: { persona: { select: { nombres: true, apellidos: true } } } },
          usuario: { select: { persona: { select: { nombres: true, apellidos: true } } } },
        }
      }),
      req.permissionScope === 'own' ? Promise.resolve(0) : prisma.proveedores.count(),
      prisma.pasajerosDetalle.count({ where: { detalleVenta: ventaTiquetes } }),
      prisma.detalleVenta.count({ where: { ...ventaTiquetes, pasajerosDetalle: { none: {} } } }),
    ]);

    // Calcular monthly trend para el usuario actual o global
    let monthlyTrend = [];
    const trendSql = Prisma.sql`
      SELECT 
        EXTRACT(YEAR FROM creado_at)::int as year,
        EXTRACT(MONTH FROM creado_at)::int as month,
        COALESCE(SUM(monto_total), 0) as total
      FROM ventas
      WHERE deleted_at IS NULL AND status != 'anulado' ${userCond(req, 'usuario_id')}
        AND EXTRACT(YEAR FROM creado_at) IN (${currentYear}, ${currentYear - 1})
      GROUP BY 1, 2
      ORDER BY 1 ASC, 2 ASC
    `;
    monthlyTrend = await prisma.$queryRaw(trendSql);

    const ivaTrendSql = Prisma.sql`
      SELECT 
        EXTRACT(YEAR FROM v.creado_at)::int as year,
        EXTRACT(MONTH FROM v.creado_at)::int as month,
        COALESCE(SUM((dv.ta + dv.ta_cre) * 0.19), 0) as total
      FROM ventas v
      JOIN detalle_venta dv ON v.id = dv.venta_id
      WHERE v.deleted_at IS NULL AND v.status != 'anulado' ${userCond(req, 'v.usuario_id')}
        AND EXTRACT(YEAR FROM v.creado_at) IN (${currentYear}, ${currentYear - 1})
      GROUP BY 1, 2
      ORDER BY 1 ASC, 2 ASC
    `;
    const ivaTrendRaw = await prisma.$queryRaw(ivaTrendSql);

    // O(1) properties assignment
    const agg = aggregatesRaw[0];
    const totalRevenue = Number(agg.totalRevenue) || 0;
    const pendingBalance = Number(agg.pendingBalance) || 0;
    const pendingCount = Number(agg.pendingCount) || 0;
    const totalOperations = Number(agg.totalOperations) || 0;
    const suppliersTotal = Number(agg.suppliersTotal) || 0;
    const paids = Number(agg.paids) || 0;
    const credits = Number(agg.credits) || 0;
    const partPaids = Number(agg.partPaids) || 0;
    const currentYearSales = Number(agg.currentYearSales) || 0;
    const prevYearSales = Number(agg.prevYearSales) || 0;
    const creditProveedores = Number(agg.creditProveedores) || 0;
    const creditTa = Number(agg.creditTa) || 0;

    const categoryMap = {
      tiqueteria: 'Tiquetes', hoteleria: 'Hoteles', planes: 'Planes',
      seguros_viaje: 'Seguros', checkin: 'Check-in', documentacion_migratoria: 'Documentos',
      simcard: 'SIM Cards', renta_vehiculos: 'Vehículos', renta_fincas: 'Fincas',
      tours: 'Tours', centros_convencion: 'Eventos', restaurantes: 'Restaurantes',
      visa: 'Visa', pasaporte: 'Pasaporte', servicio_mascotas: 'Mascotas'
    };

    const getGanancia = (d) => (d._sum.ta || 0) + (d._sum.taCre || 0);
    const totalCategoria = categoryStats.reduce((sum, d) => sum + getGanancia(d), 0);
    const categoryDistribution = categoryStats.map(d => {
      const ganancia = getGanancia(d);
      return {
        name: categoryMap[d.categoria] || d.categoria,
        value: ganancia,
        percentage: totalCategoria > 0 ? Math.round((ganancia / totalCategoria) * 10000) / 100 : 0
      };
    });

    const carteraTotal = paids + credits + partPaids || 1;
    const carteraStatus = [
      { name: 'Pagado', value: Math.round((paids / carteraTotal) * 100), color: '#16a34a' },
      { name: 'Abonado', value: Math.round((partPaids / carteraTotal) * 100), color: '#f59e0b' },
      { name: 'Crédito', value: Math.round((credits / carteraTotal) * 100), color: '#dc2626' },
    ];

    const categoryBreakdown = {
      hoteles: { count: 0, revenue: 0 },
      seguros_viaje: { count: 0, revenue: 0 },
      planes: { count: 0, revenue: 0 },
      tiqueteria: { count: 0, revenue: 0 },
    };
    let totalFlights = 0;
    for (const cs of categoryStats) {
      const rawCat = cs.categoria;
      const cat = rawCat === 'hoteleria' ? 'hoteles' : rawCat;
      const sum = (cs._sum.ta || 0) + (cs._sum.taCre || 0);
      const cnt = cs._count;
      if (categoryBreakdown[cat]) {
        categoryBreakdown[cat].count = cnt;
        categoryBreakdown[cat].revenue = Math.round(sum);
      }
    }
    totalFlights = tiquetesPorPasajero + tiquetesSinPasajero;
    categoryBreakdown.tiqueteria.count = totalFlights;


    const groupedTrend = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const currentData = monthlyTrend.find(t => t.month === m && t.year === currentYear);
      const previousData = monthlyTrend.find(t => t.month === m && t.year === currentYear - 1);
      return {
        month: m,
        currentYear: currentData ? Math.round(currentData.total) : 0,
        previousYear: previousData ? Math.round(previousData.total) : 0
      };
    });

    const groupedIvaTrend = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const currentData = ivaTrendRaw.find(t => t.month === m && t.year === currentYear);
      const previousData = ivaTrendRaw.find(t => t.month === m && t.year === currentYear - 1);
      return {
        month: m,
        currentYear: currentData ? Math.round(currentData.total) : 0,
        previousYear: previousData ? Math.round(previousData.total) : 0
      };
    });

    // Los rankings parten de las ventas y no de la lista de responsables/comisionistas: con
    // el LEFT JOIN de antes, un usuario con alcance "propios" veia los nombres de todos (con
    // $0), y las ventas anuladas sumaban porque esa condicion faltaba solo aca.
    const sqlResponsables = Prisma.sql`
      SELECT
        p.nombres || ' ' || p.apellidos as "name",
        COUNT(v.id)::int as "cantidad",
        COALESCE(SUM(v.monto_total), 0) as "ventas"
      FROM ventas v
      JOIN responsables r ON r.id = v.responsable_id
      JOIN personas p ON r.persona_id = p.id
      WHERE v.deleted_at IS NULL AND v.status != 'anulado' ${dateCond('v.creado_at', range)} ${userCond(req, 'v.usuario_id')}
      GROUP BY r.id, p.nombres, p.apellidos
      ORDER BY "ventas" DESC
      LIMIT 10
    `;
    const responsablesRaw = await prisma.$queryRaw(sqlResponsables);
    const topResponsables = responsablesRaw.map(a => ({
      name: a.name,
      ventas: Math.round(Number(a.ventas)),
      cantidad: a.cantidad
    }));

    // Comision total del periodo, liquidada o no: es lo que dice el titulo del grafico.
    const sqlComisionistas = Prisma.sql`
      SELECT
        p.nombres || ' ' || p.apellidos as "name",
        COUNT(v.id)::int as "cantidad",
        COALESCE(SUM(v.monto_comision_neto), 0) as "comision"
      FROM ventas v
      JOIN comisionistas c ON c.id = v.comisionista_id
      JOIN personas p ON c.persona_id = p.id
      WHERE v.deleted_at IS NULL AND v.status != 'anulado' ${dateCond('v.creado_at', range)} ${userCond(req, 'v.usuario_id')}
      GROUP BY c.id, p.nombres, p.apellidos
      ORDER BY "comision" DESC
      LIMIT 10
    `;
    const comisionistasRaw = await prisma.$queryRaw(sqlComisionistas);
    const topComisionistas = comisionistasRaw.map(a => ({
      name: a.name,
      comision: Math.round(Number(a.comision)),
      cantidad: a.cantidad
    }));

    success(res, {
      totalRevenue: Math.round(totalRevenue),
      // Monto total de las ventas no anuladas del rango: la base sobre la que se calculan los
      // porcentajes de cartera, que es lo que va en el centro de ese grafico.
      totalSales: Math.round(paids + credits + partPaids),
      previousYearRevenue: Math.round(prevYearSales),
      revenueGrowth: prevYearSales > 0 ? Math.round(((currentYearSales - prevYearSales) / prevYearSales) * 100) : 0,
      totalOperations,
      operationsGrowth: 0,
      pendingBalance: Math.round(pendingBalance),
      pendingCount,
      suppliersTotal: Math.round(suppliersTotal),
      monthlyRevenue: Math.round(currentYearSales),
      categoryDistribution: categoryDistribution.slice(0, 8),
      carteraStatus,
      monthlyTrend: groupedTrend,
      ivaTrend: groupedIvaTrend,
      totalClients,
      activeClients,
      totalFlights,
      categoryBreakdown,
      recentSales: recentSales.map(v => ({
        id: v.id,
        clientName: `${v.cliente.persona.nombres} ${v.cliente.persona.apellidos}`,
        asesorName: `${v.usuario.persona.nombres} ${v.usuario.persona.apellidos}`,
        date: v.creadoAt,
        total: v.montoTotal,
        status: v.status,
      })),
      supplierCount,
      creditProveedores: Math.round(creditProveedores),
      creditTa: Math.round(creditTa),
      topResponsables,
      topComisionistas,
    });
  } catch (err) {
    next(err);
  }
};

exports.asesorPerformance = async (req, res, next) => {
  try {
    const range = readDateRange(req.query);
    if (range.error) return error(res, range.error, 400, 'VALIDATION_ERROR');

    const sql = Prisma.sql`
      SELECT 
        v.usuario_id as "asesorId",
        p.nombres || ' ' || p.apellidos as "asesorName",
        COUNT(v.id)::int as "totalVentas",
        COALESCE(SUM(v.monto_total), 0) as "totalIngresos",
        COALESCE(SUM(v.monto_comision_neto), 0) as "comisiones"
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      JOIN personas p ON u.persona_id = p.id
      WHERE v.deleted_at IS NULL AND v.status != 'anulado' ${dateCond('v.creado_at', range)} ${userCond(req, 'v.usuario_id')}
      GROUP BY v.usuario_id, p.nombres, p.apellidos
    `;

    const result = await prisma.$queryRaw(sql);

    success(res, result.map(g => ({
      ...g,
      totalIngresos: Math.round(Number(g.totalIngresos)),
      comisiones: Math.round(Number(g.comisiones))
    })));
  } catch (err) {
    next(err);
  }
};

exports.topClients = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const range = readDateRange(req.query);
    if (range.error) return error(res, range.error, 400, 'VALIDATION_ERROR');

    const sql = Prisma.sql`
      SELECT 
        c.id as "clienteId",
        p.nombres || ' ' || p.apellidos as "clientName",
        COUNT(v.id)::int as "totalVentas",
        COALESCE(SUM(v.monto_total), 0) as "totalPagado"
      FROM ventas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN personas p ON c.persona_id = p.id
      WHERE v.deleted_at IS NULL AND v.status != 'anulado' ${dateCond('v.creado_at', range)} ${userCond(req, 'v.usuario_id')}
      GROUP BY c.id, p.nombres, p.apellidos
      ORDER BY "totalPagado" DESC
      LIMIT ${limit}
    `;

    const result = await prisma.$queryRaw(sql);

    success(res, result.map(g => ({
      ...g,
      totalPagado: Math.round(Number(g.totalPagado))
    })));
  } catch (err) {
    next(err);
  }
};

exports.categoryDistribution = async (req, res, next) => {
  try {
    const range = readDateRange(req.query);
    if (range.error) return error(res, range.error, 400, 'VALIDATION_ERROR');
    // `where.venta` existe siempre. Antes solo se creaba si venian fechas, y el alcance 'own'
    // escribia sobre un `undefined`: un asesor sin filtro de fechas recibia un 500. Estaba
    // oculto porque la ruta no pasaba por `authorize`, asi que 'own' nunca llegaba.
    // Sin anuladas, igual que el dashboard: una venta anulada no es ganancia de ninguna categoria.
    const where = { venta: { deletedAt: null, status: { not: 'anulado' } } };
    if (range.from || range.to) {
      where.venta.creadoAt = {};
      if (range.from) where.venta.creadoAt.gte = range.from;
      if (range.to) where.venta.creadoAt.lte = range.to;
    }

    if (req.permissionScope === 'own') {
      where.venta.usuarioId = req.user.id;
    }

    const detalles = await prisma.detalleVenta.groupBy({
      by: ['categoria'],
      _sum: { subtotal: true, ta: true, taCre: true },
      where: { venta: { ...where.venta, deletedAt: null } }
    });

    const categoryMap = {
      tiqueteria: 'Tiquetes', hoteleria: 'Hoteles', planes: 'Planes',
      seguros_viaje: 'Seguros', checkin: 'Check-in', documentacion_migratoria: 'Documentos',
      simcard: 'SIM Cards', renta_vehiculos: 'Vehículos', renta_fincas: 'Fincas',
      tours: 'Tours', centros_convencion: 'Eventos', restaurantes: 'Restaurantes',
      visa: 'Visa', pasaporte: 'Pasaporte', servicio_mascotas: 'Mascotas'
    };

    const getGanancia = (d) => (d._sum.ta || 0) + (d._sum.taCre || 0);
    const total = detalles.reduce((s, d) => s + getGanancia(d), 0);
    success(res, detalles.map(d => {
      const ganancia = getGanancia(d);
      return {
        name: categoryMap[d.categoria] || d.categoria,
        value: ganancia,
        percentage: total > 0 ? Math.round((ganancia / total) * 10000) / 100 : 0
      };
    }));
  } catch (err) {
    next(err);
  }
};
