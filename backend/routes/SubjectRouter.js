const router = require('express').Router();
const { addSubject, getAllSubjectList, getSubjectInformation, updateSubjectInformation, getAllActiveSubjects, activateSubject, deactivateSubject } = require('../controllers/SubjectController');

// router.get('/', getAllSubjects);
router.post('/new', addSubject);
router.get('/list', getAllSubjectList);
router.get('/active', getAllActiveSubjects);
router.get('/info/:id', getSubjectInformation);
router.patch('/:id', updateSubjectInformation);
router.patch('/activate/:id', activateSubject);
router.patch('/deactivate/:id', deactivateSubject);

module.exports = router;