const Employee = require('../models/EmployeeModel');
const Joi = require('joi');
const fs = require('fs');
// image Upload
const multer = require('multer')
const path = require('path')

const EmployeeSchema = Joi.object({
    name: Joi.string().trim().required().max(50),
    position: Joi.string().trim().required().valid('SEO', 'Manager', 'Consultant', 'Teacher', 'Chef', 'Guard', 'Cleaner', 'Driver'),
    gender: Joi.string().trim().required().valid('Male', 'Female'),
    phone: Joi.string().trim().required().pattern(/^[0-9\-+]+$/).max(10),
    education: Joi.string().trim().required().max(50),
    address: Joi.string().trim().max(150).allow(null), // Use `allow(null)` for optional fields
    categoryId: Joi.string().trim().required(),
    branchId: Joi.string().trim().required(),
    paymentType: Joi.string().trim().required().valid('Fixed', 'Percentage'),
    paymentValue: Joi.number().required().max(999999999),
    image: Joi.any(),
    file: Joi.any(),
});

// Multer configuration for storing uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/images/employees')
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


const addEmployee = async (req, res, next) => {
    try {
        const { error, value } = EmployeeSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            });
        }

        // Access the uploaded image path from req.file
        const imagePath = req.file ? req.file.path : null;

        // Call the createEmployee function with the image path
        const response = await Employee.createEmployee(value.name, value.position, value.gender, value.phone, value.education, value.address, imagePath, value.paymentType, value.paymentValue, value.categoryId, value.branchId);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Employee record created successfully!'
            });
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error creating Employee record!'
            });

        }
    } catch (error) {
        console.error('Error in addEmployee() in EmployeeController:', error);
        next(error);
        return res.status(500).json({ statusCode: 500, msg: error });
    }
};

const getAllEmployees = async (req, res, next) => {
    try {
        const [employees, _] = await Employee.getEmployees();
        res.status(200).json({ employees })

    } catch (error) {
        console.log('Error in getAllEmployees() in EmployeesController:', error);
        next(error);
        return res.status(500).json({ msg: 'Internal server error!' });
    }
}

const getEmployeesByBranch = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [employees, _] = await Employee.getEmployeesByBranch(id);
        res.status(200).json({ employees })

    } catch (error) {
        console.log('Error in getEmployeesByBranch() in EmployeesController:', error);
        next(error);
        return res.status(500).json({ msg: 'Internal server error!' });
    }
}

const getAllActiveTeacherEmployeesByBranch = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [teachers, _] = await Employee.getTeacherEmployeesByBranch(id);
        res.status(200).json({ teachers })

    } catch (error) {
        console.log('Error in getAllActiveTeacherEmployeesByBranch() in EmployeesController:', error);
        next(error);
        return res.status(500).json({ msg: 'Internal server error!' });
    }
}

const getAllActiveEmployees = async (req, res, next) => {
    try {
        const [employees, _] = await Employee.getActiveEmployees();
        res.status(200).json({ data: employees })

    } catch (error) {
        console.error('Error in getAllActiveEmployees() in EmployeeController:', error);
        next(error);
        return res.status(500).json({ statusCode: 500, msg: error });
    }
}

const getAllActiveTeacherEmployees = async (req, res, next) => {
    try {
        const [teachers, _] = await Employee.getActiveTeacherEmployees();
        res.status(200).json({ data: teachers })

    } catch (error) {
        console.error('Error in getAllActiveTeacherEmployees() in EmployeeController:', error);
        next(error);
        return res.status(500).json({ statusCode: 500, msg: error });
    }
}

const getAllEmployeeList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const filter = req.query.filter;
        const isActive = (!req.query.isActive || JSON.parse(req.query.isActive) === undefined || req.query.isActive.length === 0) ? null : JSON.parse(req.query.isActive);
        const search = req.query.search;
        const branchId = (!req.query.branchId || req.query.branchId === undefined) ? null : req.query.branchId;
        const selectedField = (!req.query.selectedField || req.query.selectedField === undefined || req.query.selectedField.length === 0) ? null : req.query.selectedField;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;

        const [employees, _] = await Employee.getEmployeesList(filter, isActive, search, branchId, selectedField, searchedValue, page, pageSize);
        const employeeCount = await Employee.getEmployeeCount(filter, isActive, search, branchId, selectedField, searchedValue);

        res.status(200).json({ data: employees, employeeCount: employeeCount[0][0].employeeCount });

    } catch (error) {
        console.log('Error in getAllEmployeeList() in EmployeeController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const getAllPercentageTypeEmployess = async (req, res, next) => {
    try {
        const {id} = req.params;

        const [employees, _] = await Employee.getPercentageTypeEmployess(id);

        res.status(200).json({ data: employees });

    } catch (error) {
        console.log('Error in getAllPercentageTypeEmployess() in EmployeeController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const getAllFixedTypeEmployess = async (req, res, next) => {
    try {
        const {id} = req.params;

        const [employees, _] = await Employee.getFixedTypeEmployess(id);

        res.status(200).json({ data: employees });

    } catch (error) {
        console.log('Error in getAllPercentageTypeEmployess() in EmployeeController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const getEmployeeInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [employeeInfo, _] = await Employee.getEmployeeInfo(id);

        res.status(200).json({ data: employeeInfo });

    } catch (error) {
        console.log('Error in getEmployeeInformation() in EmployeeController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error!' });
    }
}

const activateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Employee.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Employee record activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate employee record!' });
        }

    } catch (error) {
        console.log('Error in activateEmployee() in EmployeeController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Employee.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Employee record deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate employee record!' });
        }

    } catch (error) {
        console.log('Error in deactivateEmployee() in EmployeeController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const updateEmployeeInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = EmployeeSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        // Access the uploaded image path from req.file
        const imagePath = req.file ? req.file.path : null;

        // If the record is updated successfully, delete the previous image
        const previousImage = await Employee.getEmployeeImagePath(id);

        const response = await Employee.updateEmployee(id, value.name, value.position, value.gender, value.phone, value.education, value.address, imagePath, value.paymentType, value.paymentValue, value.categoryId, value.branchId);

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
                msg: 'Employee record updated successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error updating employee record!'
            })
        }

    } catch (error) {
        console.log('Error in updateEmployeeInformation() in EmployeeController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Error updating employee record!'
        })
    }
}

module.exports = { addEmployee, getAllEmployees, getAllEmployeeList, getAllActiveTeacherEmployeesByBranch, getAllPercentageTypeEmployess, getAllFixedTypeEmployess, getEmployeeInformation, getAllActiveEmployees, updateEmployeeInformation, activateEmployee, deactivateEmployee, uploadImage, getEmployeesByBranch, getAllActiveTeacherEmployees };