const router = require('express').Router();
const { addBook, getAllBookList, getBookInformation, sellBook, getBookSaleInformation, updateBookSaleInformation, updateBookInformation, getAllBookSalesList, activateBookSale, deactivateBookSale } = require('../controllers/BookController');

router.post('/new', addBook);
router.post('/sell', sellBook);
router.get('/list', getAllBookList);
router.get('/sales/list', getAllBookSalesList);
router.get('/sales/info/:id', getBookSaleInformation);
router.patch('/sales/activate/:id', activateBookSale);
router.patch('/sales/deactivate/:id', deactivateBookSale);
router.get('/info/:id', getBookInformation);
router.patch('/:id', updateBookInformation);
router.patch('/sales/edit/:id', updateBookSaleInformation);


module.exports = router;