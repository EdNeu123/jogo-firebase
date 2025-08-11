const express = require('express');
const ShopController = require('../controllers/shopController');

const router = express.Router();

// GET /api/shop/items - Obter itens da loja
router.get('/items', ShopController.getShopItems);

// POST /api/shop/purchase - Comprar item
router.post('/purchase', ShopController.purchaseItem);

// GET /api/shop/user/:userId/balance - Obter saldo do usuário
router.get('/user/:userId/balance', ShopController.getUserBalance);

module.exports = router;

