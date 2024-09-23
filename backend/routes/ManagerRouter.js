const router = require('express').Router();
const { addManager, getManagers, getAllManagers, getAllManagerList, getManagerInformation, uploadImage, updateManagerInformation, activateManager, deactivateManager } = require('../controllers/ManagerController');

router.post('/new', uploadImage, addManager);
router.get('/all', getAllManagers);
router.get('/', getManagers);
router.get('/list', getAllManagerList);
router.get('/info/:id', getManagerInformation);
router.patch('/:id', uploadImage, updateManagerInformation);
router.patch('/activate/:id', activateManager);
router.patch('/deactivate/:id', deactivateManager);

module.exports = router;