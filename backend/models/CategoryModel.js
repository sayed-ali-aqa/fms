const db = require('../config/db');

class Category {
    static async createCategory(category) {
        const sql = `INSERT INTO categories (category) VALUES(?)`;
        const [result] = await db.execute(sql, [category]);

        return result;
    }

    static getActiveCategories() {
        const sql = 'SELECT category_id, category FROM categories WHERE is_active = true';
        return db.execute(sql);
    }

    static getAllCategories() {
        const sql = 'SELECT category_id, category FROM categories';
        return db.execute(sql);
    }

    static getCategoryInfo(id) {
        const sql = `
            SELECT category_id, category, created_at, updated_at
            FROM categories
            WHERE category_id = ?    
        `;

        return db.execute(sql, [id]);
    }

    static getCategoryList(filter, isActive, search, searchedValue, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `
            SELECT * FROM categories
            WHERE is_active = ?
            ORDER BY category_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);
        } else if (search && search === 'active' && searchedValue !== null) {
            const sql = `
            SELECT * FROM categories
            WHERE category LIKE UPPER(?)
            ORDER BY category_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else {
            const sql = `
            SELECT * FROM categories
            ORDER BY category_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getCategoryCount(filter, isActive, search, searchedValue) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(category_id) AS categoryCount 
            FROM categories
            WHERE is_active = ?`;

            return db.execute(sql, [isActive]);
        }
        else if (search && search === 'active' && searchedValue !== null) {
            const sql = `SELECT COUNT(category_id) AS categoryCount 
            FROM categories
            WHERE category LIKE UPPER(?)`;

            return db.execute(sql, [searchedValue]);
        }
        else {
            const sql = `SELECT COUNT(category_id) AS categoryCount FROM categories`;

            return db.execute(sql);
        }
    }

    static async existedCategoryCount(category) {
        const sql = 'SELECT COUNT(category_id) AS categoryCount FROM categories WHERE category = ?';
        const [result] = await db.execute(sql, [category]);

        return result;
    }

    static async categoryNameTakenCount(id, category) {
        const sql = 'SELECT COUNT(category_id) AS categoryNameTakenCount FROM categories WHERE category = ? AND category_id != ?';
        const [result] = await db.execute(sql, [category, id]);

        return result;
    }

    static async activate(id) {
        const sql = 'UPDATE categories SET is_active = true WHERE category_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE categories SET is_active = false WHERE category_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async updateCategory(id, category) {
        const sql = `Update categories SET category = ?
            WHERE category_id = ? AND is_active = true`;

        const [result] = await db.execute(sql, [category, id]);
        return result;
    }

}

module.exports = Category;