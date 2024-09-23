const router = require('express').Router();
const { addCategory, getAllCategories, getActiveCategories, getAllCategoryList, getCategoryInformation, updateCategoryInformation, activateCategory, deactivateCategory } = require('../controllers/CategoryController');

router.post('/new', addCategory);
router.get('/', getAllCategories);
router.get('/active', getActiveCategories);
router.get('/list', getAllCategoryList);
router.get('/info/:id', getCategoryInformation);
router.patch('/:id', updateCategoryInformation);
router.patch('/activate/:id', activateCategory);
router.patch('/deactivate/:id', deactivateCategory);

module.exports = router;