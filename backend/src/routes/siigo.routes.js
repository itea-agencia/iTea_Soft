const { Router } = require('express');
const router = Router();
const siigoService = require('../services/siigo.service');
const auth = require('../middleware/auth');

// Proteger con JWT (opcional, pero recomendado)
router.use(auth);

// 1. Ver Tipos de Documentos (Para buscar el ID de la Factura de Venta)
router.get('/documents', async (req, res) => {
  try {
    const axios = require('axios');
    const headers = await siigoService.getHeaders();
    // type=FV filtra solo por Facturas de Venta
    const response = await axios.get(`${siigoService.baseURL}/v1/document-types?type=FV`, { headers });
    res.json({
      mensaje: "Busca aquí el 'id' del documento que tenga automatic_number: true",
      documentos: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Ver Formas de Pago
router.get('/payments', async (req, res) => {
  try {
    const axios = require('axios');
    const headers = await siigoService.getHeaders();
    const response = await axios.get(`${siigoService.baseURL}/v1/payment-types?document_type=FV`, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Ver Usuarios/Vendedores
router.get('/users', async (req, res) => {
  try {
    const axios = require('axios');
    const headers = await siigoService.getHeaders();
    const response = await axios.get(`${siigoService.baseURL}/v1/users`, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Ver Impuestos
router.get('/taxes', async (req, res) => {
  try {
    const axios = require('axios');
    const headers = await siigoService.getHeaders();
    const response = await axios.get(`${siigoService.baseURL}/v1/taxes`, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
