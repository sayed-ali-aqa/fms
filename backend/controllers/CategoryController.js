const Category = require('../models/CategoryModel');
const Joi = require('joi');

// validation schema
const categorySchema = Joi.object({
    category: Joi.string().trim().required().max(30)
})

const addCategory = async (req, res, next) => {
    try {
        const { error, value } = categorySchema.validate({ ...req.body });

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const result = await Category.existedCategoryCount(value.category);
        const categoryCount = result[0].categoryCount;

        if (categoryCount > 0) {
            return res.status(204).json({ statusCode: 204, msg: 'The category already exists!' })
        }

        const response = await Category.createCategory(value.category);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Category record created successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Failed to create category record!'
            })
        }

    } catch (error) {
        console.log('Error in addCategory() in CategoryController:', error);
        next(error);

        return res.status(500).json({
            statusCode: 500,
            msg: 'Internal server error!'
        })
    }
}

const getAllCategories = async (req, res, next) => {
    try {
        const [categories, _] = await Category.getAllCategories();

        res.status(200).json({ categories });
    } catch (error) {
        console.log('Error in getAllCategories() in CategoryController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error!' });
    }
}

const getActiveCategories = async (req, res, next) => {
    try {
        const [categories, _] = await Category.getActiveCategories();

        res.status(200).json({ categories });
    } catch (error) {
        console.log('Error in getActiveCategories() in CategoryController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error!' });
    }
}

const getCategoryInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [categoryInfo, _] = await Category.getCategoryInfo(id);
        res.status(200).json({ data: categoryInfo });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllCategoryList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const filter = req.query.filter;
        const isActive = (!req.query.isActive || JSON.parse(req.query.isActive) === undefined || req.query.isActive.length === 0) ? null : JSON.parse(req.query.isActive);
        const search = req.query.search;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;

        const [categories, _] = await Category.getCategoryList(filter, isActive, search, searchedValue, page, pageSize);
        const categoryCount = await Category.getCategoryCount(filter, isActive, search, searchedValue);

        res.status(200).json({ data: categories, categoryCount: categoryCount[0][0].categoryCount });
    } catch (error) {
        console.log('Error in error getAllCategoryList() in CategoryController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const updateCategoryInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = categorySchema.validate({ ...req.body });

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const result = await Category.categoryNameTakenCount(id, value.category);
        const categoryNameTakenCount = result[0].categoryNameTakenCount;

        if (categoryNameTakenCount > 0) {
            return res.status(204).json({ statusCode: 204, msg: 'The category name already exists!' })
        }

        const response = await Category.updateCategory(id, value.category);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Category record updated successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error updating Ccategory record!'
            })
        }

    } catch (error) {
        console.log('Error in updateCategoryInformation() in CategoryController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const activateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Category.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Category activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate category!' });
        }

    } catch (error) {
        console.log('Error in activateCategory() in CategoryController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(id);

        const response = await Category.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Category deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate category!' });
        }

    } catch (error) {
        console.log('Error in deactivateCategory() in CategoryController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { addCategory, getAllCategories, getActiveCategories, getAllCategoryList, getCategoryInformation, updateCategoryInformation, activateCategory, deactivateCategory };