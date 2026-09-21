const { Router } = require('express');
const router = Router();
const commissionsController = require('../controllers/commissions.controller');
const auth = require('../middleware/auth');
const { authorize, authorizeAny } = require('../middleware/authorize');
const paginate = require('../middleware/paginate');

router.use(auth);

// Agentes
// El listado tambien lo necesita el asistente de ventas para elegir comisionista.
router.get('/agents', authorizeAny(['commissions', 'view'], ['sales', 'create']), paginate, commissionsController.listAgents);
router.post('/agents', authorize('commissions', 'create'), commissionsController.createAgent);
router.get('/agents/:id', authorize('commissions', 'view'), commissionsController.getAgent);
router.put('/agents/:id', authorize('commissions', 'edit'), commissionsController.updateAgent);
router.delete('/agents/:id', authorize('commissions', 'delete'), commissionsController.deleteAgent);

// Liquidaciones
router.get('/settlements', authorize('commissions', 'view'), paginate, commissionsController.listSettlements);
router.post('/settlements', authorize('commissions', 'create'), commissionsController.createSettlement);

module.exports = router;
