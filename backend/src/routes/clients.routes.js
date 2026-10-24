const { Router } = require('express');
const router = Router();
const clientsController = require('../controllers/clients.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const paginate = require('../middleware/paginate');
const propio = require('../middleware/propio');


router.use(auth);

router.get('/', authorize('clients', 'view'), paginate, clientsController.list);
router.get('/:id', authorize('clients', 'view'), propio('cliente'), clientsController.getById);
router.post('/', authorize('clients', 'create'), clientsController.create);
router.put('/:id', authorize('clients', 'edit'), propio('cliente'), clientsController.update);
router.patch('/:id/toggle-status', authorize('clients', 'toggle'), propio('cliente'), clientsController.toggleStatus);


module.exports = router;
