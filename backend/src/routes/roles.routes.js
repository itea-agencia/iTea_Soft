const { Router } = require('express');
const router = Router();
const rolesController = require('../controllers/roles.controller');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorize');

router.use(auth);

// Que acciones existen, sin valores de ningun rol: lo usa cualquier pantalla.
router.get('/catalogo', rolesController.getCatalogo);
// Solo el admin. Cambiar permisos exigia `config.edit`, y en produccion el rol asesor lo
// tiene: un asesor podia reescribir los permisos de su propio rol y darse cualquier cosa.
// Leerlos tambien es del admin: es el panel, no algo que necesite otra pantalla.
router.get('/:role/permissions', requireAdmin, rolesController.getPermissions);
router.put('/:role/permissions', requireAdmin, rolesController.updatePermissions);

module.exports = router;
