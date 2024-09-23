const db = require('../config/db');

class Expense {
    static async createExpense(info, amount) {

        const userId = 1;

        const sql = `INSERT INTO expenses
            (info, amount, created_by) 
            VALUES(?, ?, ?)`;

        const [result] = await db.execute(sql, [info, amount, userId]);

        return result;
    }

    static getExpensesList(filter, isActive, search, selectedField, searchedValue, startDate, endDate, page, pageSize) {
        const offset = (page - 1) * pageSize;

        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT expense_id, info, amount, is_active, created_at FROM expenses
            WHERE is_active = ?
            ORDER BY expense_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'amount') && searchedValue !== null) {
            const sql = `SELECT expense_id, info, amount, is_active, created_at FROM expenses
            WHERE ${selectedField} = ?
            ORDER BY expense_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'manager') && searchedValue !== null) {
            const sql = `SELECT expenses.expense_id, info, amount, expenses.is_active, expenses.created_at FROM expenses
            JOIN users ON users.user_id = expenses.created_by
            WHERE expenses.created_by = ?
            ORDER BY expenses.expense_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && startDate !== null) {
            const sql = `SELECT expense_id, info, amount, expenses.is_active, expenses.created_at FROM expenses
            WHERE expenses.created_at >= ?
            AND expenses.created_at <= ?
            ORDER BY expense_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [startDate, endDate, pageSize, offset]);
        }
        else {
            const sql = `SELECT expense_id, info, amount, is_active, created_at FROM expenses
            ORDER BY expense_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getExpenseInfo(id) {
        const sql = `
            SELECT info, amount, expenses.is_active,
            expenses.created_at, 
            user_created.name AS created_by, expenses.updated_at
            FROM expenses
            JOIN users AS user_created ON user_created.user_id = expenses.created_by
            WHERE expense_id = ?    
        `;

        return db.execute(sql, [id]);
    }

    static getExpenseCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(expense_id) AS expenseCount 
                FROM expenses
                WHERE is_active = ?`;

            return db.execute(sql, [isActive]);
        }
        else if (search && search === 'active' && (selectedField === 'amount') && searchedValue !== null) {
            const sql = `SELECT COUNT(expense_id) AS expenseCount FROM expenses
            WHERE ${selectedField} = ?`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && (selectedField === 'manager') && searchedValue !== null) {
            const sql = `SELECT COUNT(expense_id) AS expenseCount FROM expenses
            JOIN users ON users.user_id = expenses.created_by
            WHERE expenses.created_by = ?`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && startDate !== null) {
            const sql = `SELECT COUNT(expense_id) AS expenseCount FROM expenses
            WHERE expenses.created_at >= ?
            AND expenses.created_at <= ?`;

            return db.execute(sql, [startDate, endDate]);
        }
        else {
            const sql = `SELECT COUNT(expense_id) AS expenseCount FROM expenses`;

            return db.execute(sql);
        }
    }

    static async updateExpense(id, info, amount) {
        const sql = `Update expenses SET
            info = ?, amount = ?
            WHERE expense_id = ?
            AND is_active = true`;

        const [result] = await db.execute(sql, [info, amount, id]);

        return result;
    }

    static async activate(id) {
        const sql = 'UPDATE expenses SET is_active = true WHERE expense_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE expenses SET is_active = false WHERE expense_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }
}

module.exports = Expense;