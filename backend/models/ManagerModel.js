const db = require('../config/db');
const crypto = require('crypto');

// random password generator
function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

class Manager {
    static async createManager(name, phone, email, imagePath) {
        const randomPassword = generateRandomPassword(6);

        const sql = `INSERT INTO users
            (name, phone, email, password, photo) 
            VALUES(?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [name, phone, email, randomPassword, imagePath]);

        return result;
    }

    static getManagersList(filter, isActive, search, selectedField, searchedValue, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `
            SELECT users.user_id, name, phone, branch, users.is_active 
            FROM users 
            JOIN branches ON users.user_id = branches.user_id
            WHERE users.role = 'MANAGER'
            AND
            (users.is_active = ?)
            ORDER BY users.user_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);
        } else if (search && search === 'active' && (selectedField === 'name' || selectedField === 'phone' || selectedField === 'email') && searchedValue !== null) {
            const sql = `
            SELECT users.user_id, name, phone, branch, users.is_active 
            FROM users 
            JOIN branches ON users.user_id = branches.user_id
            WHERE users.role = 'MANAGER'
            AND
            (${selectedField} LIKE UPPER(?))
            ORDER BY users.user_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }

        else {
            const sql = `
            SELECT users.user_id, name, phone, branch, users.is_active 
            FROM users 
            JOIN branches ON users.user_id = branches.user_id
            WHERE users.role = 'MANAGER'
            ORDER BY users.user_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getManagers() {
        const sql = `
            SELECT users.user_id, name 
            FROM users 
            LEFT JOIN branches ON users.user_id = branches.user_id
            WHERE branches.user_id IS NULL
            AND users.role = 'MANAGER'
            ORDER BY users.user_id ASC`;

        return db.execute(sql);
    }

    static getAllManagers() {
        const sql = `
            SELECT users.user_id, name 
            FROM users 
            LEFT JOIN branches ON users.user_id = branches.user_id
            AND users.role = 'MANAGER'
            ORDER BY users.user_id ASC`;

        return db.execute(sql);
    }

    static getManagerInfo(id) {
        const sql = `
            SELECT users.user_id, name, gender, phone, branch_id, branch, email, photo, users.created_at, users.updated_at 
            FROM users 
            JOIN branches ON users.user_id = branches.user_id
            WHERE users.role = 'MANAGER' AND users.user_id = ?`;

        return db.execute(sql, [id]);
    }

    static getManagerCount(filter, isActive, search, selectedField, searchedValue) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(users.user_id) AS managerCount 
                        FROM users 
                        JOIN branches ON users.user_id = branches.user_id
                        WHERE users.role = 'MANAGER'
                        AND
                        (users.is_active = ?)`;

            return db.execute(sql, [isActive]);
        } else if (search && search === 'active' && (selectedField === 'name' || selectedField === 'phone' || selectedField === 'email') && searchedValue !== null) {
            const sql = `SELECT COUNT(users.user_id) AS managerCount 
                        FROM users 
                        JOIN branches ON users.user_id = branches.user_id
                        WHERE users.role = 'MANAGER'
                        AND
                        (${selectedField} LIKE UPPER(?))`;

            return db.execute(sql, [searchedValue]);
        }
        else {
            const sql = `SELECT COUNT(users.user_id) AS managerCount 
                        FROM users 
                        JOIN branches ON users.user_id = branches.user_id
                        WHERE users.role = 'MANAGER'`;

            return db.execute(sql);
        }
    }

    static getManagerImagePath(id) {
        const sql = `SELECT photo FROM users WHERE user_id = ?`;

        return db.execute(sql, [id]);
    }

    static async updateManager(id, name, phone, email, imagePath) {
        const sql = `UPDATE users SET
                name = ?, phone = ?, email = ?, photo = ?
                WHERE user_id = ? AND is_active = true`;

        const [result] = await db.execute(sql, [name, phone, email, imagePath, id]);

        return result;
    }

    static async activateAccount(id) {
        const sql = 'UPDATE users SET is_active = true WHERE user_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivateAccount(id) {
        const sql = 'UPDATE users SET is_active = false WHERE user_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async existedManagerCount(email) {
        const sql = 'SELECT COUNT(user_id) AS managerCount FROM users WHERE email = ?';
        const [result] = await db.execute(sql, [email]);

        return result;
    }

    static async managerEmailTakenCount(id, email) {
        const sql = 'SELECT COUNT(user_id) AS managerEmailTakenCount FROM users WHERE email = ? AND user_id != ?';
        const [result] = await db.execute(sql, [email, id]);

        return result;
    }
}

module.exports = Manager;