const { Router } = require('express');
const router = Router();
const salesController = require('../controllers/sales.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const propio = require('../middleware/propio');

const ventaPropia = propio('venta');
const paginate = require('../middleware/paginate');

// No hay PUT /:id, DELETE /:id ni /:saleId/products/*: eran 56 rutas de escritura que la
// interfaz no llamaba. El PUT de producto escribia `req.body` crudo en Prisma (incluido el
// `detalleVentaId`, que movia el producto a otra venta) y no comprobaba que el producto
// fuera de la venta de la URL. Una venta se crea entera por POST /, sus pagos van por
// /payments y se anula por /void.

router.use(auth);

router.get('/', authorize('sales', 'view'), paginate, salesController.list);
router.get('/:id', authorize('sales', 'view'), ventaPropia, salesController.getById);
router.get('/:id/details', authorize('sales', 'view'), ventaPropia, paginate, salesController.getPaginatedDetails);
router.post('/', authorize('sales', 'create'), salesController.create);
router.patch('/:id/review-status', authorize('sales', 'review'), ventaPropia, salesController.updateReviewStatus);
router.post('/:id/void', authorize('sales', 'void'), ventaPropia, salesController.voidSale);
router.post('/:id/payments', authorize('sales', 'pay'), ventaPropia, salesController.registerPayment);
router.delete('/:saleId/payments/:paymentId', authorize('sales', 'pay'), ventaPropia, salesController.deletePayment);
router.get('/:id/payments', authorize('sales', 'view'), ventaPropia, salesController.listPayments);
router.post('/:id/send-voucher', authorize('sales', 'view'), ventaPropia, salesController.sendVoucher);
// Emitir una factura electronica no se revierte: tiene su propio permiso, no basta con ver.
router.post('/:id/invoice', authorize('sales', 'invoice'), ventaPropia, salesController.generateSiigoInvoice);

module.exports = router;
