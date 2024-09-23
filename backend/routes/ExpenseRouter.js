const router = require('express').Router();
const {addExpense, getAllExpenseList, getExpenseInformation, updateExpenseInformation, activateExpense, deactivateExpense} = require('../controllers/ExpenseController');

router.post('/new', addExpense);
router.get('/list', getAllExpenseList);
router.get('/info/:id', getExpenseInformation);
router.patch('/:id', updateExpenseInformation);
router.patch('/activate/:id', activateExpense);
router.patch('/deactivate/:id', deactivateExpense);

module.exports = router;