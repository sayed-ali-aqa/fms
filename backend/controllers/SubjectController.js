const Subject = require('../models/SubjectModel');
const Joi = require('joi');

const SubjectSchema = Joi.object({
    subject: Joi.string().trim().required().max(50),
    categoryId: Joi.string().trim().required(),
})


const addSubject = async (req, res, next) => {
    try {

        const { error, value } = SubjectSchema.validate(req.body);

        console.log(error);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const result = await Subject.existedSubjectCount(value.subject);
        const subjectCount = result[0].subjectCount;

        if (subjectCount > 0) {
            return res.status(204).json({ statusCode: 204, msg: 'Subject name already exists!' })
        }

        const response = await Subject.createSubject(value.subject, value.categoryId);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Subject record created successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error creating subject record!'
            })
        }

    } catch (error) {
        console.log('Error in addSubject in SubjectController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const getAllSubjectList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const filter = req.query.filter;
        const isActive = (!req.query.isActive || JSON.parse(req.query.isActive) === undefined || req.query.isActive.length === 0) ? null : JSON.parse(req.query.isActive);
        const search = req.query.search;
        const selectedField = (!req.query.selectedField || req.query.selectedField === undefined || req.query.selectedField.length === 0) ? null : req.query.selectedField;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;

        const [subjects, _] = await Subject.getSubjectList(filter, isActive, search, selectedField, searchedValue, page, pageSize);
        const subjectCount = await Subject.getSubjectCount(filter, isActive, search, selectedField, searchedValue);

        res.status(200).json({ data: subjects, subjectCount: subjectCount[0][0].subjectCount });

    } catch (error) {
        console.log('Error in getAllSubjectList() in SubjectController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllActiveSubjects = async (req, res, next) => {
    try {
        const [subjects, _] = await Subject.getActiveSubjects();

        res.status(200).json({ data: subjects });

    } catch (error) {
        console.log('Error in getAllActiveSubjects() in SubjectController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getSubjectInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [subjectInfo, _] = await Subject.getSubjectInfo(id);
        res.status(200).json({ data: subjectInfo });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateSubjectInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = SubjectSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const result = await Subject.subjectNameTakenCount(id, value.subject);
        const subjectNameTakenCount = result[0].subjectNameTakenCount;

        if (subjectNameTakenCount > 0) {
            return res.status(204).json({ statusCode: 204, msg: 'Subject name already exists!' })
        }

        const response = await Subject.updateSubject(id, value.subject, value.categoryId);

        if (response.affectedRows === 1) {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Subject record updated successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error updating subject record!'
            })
        }

    } catch (error) {
        console.log('Error in updateSubjectInformation() in SubjectController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Error updating subject record!'
        })
    }
}

const activateSubject = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Subject.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Subject record activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate Subject record!' });
        }

    } catch (error) {
        console.log('Error in activateSubject() in SubjectController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateSubject = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Subject.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Subject record deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate Subject record!' });
        }

    } catch (error) {
        console.log('Error in deactivateSubject() in SubjectController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { addSubject, getAllSubjectList, getSubjectInformation, updateSubjectInformation, getAllActiveSubjects, activateSubject, deactivateSubject };