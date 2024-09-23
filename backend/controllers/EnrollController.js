const Enroll = require('../models/EnrollModel');
const Joi = require('joi');

const EnrollSchema = Joi.object({
    received: Joi.number().required().min(0).max(99999),
    due: Joi.number().allow(null).min(0).max(99999),
    discount: Joi.number().allow(null).min(0).max(99999),
    classId: Joi.number().required(),
    studentId: Joi.number().required(),
});

const UpdateEnrollSchema = Joi.object({
    received: Joi.number().required().min(0).max(99999),
    due: Joi.number().allow(null).min(0).max(99999),
    discount: Joi.number().allow(null).min(0).max(99999),
    classId: Joi.number().required(),
});

const enrollStudent = async (req, res, next) => {
    try {
        const { error, value } = EnrollSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Enroll.enroll(value.studentId, value.received, value.due, value.discount, value.classId);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Student enrolled successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error enrolling student!'
            })
        }

    } catch (error) {
        console.log('Erorr in enrollStudent() in EnrollController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const getAllEnrollList = async (req, res, next) => {
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

        const [enrolls, _] = await Enroll.getEnrollList(filter, isActive, search, selectedField, searchedValue, startDate, endDate, page, pageSize);
        const enrollCount = await Enroll.getEnrollCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate);

        res.status(200).json({ data: enrolls, enrollCount: enrollCount[0][0].enrollCount });

    } catch (error) {
        console.log('Error in getAllEnrollList() in EnrollController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getEnrolledInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [enrolledInfo, _] = await Enroll.getEnrolledInfo(id);

        res.status(200).json({ data: enrolledInfo });

    } catch (error) {
        console.log('Error in getEnrolledInformation() in EnrollController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllEnrollCount = async (req, res, next) => {
    try {
        const [enrollCount, _] = await Enroll.getEnrollCount();
        res.status(200).json({ data: enrollCount });
        // console.log(enrollCount);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateEnroll = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = UpdateEnrollSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Enroll.updateEnroll(id, value.received, value.due, value.discount, value.classId);

        if (response.affectedRows === 1) {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Enroll record updated successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error updating enroll record!'
            })
        }

    } catch (error) {
        console.log('Erorr in updateEnroll() in EnrollController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const activateEnroll = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Enroll.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Enroll record activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate enroll record!' });
        }

    } catch (error) {
        console.log('Error in activateEnroll() in EnrollController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateEnroll = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Enroll.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Enroll record deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate enroll record!' });
        }

    } catch (error) {
        console.log('Error in deactivateEnroll() in EnrollController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { enrollStudent, getAllEnrollList, getEnrolledInformation, updateEnroll, getAllEnrollCount, activateEnroll, deactivateEnroll };