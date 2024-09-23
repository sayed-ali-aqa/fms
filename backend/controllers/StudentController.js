const Student = require('../models/StudentModel');
const Joi = require('joi');
const fs = require('fs');
// image Upload
const multer = require('multer')
const path = require('path')

const StudentSchema = Joi.object({
    name: Joi.string().trim().required().max(50),
    fatherName: Joi.string().trim().required().max(50),
    gender: Joi.string().trim().required().valid('Male', 'Female'),
    education: Joi.string().trim().required().max(20),
    dob: Joi.string().allow(null),
    phone: Joi.string().trim().required().pattern(/^[0-9\-+]+$/).max(10),
    address: Joi.string().trim().max(150).allow(null), // Use `allow(null)` for optional fields
    image: Joi.any(),
    file: Joi.any(),
});

// Multer configuration for storing uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/images/students')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize Multer with the configured storage and file filter
const uploadImage = multer({
    storage: storage,
    limits: { fileSize: '2000000' }, // Adjust the file size limit as needed
    fileFilter: (req, file, cb) => {
        if (!file) {
            // If no file is uploaded, continue without error
            cb(null, true);
        } else {
            // Validate file type if a file is uploaded
            const fileTypes = /jpeg|jpg|png|gif/;
            const mimeType = fileTypes.test(file.mimetype);
            const extname = fileTypes.test(path.extname(file.originalname));

            if (mimeType && extname) {
                cb(null, true); // Allow file upload
            } else {
                cb(new Error('Only image files are allowed!'), false); // Reject file upload
            }
        }
    }
}).single('image');

const addStudent = async (req, res, next) => {
    try {
        const { error, value } = StudentSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        // Access the uploaded image path from req.file
        const imagePath = req.file ? req.file.path : null;

        const response = await Student.createStudent(value.name, value.fatherName, value.gender, value.education, value.dob, value.phone, value.address, imagePath);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Student record created successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error creating student record!'
            })
        }

    } catch (error) {
        console.log(error);
        next(error);

        return res.status(500).json({
            statusCode: 500,
            msg: 'Error creating student record!'
        })
    }
}

const getAllStudentList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const search = req.query.search;
        const selectedField = (!req.query.selectedField || req.query.selectedField === undefined || req.query.selectedField.length === 0) ? null : req.query.selectedField;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;

        const [students, _] = await Student.getStudentList(search, selectedField, searchedValue, page, pageSize);
        const studentCount = await Student.getStudentCount(search, selectedField, searchedValue);

        res.status(200).json({ data: students, studentCount: studentCount[0][0].studentCount });

    } catch (error) {
        console.log('Error in in StudentController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getStudentInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [studentInfo, _] = await Student.getStudentInfo(id);
        res.status(200).json({ data: studentInfo });

    } catch (error) {
        console.log('Error in getStudentInformation() in StudentController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllStudentCount = async (req, res, next) => {
    try {
        const [studentCount, _] = await Student.getStudentCount();
        res.status(200).json({ data: studentCount });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateStudentInformation = async (req, res, next) => {

    try {
        const { id } = req.params;

        const { error, value } = StudentSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        // If the record is updated successfully, delete the previous image
        const previousImage = await Student.getStudentImagePath(id);

        // Access the uploaded image path from req.file
        const imagePath = req.file ? req.file.path : null;

        const response = await Student.updateStudent(id, value.name, value.fatherName, value.gender, value.education, value.dob, value.phone, value.address, imagePath);

        if (response.affectedRows === 1) {
            if (imagePath !== null && previousImage[0][0].photo !== null) {
                const imagePath = previousImage[0][0].photo;

                // Remove the previous image file
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Error deleting previous image:', err);
                        next(err);
                    } else {
                        console.log('Previous image deleted successfully');
                        next('Previous image deleted successfully');
                    }
                });
            }

            return res.status(200).json({
                statusCode: 200,
                msg: 'Student record updated successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error updating student record!'
            })
        }

    } catch (error) {
        console.log('Error in updateStudentInformation() in StudentController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Error updating student record!'
        })
    }
}

module.exports = { addStudent, getAllStudentList, getStudentInformation, uploadImage, getAllStudentCount, updateStudentInformation };