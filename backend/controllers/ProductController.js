const Product = require('../models/ProductModel');
// const Joi = require('joi');

// image Upload
const multer = require('multer')
const path = require('path')

// const ProductSchema = Joi.object({
//     title: Joi.string().trim().required().max(200),
//     price: Joi.number().required().max(10),
//     description: Joi.string().required(),
//     image: Joi.string().required()
// });


const addProduct = async (req, res, next) => {
    try {
        // const { error, value } = ProductSchema.validate(req.body);

        // if (error) {
        //     return res.status(400).json({
        //         statusCode: 400,
        //         msg: error.details[0].message
        //     })
        // }

        const title = req.body.title;
        const price = req.body.price;
        const description = req.body.description;
        const imagePath = req.file.path;

        const response = await Product.createProduct(title, price, description, imagePath);

        if (response.affectedRows === 1) {
            return res.status(201).json({
                statusCode: 201,
                msg: 'Product record created successfully!'
            })
        } else {
            return res.status(500).json({
                statusCode: 500,
                msg: 'Error creating Product record!'
            })
        }

    } catch (error) {
        console.log('Error in addProduct() in ProductController: ', error);
        next(error);

        return res.status(500).json({
            msg: error
        })
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/images/teachers')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: '1000000' }, 
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/
        const mimeType = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname))

        if (mimeType && extname) {
            return cb(null, true)
        }
        cb('Give proper files formate to upload')
    }
}).single('image');

module.exports = { addProduct, upload };