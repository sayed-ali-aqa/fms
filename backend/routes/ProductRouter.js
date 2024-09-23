const router = require('express').Router();
const ProductController = require('../controllers/ProductController.js');

router.post('/new', ProductController.upload , ProductController.addProduct);


module.exports = router;