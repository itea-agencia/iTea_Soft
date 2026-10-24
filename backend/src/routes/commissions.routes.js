const { Router } = require('express');
const router = Router();
const commissionsController = require('../controllers/commissions.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const paginate = require('../middleware/paginate');
const propio = require('../middleware/propio');

router.use(auth);

// Agentes
// El asistente de ventas pide `?para=venta`: quien puede crear ventas elige entre TODOS los
// comisionistas (decision 16 del diseno de permisos), y recibe solo id y nombre. El modulo de
// comisiones pide el listado completo, con su alcance.
const listadoDeAgentes = (req, res, next) =>
  (req.query.para === 'venta' ? authorize('sales', 'create') : authorize('commissions', 'view'))(req, res, next);
router.get('/agents', listadoDeAgentes, paginate, commissionsController.listAgents);
router.post('/agents', authorize('commissions', 'create'), commissionsController.createAgent);
router.get('/agents/:id', authorize('commissions', 'view'), propio('comisionista'), commissionsController.getAgent);
router.put('/agents/:id', authorize('commissions', 'edit'), propio('comisionista'), commissionsController.updateAgent);
router.delete('/agents/:id', authorize('commissions', 'delete'), propio('comisionista'), commissionsController.deleteAgent);

// Liquidaciones
router.get('/settlements', authorize('commissions', 'view'), paginate, commissionsController.listSettlements);
router.post('/settlements', authorize('commissions', 'settle'), commissionsController.createSettlement);

module.exports = router;
