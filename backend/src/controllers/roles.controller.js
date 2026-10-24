const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');
const sesiones = require('../services/sesiones.service');
const { CATALOGO, existeAccion, leerValor, catalogoParaPanel } = require('../config/permisos');

const ROLES_EDITABLES = ['asesor', 'freelancer'];

// Lo que el panel necesita para dibujarse: modulos, acciones, etiquetas y tipos. No trae
// valores de ningun rol, asi que basta con tener sesion.
exports.getCatalogo = (req, res) => {
  success(res, catalogoParaPanel());
};

exports.getPermissions = async (req, res, next) => {
  try {
    const { role } = req.params;
    if (!ROLES_EDITABLES.includes(role)) {
      return error(res, 'Rol inválido. Use: asesor, freelancer', 400);
    }

    const permisos = await prisma.permisosRol.findMany({
      where: { rol: { nombre: role } },
      include: { permiso: true }
    });

    // Todas las acciones del catalogo, y sin fila no hay permiso: es lo mismo que aplica
    // authorize.js. Las filas que no estan en el catalogo (claves viejas como `sales.edit`)
    // no se muestran: ya no autorizan nada.
    const grouped = {};
    for (const [modulo, { acciones }] of Object.entries(CATALOGO)) {
      grouped[modulo] = {};
      for (const accion of Object.keys(acciones)) {
        grouped[modulo][accion] = leerValor(modulo, accion, 'false');
      }
    }
    for (const pr of permisos) {
      const valor = leerValor(pr.permiso.modulo, pr.permiso.accion, pr.valor);
      if (valor !== null) grouped[pr.permiso.modulo][pr.permiso.accion] = valor;
    }

    success(res, grouped);
  } catch (err) {
    next(err);
  }
};

// El valor tal como se guarda, o null si no corresponde al tipo de la accion.
function codificar(modulo, accion, valor) {
  const { tipo } = CATALOGO[modulo].acciones[accion];
  if (tipo === 'sino') return typeof valor === 'boolean' ? String(valor) : null;
  return ['all', 'own', 'none'].includes(valor) ? valor : null;
}

exports.updatePermissions = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;

    if (!ROLES_EDITABLES.includes(role)) {
      return error(res, 'Rol inválido. Use: asesor, freelancer', 400);
    }
    if (!permissions || typeof permissions !== 'object') {
      return error(res, 'Faltan los permisos a guardar', 400);
    }

    // Antes se guardaba cualquier modulo y accion que llegara, creando la fila del catalogo
    // si no existia: el panel (o cualquiera con acceso al endpoint) podia inventar permisos.
    // Ahora todo se valida contra el catalogo antes de tocar la base.
    const filas = [];
    for (const [modulo, accs] of Object.entries(permissions)) {
      if (!accs || typeof accs !== 'object') {
        return error(res, `Permisos inválidos para el módulo ${modulo}`, 400, 'VALIDATION_ERROR');
      }
      for (const [accion, valor] of Object.entries(accs)) {
        if (!existeAccion(modulo, accion)) {
          return error(res, `El permiso ${modulo}.${accion} no existe`, 400, 'VALIDATION_ERROR');
        }
        const guardado = codificar(modulo, accion, valor);
        if (guardado === null) {
          return error(res, `Valor inválido para ${modulo}.${accion}`, 400, 'VALIDATION_ERROR');
        }
        filas.push({ modulo, accion, valor: guardado });
      }
    }

    const rol = await prisma.roles.findUnique({ where: { nombre: role } });
    if (!rol) return error(res, 'Rol no encontrado', 404);

    // Todo o nada. Los permisos de un rol se reemplazan borrando y recreando, y como la BD
    // es la unica fuente (sin permiso no hay acceso), un fallo a medias dejaba al rol con
    // solo una parte de sus permisos y al resto de sus usuarios sin acceso.
    await prisma.$transaction(async (tx) => {
      await tx.permisosRol.deleteMany({ where: { rolId: rol.id } });

      for (const { modulo, accion, valor } of filas) {
        // La clave ya esta validada contra el catalogo; si su fila de `permisos` todavia no
        // existe (base sin el script de migracion), se crea.
        let permiso = await tx.permisos.findFirst({ where: { modulo, accion } });
        if (!permiso) {
          permiso = await tx.permisos.create({
            data: { modulo, accion, descripcion: `${modulo} - ${accion}` }
          });
        }
        await tx.permisosRol.create({
          data: { rolId: rol.id, permisoId: permiso.id, valor }
        });
      }
    });

    // Limpiar toda la caché de autenticación en RAM para que todos los usuarios
    // del rol recarguen sus permisos en la próxima petición
    sesiones.limpiarCache();

    success(res, { message: 'Permisos de rol actualizados' });
  } catch (err) {
    next(err);
  }
};
