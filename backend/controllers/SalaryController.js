const Salary = require('../models/SalaryModel');
const Joi = require('joi');

const FixedSalarySchema = Joi.object({
    paidAmount: Joi.number().required().min(0).max(999999),
    monthOfSalary: Joi.string().trim().required().valid("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"),
});

const PercentageSalarySchema = Joi.object({
    paidAmount: Joi.number().required().min(0).max(999999),
    salaryDetails: Joi.string().trim().required().max(100),
});

const payFixedTypeSalary = async (req, res, next) => {
    try {

        const { error, value } = FixedSalarySchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const { id } = req.params;

        const salaryInfo = await Salary.getFixedSalaryInfo(id);
        const totalSalary = salaryInfo[0][0].salary;

        const response = await Salary.payFixedSalary(id, totalSalary, value.paidAmount, value.monthOfSalary);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Salary was paid successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error paying salary!'
            })
        }

    } catch (error) {
        console.log('Error in payFixedTypeSalary() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateFixedTypeSalary = async (req, res, next) => {
    try {

        const { error, value } = FixedSalarySchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const { id } = req.params;

        const response = await Salary.updateFixedSalary(id, value.paidAmount, value.monthOfSalary);

        if (response.affectedRows === 1) {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Paid salary was updated successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error updating paid salary!'
            })
        }

    } catch (error) {
        console.log('Error in updateFixedTypeSalary() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updatePercentageTypeSalary = async (req, res, next) => {
    try {

        const { error, value } = PercentageSalarySchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const { id } = req.params;

        const response = await Salary.updatePercentageSalary(id, value.paidAmount, value.salaryDetails);

        if (response.affectedRows === 1) {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Paid salary was updated successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error updating paid salary!'
            })
        }

    } catch (error) {
        console.log('Error in updatePercentageTypeSalary() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const payPercentageTypeSalary = async (req, res, next) => {
    try {

        const { error, value } = PercentageSalarySchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const { id } = req.params;

        const salaryInfo = await Salary.getPercSalaryInfo(id);
        const totalSalary = salaryInfo[0][0].salary;
        const employeeId = salaryInfo[0][0].employee_id;

        const response = await Salary.payPercentageSalary(id, employeeId, Number(totalSalary), value.paidAmount, value.salaryDetails);

        if (response === "Success") {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Salary was paid successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error paying salary!'
            })
        }

    } catch (error) {
        console.log('Error in payFixedTypeSalary() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllSalaryList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const search = req.query.search;
        const salaryType = (!req.query.salaryType || req.query.salaryType === undefined || req.query.salaryType.length === 0) ? null : req.query.salaryType;
        const employeeId = (!req.query.employeeId || req.query.employeeId === undefined) ? null : req.query.employeeId;

        const [salaries, _] = await Salary.getSalaryList(search, salaryType, employeeId, page, pageSize);
        const salaryCount = await Salary.getSalaryCount(search, salaryType, employeeId);

        res.status(200).json({ data: salaries, salaryCount: salaryCount[0][0].salaryCount });

    } catch (error) {
        console.log('Error in getAllSalaryList() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllPaidSalaryList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const search = req.query.search;
        const employeeId = (!req.query.employeeId || req.query.employeeId === undefined) ? null : req.query.employeeId;
        const startDate = (!req.query.startDate || req.query.startDate == 'null') ? new Date('1970-01-01') : req.query.startDate;
        const endDate = (!req.query.endDate || req.query.endDate == 'null') ? new Date() : req.query.endDate;

        const [salaries, _] = await Salary.getPaidSalaryList(search, employeeId, startDate, endDate, page, pageSize);
        const salaryCount = await Salary.getPaidSalaryCount(search, employeeId, startDate, endDate);

        res.status(200).json({ data: salaries, salaryCount: salaryCount[0][0].salaryCount });

    } catch (error) {
        console.log('Error in getAllPaidSalaryList() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getPercTypeSalaryInfo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [salary, _] = await Salary.getPercSalaryInfo(id);

        res.status(200).json({ data: salary });

    } catch (error) {
        console.log('Error in getPercTypeSalaryInfo() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getFixedTypeSalaryInfo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [salary, _] = await Salary.getFixedSalaryInfo(id);

        res.status(200).json({ data: salary });

    } catch (error) {
        console.log('Error in getFixedTypeSalaryInfo() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getPaidSalaryInfo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [salary, _] = await Salary.getPaidSalaryInformation(id);

        res.status(200).json({ data: salary });

    } catch (error) {
        console.log('Error in getPaidSalaryInfo() in SalaryController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { getAllSalaryList, getPercTypeSalaryInfo, getPaidSalaryInfo, updatePercentageTypeSalary, updateFixedTypeSalary, getFixedTypeSalaryInfo, payFixedTypeSalary, payPercentageTypeSalary, getAllPaidSalaryList };