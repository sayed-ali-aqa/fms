const Expense = require('../models/ExpenseModel');
const Joi = require('joi');

const ExpenseSchema = Joi.object({
    info: Joi.string().required().max(150),
    amount: Joi.number()
        .required()
        .min(0)
        .positive()
        .max(9999999999),
})


const addExpense = async (req, res, next) => {
    try {
        const { error, value } = ExpenseSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Expense.createExpense(value.info, value.amount);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Expense record created successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error creating expense record!'
            })
        }

    } catch (error) {
        console.log('Error in addExpense() in ExpenseController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const getAllExpenseList = async (req, res, next) => {
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

        const [expenses, _] = await Expense.getExpensesList(filter, isActive, search, selectedField, searchedValue, startDate, endDate, page, pageSize);
        const expenseCount = await Expense.getExpenseCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate);

        res.status(200).json({ data: expenses, expenseCount: expenseCount[0][0].expenseCount });

    } catch (error) {
        console.log('Error in getAllExpenseList() in ExpenseController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getExpenseInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [expenseInfo, _] = await Expense.getExpenseInfo(id);
        res.status(200).json({ data: expenseInfo });

    } catch (error) {
        console.log('Error in in ExpenseController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateExpenseInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = ExpenseSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Expense.updateExpense(id, value.info, value.amount);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Expense record updated successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error updating expense record!'
            })
        }

    } catch (error) {
        console.log('Error in updateExpense() in ExpenseController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Error updating expense record!'
        })
    }
}

const activateExpense = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Expense.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Expense record activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate expense record!' });
        }

    } catch (error) {
        console.log('Error in activateExpense() in ExpenseController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateExpense = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Expense.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Expense record deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate expense record!' });
        }

    } catch (error) {
        console.log('Error in deactivateExpense() in ExpenseController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { addExpense, getAllExpenseList, getExpenseInformation, updateExpenseInformation, activateExpense, deactivateExpense };