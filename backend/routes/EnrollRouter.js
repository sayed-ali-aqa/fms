const router = require('express').Router();
const { enrollStudent, getAllEnrollList, getEnrolledInformation, getAllEnrollCount, updateEnroll, activateEnroll, deactivateEnroll } = require('../controllers/EnrollController');

router.post('/new', enrollStudent);
router.get('/list', getAllEnrollList);
router.patch('/edit/:id', updateEnroll);
router.patch('/activate/:id', activateEnroll);
router.patch('/deactivate/:id', deactivateEnroll);
router.get('/info/:id', getEnrolledInformation);
router.get('/count', getAllEnrollCount);

module.exports = router;