const router = require('express').Router();
const { addEmployee, getAllEmployees, getAllEmployeeList, getEmployeeInformation, getAllPercentageTypeEmployess, getAllFixedTypeEmployess, getAllActiveEmployees, updateEmployeeInformation, activateEmployee, deactivateEmployee, uploadImage, getEmployeesByBranch, getAllActiveTeacherEmployees, getAllActiveTeacherEmployeesByBranch } = require('../controllers/EmployeeController');

router.post('/new', uploadImage, addEmployee);
router.get('/', getAllEmployees);
router.get('/list', getAllEmployeeList);
router.get('/percentage-type/:id', getAllPercentageTypeEmployess);
router.get('/fixed-type/:id', getAllFixedTypeEmployess);
router.get('/active', getAllActiveEmployees);
router.get('/teachers/active', getAllActiveTeacherEmployees);
router.get('/teachers/active/:id', getAllActiveTeacherEmployeesByBranch);
router.get('/active/:id', getEmployeesByBranch);
router.get('/info/:id', getEmployeeInformation);
router.patch('/:id', uploadImage, updateEmployeeInformation);
router.patch('/activate/:id', activateEmployee);
router.patch('/deactivate/:id', deactivateEmployee);

module.exports = router;