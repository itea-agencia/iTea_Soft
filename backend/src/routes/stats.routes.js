const { Router } = require('express');
const router = Router();
const statsController = require('../controllers/stats.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(auth);

router.get('/dashboard', authorize('dashboard', 'view'), statsController.dashboard);
router.get('/sales-history', authorize('dashboard', 'view'), statsController.salesHistory);
router.get('/asesor-performance', authorize('dashboard', 'view'), statsController.asesorPerformance);
router.get('/top-clients', authorize('dashboard', 'view'), statsController.topClients);
router.get('/category-distribution', authorize('dashboard', 'view'), statsController.categoryDistribution);

module.exports = router;
