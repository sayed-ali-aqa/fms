const Manager = require('../models/ManagerModel');
const Joi = require('joi');
const fs = require('fs');
// image Upload
const multer = require('multer')
const path = require('path')

const ManagerSchema = Joi.object({
    name: Joi.string().trim().required().max(30),
    phone: Joi.string().trim().required().pattern(/^[0-9\-+]+$/).max(20),
    email: Joi.string().trim().email().required().max(150),
    image: Joi.any(),
    file: Joi.any(),
});

// Multer configuration for storing uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/images/managers')
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

const addManager = async (req, res, next) => {
    try {
        const { error, value } = ManagerSchema.validate({ ...req.body });

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const result = await Manager.existedManagerCount(value.email);
        const managerCount = result[0].managerCount;

        if (managerCount > 0) {
            return res.status(204).json({ statusCode: 204, msg: 'The email already exists!' })
        }

        // Access the uploaded image path from req.file
        const imagePath = req.file ? req.file.path : null;

        const response = await Manager.createManager(value.name, value.phone, value.email, imagePath);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Manager record created successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error creating manager record!'
            })
        }

    } catch (error) {
        console.log('Error in addManager() in ManagerController:', error);
        next(error);

        return res.status(500).json({
            statusCode: 500,
            msg: 'Internal server error!'
        })
    }
}

const getAllManagerList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const filter = req.query.filter;
        const isActive = (!req.query.isActive || JSON.parse(req.query.isActive) === undefined || req.query.isActive.length === 0) ? null : JSON.parse(req.query.isActive);
        const search = req.query.search;
        const selectedField = (!req.query.selectedField || req.query.selectedField === undefined || req.query.selectedField.length === 0) ? null : req.query.selectedField;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;

        const [managers, _] = await Manager.getManagersList(filter, isActive, search, selectedField, searchedValue, page, pageSize);
        const managerCount = await Manager.getManagerCount(filter, isActive, search, selectedField, searchedValue);

        res.status(200).json({ data: managers, managerCount: managerCount[0][0].managerCount });

    } catch (error) {
        console.log('Error in getAllManagerList() in ManagerController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllManagers = async (req, res, next) => {
    try {
        const [managers, _] = await Manager.getAllManagers();
        res.status(200).json({ managers });

    } catch (error) {
        console.log('Error in getAllManagers() in ManagerController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getManagers = async (req, res, next) => {
    try {
        const [managers, _] = await Manager.getManagers();
        res.status(200).json({ managers });

    } catch (error) {
        console.log('Error in getManagers() in ManagerController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getManagerInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [managerInfo, _] = await Manager.getManagerInfo(id);

        res.status(200).json({ data: managerInfo });

    } catch (error) {
        console.log('Error in getManagerInformation() in ManagerController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const updateManagerInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = ManagerSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const result = await Manager.managerEmailTakenCount(id, value.email);
        const managerEmailTakenCount = result[0].managerEmailTakenCount;

        if (managerEmailTakenCount > 0) {
            return res.status(204).json({ statusCode: 204, msg: 'The email already exists!' })
        }

        // Access the uploaded image path from req.file
        const imagePath = req.file ? req.file.path : null;

        // If the record is updated successfully, delete the previous image
        const previousImage = await Manager.getManagerImagePath(id);

        const response = await Manager.updateManager(id, value.name, value.phone, value.email, imagePath);

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
                msg: 'Manager record updated successfully!'
            })
        } else {
            return res.status(500).json({
                msg: 'Error updating manager record!'
            })
        }

    } catch (error) {
        console.log('Error in updateManagerInformation() in Manager Controller:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const activateManager = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Manager.activateAccount(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Manager account activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate Manager account!' });
        }

    } catch (error) {
        console.log('Error in activateManager() in ManagerController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateManager = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Manager.deactivateAccount(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Manager account deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate Manager account!' });
        }

    } catch (error) {
        console.log('Error in deactivateManager() in ManagerController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { addManager, getManagers, getAllManagers, getAllManagerList, uploadImage, getManagerInformation, updateManagerInformation, activateManager, deactivateManager };