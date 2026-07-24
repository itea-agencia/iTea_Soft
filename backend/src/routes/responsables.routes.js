const { Router } = require('express');
const router = Router();
const controller = require('../controllers/responsables.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const paginate = require('../middleware/paginate');


router.use(auth);

router.get('/', authorize('responsables', 'view'), paginate, controller.list);
router.post('/', authorize('responsables', 'create'), controller.create);
router.get('/:id', authorize('responsables', 'view'), controller.getById);
router.put('/:id', authorize('responsables', 'edit'), controller.update);
router.delete('/:id', authorize('responsables', 'delete'), controller.delete);
router.patch('/:id/toggle-status', authorize('responsables', 'delete'), controller.toggleStatus);

module.exports = router;
