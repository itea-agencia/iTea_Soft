const { Router } = require('express');
const router = Router();
const salesController = require('../controllers/sales.controller');
const productsController = require('../controllers/products.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ventaPropia = require('../middleware/ventaPropia');
const paginate = require('../middleware/paginate');


router.use(auth);

router.get('/', authorize('sales', 'view'), paginate, salesController.list);
router.get('/:id', authorize('sales', 'view'), ventaPropia, salesController.getById);
router.get('/:id/details', authorize('sales', 'view'), ventaPropia, paginate, salesController.getPaginatedDetails);
router.post('/', authorize('sales', 'create'), salesController.create);
router.put('/:id', authorize('sales', 'edit'), ventaPropia, salesController.update);
router.patch('/:id/review-status', authorize('sales', 'edit'), ventaPropia, salesController.updateReviewStatus);
router.post('/:id/void', authorize('sales', 'delete'), ventaPropia, salesController.voidSale);
router.delete('/:id', authorize('sales', 'delete'), ventaPropia, salesController.remove);
router.post('/:id/payments', authorize('sales', 'edit'), ventaPropia, salesController.registerPayment);
router.delete('/:saleId/payments/:paymentId', authorize('sales', 'edit'), ventaPropia, salesController.deletePayment);
router.get('/:id/payments', authorize('sales', 'view'), ventaPropia, salesController.listPayments);
router.post('/:id/send-voucher', authorize('sales', 'view'), ventaPropia, salesController.sendVoucher);
// Emitir una factura electronica no se revierte: exige poder editar la venta, no solo verla.
router.post('/:id/invoice', authorize('sales', 'edit'), ventaPropia, salesController.generateSiigoInvoice);

// 15 endpoints de productos
router.post('/:saleId/products/ticket', authorize('sales', 'create'), ventaPropia, productsController.createTicket);
router.put('/:saleId/products/ticket/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateTicket);
router.delete('/:saleId/products/ticket/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteTicket);

router.post('/:saleId/products/hotel', authorize('sales', 'create'), ventaPropia, productsController.createHotel);
router.put('/:saleId/products/hotel/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateHotel);
router.delete('/:saleId/products/hotel/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteHotel);

router.post('/:saleId/products/insurance', authorize('sales', 'create'), ventaPropia, productsController.createInsurance);
router.put('/:saleId/products/insurance/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateInsurance);
router.delete('/:saleId/products/insurance/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteInsurance);

router.post('/:saleId/products/plan', authorize('sales', 'create'), ventaPropia, productsController.createPlan);
router.put('/:saleId/products/plan/:id', authorize('sales', 'edit'), ventaPropia, productsController.updatePlan);
router.delete('/:saleId/products/plan/:id', authorize('sales', 'delete'), ventaPropia, productsController.deletePlan);

router.post('/:saleId/products/checkin', authorize('sales', 'create'), ventaPropia, productsController.createCheckin);
router.put('/:saleId/products/checkin/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateCheckin);
router.delete('/:saleId/products/checkin/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteCheckin);

router.post('/:saleId/products/migration', authorize('sales', 'create'), ventaPropia, productsController.createMigration);
router.put('/:saleId/products/migration/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateMigration);
router.delete('/:saleId/products/migration/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteMigration);

router.post('/:saleId/products/simcard', authorize('sales', 'create'), ventaPropia, productsController.createSimcard);
router.put('/:saleId/products/simcard/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateSimcard);
router.delete('/:saleId/products/simcard/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteSimcard);

router.post('/:saleId/products/baggage', authorize('sales', 'create'), ventaPropia, productsController.createBaggage);
router.put('/:saleId/products/baggage/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateBaggage);
router.delete('/:saleId/products/baggage/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteBaggage);

router.post('/:saleId/products/equipaje', authorize('sales', 'create'), ventaPropia, productsController.createBaggage);
router.put('/:saleId/products/equipaje/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateBaggage);
router.delete('/:saleId/products/equipaje/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteBaggage);

router.post('/:saleId/products/car-rental', authorize('sales', 'create'), ventaPropia, productsController.createCarRental);
router.put('/:saleId/products/car-rental/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateCarRental);
router.delete('/:saleId/products/car-rental/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteCarRental);

router.post('/:saleId/products/finca', authorize('sales', 'create'), ventaPropia, productsController.createFinca);
router.put('/:saleId/products/finca/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateFinca);
router.delete('/:saleId/products/finca/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteFinca);

router.post('/:saleId/products/tour', authorize('sales', 'create'), ventaPropia, productsController.createTour);
router.put('/:saleId/products/tour/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateTour);
router.delete('/:saleId/products/tour/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteTour);

router.post('/:saleId/products/convention', authorize('sales', 'create'), ventaPropia, productsController.createConvention);
router.put('/:saleId/products/convention/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateConvention);
router.delete('/:saleId/products/convention/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteConvention);

router.post('/:saleId/products/restaurant', authorize('sales', 'create'), ventaPropia, productsController.createRestaurant);
router.put('/:saleId/products/restaurant/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateRestaurant);
router.delete('/:saleId/products/restaurant/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteRestaurant);

router.post('/:saleId/products/visa', authorize('sales', 'create'), ventaPropia, productsController.createVisa);
router.put('/:saleId/products/visa/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateVisa);
router.delete('/:saleId/products/visa/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteVisa);

router.post('/:saleId/products/passport', authorize('sales', 'create'), ventaPropia, productsController.createPassport);
router.put('/:saleId/products/passport/:id', authorize('sales', 'edit'), ventaPropia, productsController.updatePassport);
router.delete('/:saleId/products/passport/:id', authorize('sales', 'delete'), ventaPropia, productsController.deletePassport);

router.post('/:saleId/products/pet-service', authorize('sales', 'create'), ventaPropia, productsController.createPetService);
router.put('/:saleId/products/pet-service/:id', authorize('sales', 'edit'), ventaPropia, productsController.updatePetService);
router.delete('/:saleId/products/pet-service/:id', authorize('sales', 'delete'), ventaPropia, productsController.deletePetService);


router.post('/:saleId/products/land-travel', authorize('sales', 'create'), ventaPropia, productsController.createLandTravel);
router.put('/:saleId/products/land-travel/:id', authorize('sales', 'edit'), ventaPropia, productsController.updateLandTravel);
router.delete('/:saleId/products/land-travel/:id', authorize('sales', 'delete'), ventaPropia, productsController.deleteLandTravel);

module.exports = router;
