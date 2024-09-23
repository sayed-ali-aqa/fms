const router = require('express').Router();
const { addClass, getAllClassList, getClassInformation, getAllClasses, getAllClassCount, getActiveClasses, updateClassInformation, getTimeList, activateClass, deactivateClass } = require('../controllers/ClassController');

router.get('/', getAllClasses);
router.post('/new', addClass);
router.get('/list', getAllClassList);
router.get('/count', getAllClassCount);
router.get('/times', getTimeList);
router.get('/branch/active', getActiveClasses);
router.patch('/:id', updateClassInformation);
router.patch('/activate/:id', activateClass);
router.patch('/deactivate/:id', deactivateClass);
router.get('/info/:id', getClassInformation);


module.exports = router;