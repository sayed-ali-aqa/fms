const router = require('express').Router();
const { addStudent, getAllStudentList, uploadImage, getStudentInformation, getAllStudentCount, updateStudentInformation } = require('../controllers/StudentController');

router.post('/new', uploadImage, addStudent);
router.get('/list', getAllStudentList);
router.get('/count', getAllStudentCount);
router.get('/info/:id', getStudentInformation);
router.patch('/:id', uploadImage, updateStudentInformation);

module.exports = router;