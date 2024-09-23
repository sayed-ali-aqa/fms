const db = require('../config/db');

class Product {
    static async createProduct(title, price, description, imagePath) {

        const sql = `INSERT INTO products
            (title, price, description, image) 
            VALUES(?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [title, price, description, imagePath]);

        return result;
    }
}

module.exports = Product;