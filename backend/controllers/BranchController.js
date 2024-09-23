const Branch = require('../models/BranchModel');
const Joi = require('joi');

// validation schema
const BranchSchema = Joi.object({
    branch: Joi.string().trim().required().max(30),
    address: Joi.string().trim().required().max(150),
    managerId: Joi.string().trim().required(),
})

const updateBranchSchema = Joi.object({
    branch: Joi.string().trim().required().max(30),
    address: Joi.string().trim().required().max(150),

})

const addBranch = async (req, res, next) => {

    try {
        const { error, value } = BranchSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const result = await Branch.existedBranchCount(value.branch);
        const branchCount = result[0].branchCount;

        if (branchCount > 0) {
            return res.status(204).json({ statusCode: 204, msg: 'Branch name already exists!' })
        }

        const response = await Branch.createBranch(value.branch, value.address, value.managerId);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Branch record created successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error creating manager record!'
            })
        }

    } catch (error) {
        console.log('Error in addBranch() in branchController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const getAllBranches = async (req, res, next) => {
    try {
        const [branches, _] = await Branch.getBranches();
        res.status(200).json({ branches })

    } catch (error) {
        console.log('Error in getAllBranches() in BranchController:', error);
        next(error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
}

const getAllActiveBranches = async (req, res, next) => {
    try {
        const [branches, _] = await Branch.getActiveBranches();
        res.status(200).json({ branches })

    } catch (error) {
        console.log('Error in getAllActiveBranches() in BranchController:', error);
        next(error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
}

const getAllBranchList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const filter = req.query.filter;
        const isActive = (!req.query.isActive || JSON.parse(req.query.isActive) === undefined || req.query.isActive.length === 0) ? null : JSON.parse(req.query.isActive);
        const search = req.query.search;
        const selectedField = (!req.query.selectedField || req.query.selectedField === undefined || req.query.selectedField.length === 0) ? null : req.query.selectedField;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;

        const [branches, _] = await Branch.getBranchesList(filter, isActive, search, selectedField, searchedValue, page, pageSize);
        const branchCount = await Branch.getBranchCount(filter, isActive, search, selectedField, searchedValue);

        console.log(branchCount);

        res.status(200).json({ data: branches, branchCount: branchCount[0][0].branchCount });

    } catch (error) {
        console.log('Error in getAllBranchList() in branchController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const getBranchInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [branchInfo, _] = await Branch.getBranchInfo(id);
        res.status(200).json({ data: branchInfo });

    } catch (error) {
        console.log('Error in getBranchInformation() in BranchController:', error);
        next(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const updateBranchInformation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = updateBranchSchema.validate({ ...req.body });

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const result = await Branch.branchNameTakenCount(id, value.branch);
        const branchNameTakenCount = result[0].branchNameTakenCount;

        if (branchNameTakenCount > 0) {
            return res.status(204).json({ statusCode: 204, msg: 'Branch name already exists!' })
        }

        const response = await Branch.udpateBranch(id, value.branch, value.address);

        if (response.affectedRows === 1) {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Branch record updated successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Erro updating branch record!'
            })
        }

    } catch (error) {
        console.log('Error in updateBranchInformation() in BranchController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const activateBranch = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Branch.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Branch activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate branch!' });
        }

    } catch (error) {
        console.log('Error in activateBranch() in BranchController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateBranch = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Branch.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Branch deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate branch!' });
        }

    } catch (error) {
        console.log('Error in deactivateBranch() in BranchController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { addBranch, getAllBranches, getAllBranchList, getAllActiveBranches, getBranchInformation, updateBranchInformation, activateBranch, deactivateBranch };