const router = require('express').Router();
const { addBranch, getAllBranches, getAllBranchList, getBranchInformation, getAllActiveBranches, updateBranchInformation, activateBranch, deactivateBranch } = require('../controllers/BranchController');

router.post('/new', addBranch);
router.get('/', getAllBranches);
router.get('/active', getAllActiveBranches);
router.get('/list', getAllBranchList);
router.get('/info/:id', getBranchInformation);
router.patch('/:id', updateBranchInformation);
router.patch('/activate/:id', activateBranch);
router.patch('/deactivate/:id', deactivateBranch);

module.exports = router;