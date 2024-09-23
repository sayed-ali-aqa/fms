const Class = require('../models/ClassModel');
const Joi = require('joi');

const ClassSchema = Joi.object({
    name: Joi.string().trim().required("Class name is required!").max(50),
    startTime: Joi.string().trim().required("Start Time is required!"),
    endTime: Joi.string().trim().required("End Time is required!"),
    branchId: Joi.string().trim().required("Branch is required!"),
    employeeId: Joi.string().trim().required("Teacher is required!"),
    subjectId: Joi.string().trim().required("Subject is required!"),
    fee: Joi.number().required().min(0).max(99999),
    startDate: Joi.string().trim().required("Start Date is required!"),
    endDate: Joi.string().trim().required("End Date is required!"),
    classRoomNo: Joi.number().min(0).max(9999),
    classDays: Joi.string().valid("Everyday", "Even Days", "Odd Days"),
});


const addClass = async (req, res, next) => {
    try {
        const { error, value } = ClassSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Class.createClass(value.name, value.startTime, value.endTime, value.branchId, value.employeeId, value.subjectId, value.fee, value.startDate, value.endDate, value.classRoomNo, value.classDays);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Class record created successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error creating class record!'
            })
        }

    } catch (error) {
        console.log('Error in addClass() in ClassController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const getAllClassList = async (req, res, next) => {

    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const filter = req.query.filter;
        const isActive = (!req.query.isActive || JSON.parse(req.query.isActive) === undefined || req.query.isActive.length === 0) ? null : JSON.parse(req.query.isActive);
        const search = req.query.search;
        const branchId = (!req.query.branchId || req.query.branchId === undefined) ? null : req.query.branchId;
        const selectedField = (!req.query.selectedField || req.query.selectedField === undefined || req.query.selectedField.length === 0) ? null : req.query.selectedField;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;

        const [classes, _] = await Class.getClassList(filter, isActive, search, branchId, selectedField, searchedValue, page, pageSize);
        const classCount = await Class.getClassCount(filter, isActive, search, branchId, selectedField, searchedValue);

        res.status(200).json({ classData: classes, classCount: classCount[0][0].classCount });

    } catch (error) {
        console.log('Error in getAllClassList() in ClassContorller:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllClasses = async (req, res, next) => {
    try {
        const [classes, _] = await Class.getClasses();

        res.status(200).json({ data: classes });

    } catch (error) {
        console.log('Error in getAllClasses() in ClassContorller:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getActiveClasses = async (req, res, next) => {

    try {
        const [classes, _] = await Class.getClasses();

        res.status(200).json({ data: classes });

    } catch (error) {
        console.log('Error in getActiveClasses() in ClassContorller:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getClassInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [classInfo, _] = await Class.getClassInfo(id);
        res.status(200).json({ data: classInfo });

    } catch (error) {
        console.log('Error in getClassInformation() ClassController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllClassCount = async (req, res, next) => {
    try {
        const filter = req.query.filter;
        const time = req.query.time;
        const branchId = parseInt(req.query.branchId);
        const employeeId = parseInt(req.query.employeeId);
        const categoryId = parseInt(req.query.categoryId);

        const [classCount, _] = await Class.getClassCount(filter, branchId, employeeId, categoryId);
        res.status(200).json({ data: classCount });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateClassInformation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Validate the incoming data
        const { error, value } = ClassSchema.validate({
            name: data.name,
            startTime: data.start_time,
            endTime: data.end_time,
            branchId: String(data.branchId),
            employeeId: String(data.employeeId),
            subjectId: String(data.subjectId),
            fee: data.fee,
            startDate: data.start_date,
            endDate: data.end_date,
            classRoomNo: data.class_room_no,
            classDays: data.class_days
        });

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            });
        }

        // Update class information in the database
        const response = await Class.updateClass(id, value);

        if (response.affectedRows === 1) {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Class record updated successfully!'
            });
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error updating class record!'
            });
        }
    } catch (error) {
        console.log('Error in updateClassInformation() ClassController:', error);
        next(error);
        return res.status(500).json({
            statusCode: 500,
            msg: 'Internal server error!'
        });
    }
};

const getTimeList = async (req, res, next) => {
    try {
        const [times, _] = await Class.getTimes();
        return res.status(200).json({
            times
        })

    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: 'Error fetching times'
        })
    }
}

const activateClass = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Class.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Class record activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate class record!' });
        }

    } catch (error) {
        console.log('Error in activateClass() in ClassController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateClass = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Class.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Class reocrd deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate class reocrd!' });
        }

    } catch (error) {
        console.log('Error in deactivateClass() in ClassController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { addClass, getAllClassList, getClassInformation, getAllClassCount, getAllClasses, getActiveClasses, updateClassInformation, getTimeList, activateClass, deactivateClass };