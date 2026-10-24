const { Router } = require('express');
const router = Router();
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const paginate = require('../middleware/paginate');
const propio = require('../middleware/propio');


router.use(auth);

router.get('/', authorize('users', 'view'), paginate, usersController.list);
router.get('/:id', authorize('users', 'view'), propio('usuario'), usersController.getById);
router.post('/', authorize('users', 'create'), usersController.create);
router.put('/:id', authorize('users', 'edit'), propio('usuario'), usersController.update);
router.delete('/:id', authorize('users', 'delete'), propio('usuario'), usersController.remove);


module.exports = router;
