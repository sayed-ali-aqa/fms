const router = require('express').Router();
const { addBudget, getAllBudgetList, getAllBudgetCount, getBudgetInformation, updateBudgetInformation, activateBudget, deactivateBudget } = require('../controllers/BudgetController');

router.post('/new', addBudget);
router.get('/list', getAllBudgetList);
router.get('/count', getAllBudgetCount);
router.get('/info/:id', getBudgetInformation);
router.patch('/:id', updateBudgetInformation);
router.patch('/activate/:id', activateBudget);
router.patch('/deactivate/:id', deactivateBudget);

module.exports = router;