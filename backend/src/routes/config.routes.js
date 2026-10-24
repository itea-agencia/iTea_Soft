const { Router } = require('express');
const router = Router();
const configController = require('../controllers/config.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Leer catalogos pide solo sesion: el asistente de ventas los necesita para llenar sus
// listas, y exigir `config.view` dejaba a un freelancer con el asistente vacio. Ese permiso
// decide si se ve la pantalla de Gestion Interna (decision 23 del diseno de permisos).
router.use(auth);

router.get('/all', configController.getAll);
router.get('/:section', configController.getSection);
router.post('/:section', authorize('config', 'create'), configController.createItem);
router.put('/:section/:id', authorize('config', 'edit'), configController.updateItem);
router.delete('/:section/:id', authorize('config', 'delete'), configController.removeItem);

module.exports = router;
