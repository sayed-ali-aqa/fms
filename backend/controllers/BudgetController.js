const Budget = require('../models/BudgetModel');
const Joi = require('joi');

const BudgetSchema = Joi.object({
    amount: Joi.number()
        .required()
        .min(0)
        .positive()
        .max(999999999999), // Specify the maximum value with 12 digits
    branchId: Joi.number().required(),
})

const addBudget = async (req, res, next) => {
    try {
        const { error, value } = BudgetSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = Budget.createBudget(value.amount, value.branchId);

        if (response) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Budget record created successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error creating budget record!'
            })
        }

    } catch (error) {
        console.log('Error in addBudget() in BudgetController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Error creating budget record!'
        })
    }
}

const getBudgetInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [budgetInfo, _] = await Budget.getBudgetInfo(id);
        res.status(200).json({ data: budgetInfo });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllBudgetList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const filter = req.query.filter;
        const isActive = (!req.query.isActive || JSON.parse(req.query.isActive) === undefined || req.query.isActive.length === 0) ? null : JSON.parse(req.query.isActive);
        const search = req.query.search;
        const selectedField = (!req.query.selectedField || req.query.selectedField === undefined || req.query.selectedField.length === 0) ? null : req.query.selectedField;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;
        const startDate = (!req.query.startDate || req.query.startDate === undefined || req.query.startDate.length === 0) ? null : req.query.startDate;
        const endDate = (!req.query.endDate || req.query.endDate === undefined || req.query.endDate.length === 0) ? new Date() : req.query.endDate;


        const [budgets, _] = await Budget.getBudgetsList(filter, isActive, search, selectedField, searchedValue, startDate, endDate, page, pageSize);
        const budgetCount = await Budget.getBudgetCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate);

        res.status(200).json({ data: budgets, budgetCount: budgetCount[0][0].budgetCount });

    } catch (error) {
        console.log('Error in getAllBudgetList() in BudgetController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllBudgetCount = async (req, res, next) => {
    try {
        const [budgetCount, _] = await Budget.getBudgetCount();
        res.status(200).json({ data: budgetCount });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateBudgetInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = BudgetSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Budget.updateBudget(id, value.amount, value.branchId);

        if (response.affectedRows === 1) {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Budget record updated successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error updating budget record!'
            })
        }

    } catch (error) {
        console.log('Error in updateBudgetInformation() in BudgetController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const activateBudget = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Budget.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Budget record activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate Budget record!' });
        }

    } catch (error) {
        console.log('Error in activateBudget() in BudgetController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateBudget = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Budget.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Budget record deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate Budget record!' });
        }

    } catch (error) {
        console.log('Error in deactivateBudget() in BudgetController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { addBudget, getAllBudgetList, getAllBudgetCount, getBudgetInformation, updateBudgetInformation, activateBudget, deactivateBudget };