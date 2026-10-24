const { Router } = require('express');
const router = Router();
const rolesController = require('../controllers/roles.controller');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorize');

router.use(auth);

router.get('/:role/permissions', rolesController.getPermissions);
// Solo el admin. Antes bastaba `config.edit`, y en produccion el rol asesor lo tiene: un
// asesor podia reescribir los permisos de su propio rol y darse cualquier cosa (anular
// ventas, usuarios, comisiones). Cambiar quien puede que no es configurar catalogos.
router.put('/:role/permissions', requireAdmin, rolesController.updatePermissions);

module.exports = router;
