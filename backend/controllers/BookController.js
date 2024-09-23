const Book = require('../models/BookModel');
const Joi = require('joi');

const BookSchema = Joi.object({
    title: Joi.string().trim().required().max(50),
    author: Joi.string().trim().required().max(150),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    branchId: Joi.number().required(),
    categoryId: Joi.number().required(),
});

const BookSaleSchema = Joi.object({
    buyerInfo: Joi.string().trim().required().max(100),
    received: Joi.number().required().min(0).max(99999),
    quantity: Joi.number().required().min(1).max(99),
    discount: Joi.number().allow(null).max(99999),
    due: Joi.number().allow(null).max(99999),
    bookId: Joi.number().required(),
})

const BookSaleUpdateSchema = Joi.object({
    buyerInfo: Joi.string().trim().required().max(100),
    received: Joi.number().required().min(0).max(99999),
    quantity: Joi.number().required().min(1).max(99),
    discount: Joi.number().allow(null).max(99999),
    due: Joi.number().allow(null).max(99999),
})

const addBook = async (req, res, next) => {
    try {
        const { error, value } = BookSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Book.createBook(value.title, value.author, value.price, value.quantity, value.categoryId, value.branchId);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Book record created successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error creating book record!'
            })
        }

    } catch (error) {
        console.log('Error in addBook() in BooksController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const sellBook = async (req, res, next) => {
    try {
        const { error, value } = BookSaleSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Book.sellBook(value.bookId, value.buyerInfo, value.received, value.discount, value.due, value.quantity);

        if (response === "Success") {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Book sale record created successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error creating book sale record!'
            })
        }

    } catch (error) {
        console.log('Error in sellBook() in BooksController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Internal server error!'
        })
    }
}

const getAllBookList = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;

        const search = req.query.search;
        const branchId = (!req.query.branchId || req.query.branchId === undefined) ? null : req.query.branchId;
        const selectedField = (!req.query.selectedField || req.query.selectedField === undefined || req.query.selectedField.length === 0) ? null : req.query.selectedField;
        const searchedValue = (!req.query.searchedValue || req.query.searchedValue === undefined || req.query.searchedValue.length === 0) ? null : req.query.searchedValue;

        const [books, _] = await Book.getBooksList(search, branchId, selectedField, searchedValue, page, pageSize);
        const bookCount = await Book.getBookCount(search, branchId, selectedField, searchedValue);

        res.status(200).json({ data: books, bookCount: bookCount[0][0].bookCount });

    } catch (error) {
        console.log('Error in getAllBookList() in BooksController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllBookSalesList = async (req, res, next) => {
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

        const [bookSales, _] = await Book.getBookSalesList(filter, isActive, search, selectedField, searchedValue, startDate, endDate, page, pageSize);
        const bookSaleCount = await Book.getBookSalesCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate);

        res.status(200).json({ data: bookSales, bookSaleCount: bookSaleCount[0][0].bookSaleCount });

    } catch (error) {
        console.log('Error in getAllBookSalesList() in BooksController:', error);
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getBookInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [bookInfo, _] = await Book.getBookInfo(id);
        res.status(200).json({ data: bookInfo });

    } catch (error) {
        console.log('Error in getBookInformation() in BooksController:', error);
        next(error);

        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getBookSaleInformation = async (req, res, next) => {
    try {
        const id = req.params.id;

        const [bookSaleInfo, _] = await Book.getBookSaleInfo(id);

        res.status(200).json({ data: bookSaleInfo });

    } catch (error) {
        console.log('Error in getBookSaleInformation() in BooksController:', error);
        next(error);

        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateBookInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = BookSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            })
        }

        const response = await Book.updateBook(id, value.title, value.author, value.price, value.quantity, value.categoryId, value.branchId);

        if (response.affectedRows === 1) {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Book record updated successfully!'
            })
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error updating book record!'
            })
        }

    } catch (error) {
        console.log('Error in updateBookInformation() in BooksController:', error);
        next(error);

        return res.status(500).json({
            msg: 'Error updating book record!'
        })
    }
}

const updateBookSaleInformation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = BookSaleUpdateSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                statusCode: 400,
                msg: error.details[0].message
            });
        }

        const quantityCheck = await Book.getPreviousQuantity(id);
        const previousQuantity = quantityCheck[0][0].previousQuantity;

        const response = await Book.updateBookSale(id, value.buyerInfo, value.received, value.discount, value.due, value.quantity, previousQuantity);

        if (response === "Success") {
            return res.status(200).json({
                statusCode: 200,
                msg: 'Book sale record updated successfully!'
            });
        } else {
            return res.status(400).json({
                statusCode: 400,
                msg: 'Error updating book sale record!'
            });
        }

    } catch (error) {
        console.log('Error in updateBookSaleInformation() in BooksController:', error);
        next(error); // Rethrow the error or handle it appropriately

        return res.status(500).json({
            msg: 'Error updating book sale record!'
        });
    }
}

const activateBookSale = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Book.activate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Book sale record activated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to activate book sale  record!' });
        }

    } catch (error) {
        console.log('Error in activateBookSale() in BookController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

const deactivateBookSale = async (req, res, next) => {
    try {
        const { id } = req.params;

        const response = await Book.deactivate(id);

        if (response.affectedRows === 1) {
            return res.status(200).json({ statusCode: 200, msg: 'Book sale record deactivated successfully!' });
        } else {
            return res.status(400).json({ statusCode: 400, msg: 'Failed to deactivate book sale record!' });
        }

    } catch (error) {
        console.log('Error in deactivateBookSale() in BookController:', error);
        next(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

module.exports = { addBook, getAllBookList, getBookInformation, sellBook, getBookSaleInformation, updateBookInformation, updateBookSaleInformation, getAllBookSalesList, activateBookSale, deactivateBookSale };