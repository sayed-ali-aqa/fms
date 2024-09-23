const router = require('express').Router();
const { getAllSalaryList, getFixedTypeSalaryInfo, updatePercentageTypeSalary, getPercTypeSalaryInfo, updateFixedTypeSalary, getPaidSalaryInfo, payFixedTypeSalary, payPercentageTypeSalary, getAllPaidSalaryList } = require('../controllers/SalaryController');

router.get('/list', getAllSalaryList);
router.get('/info/fixed-type/:id', getFixedTypeSalaryInfo);
router.get('/info/percentage-type/:id', getPercTypeSalaryInfo);
router.get('/paid/list', getAllPaidSalaryList);
router.get('/paid/info/:id', getPaidSalaryInfo);
router.post('/pay/fixed-type/:id', payFixedTypeSalary);
router.post('/pay/percentage-type/:id', payPercentageTypeSalary);
router.patch('/edit/fixed-type/:id', updateFixedTypeSalary);
router.patch('/edit/percentage-type/:id', updatePercentageTypeSalary);


module.exports = router;