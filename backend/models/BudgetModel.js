const db = require('../config/db');


class Budget {
    static async createBudget(amount, branchId) {

        const sql = `INSERT INTO budgets
            (amount, branch_id) 
            VALUES(?, ?)`;

        const [result] = await db.execute(sql, [amount, branchId]);

        return result;
    }

    static getBudgetInfo(id) {
        const sql = `
            SELECT amount, branch_id
            FROM budgets
            WHERE budget_id = ?    
        `;

        return db.execute(sql, [id]);
    }

    static getBudgetsList(filter, isActive, search, selectedField, searchedValue, startDate, endDate, page, pageSize) {
        const offset = (page - 1) * pageSize;
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT budget_id, amount, budgets.is_active, branch, budgets.created_at, budgets.updated_at FROM budgets
            JOIN branches ON branches.branch_id = budgets.branch_id
            WHERE budgets.is_active = ?
            ORDER BY budget_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'branch' || selectedField === 'amount') && searchedValue !== null) {
            const sql = `SELECT budget_id, amount, budgets.is_active, branch, budgets.created_at, budgets.updated_at FROM budgets
            JOIN branches ON branches.branch_id = budgets.branch_id
            WHERE ${selectedField} LIKE UPPER(?)
            ORDER BY budget_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && startDate !== null) {
            const sql = `SELECT budget_id, amount, budgets.is_active, branch, budgets.created_at, budgets.updated_at FROM budgets
            JOIN branches ON branches.branch_id = budgets.branch_id
            WHERE budgets.created_at >= ?
            AND budgets.created_at <= ?
            ORDER BY budget_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [startDate, endDate, pageSize, offset]);
        }
        else {
            const sql = `SELECT budget_id, amount, budgets.is_active, branch, budgets.created_at, budgets.updated_at FROM budgets
            JOIN branches ON branches.branch_id = budgets.branch_id
            ORDER BY budget_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    // static getBudgetCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate) {
    //     const sql = `SELECT COUNT(budget_id) AS budgetCount FROM budgets`;

    //     return db.execute(sql);
    // }

    static getBudgetCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(budget_id) AS budgetCount FROM budgets
            JOIN branches ON branches.branch_id = budgets.branch_id
            WHERE budgets.is_active = ?`;

            return db.execute(sql, [isActive]);
        }
        else if (search && search === 'active' && (selectedField === 'branch' || selectedField === 'amount') && searchedValue !== null) {
            const sql = `SELECT COUNT(budget_id) AS budgetCount FROM budgets
            JOIN branches ON branches.branch_id = budgets.branch_id
            WHERE ${selectedField} LIKE UPPER(?)`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && startDate !== null) {
            const sql = `SELECT COUNT(budget_id) AS budgetCount FROM budgets
            JOIN branches ON branches.branch_id = budgets.branch_id
            WHERE budgets.created_at >= ?
            AND budgets.created_at <= ?`;

            return db.execute(sql, [startDate, endDate]);
        }
        else {
            const sql = `SELECT COUNT(budget_id) AS budgetCount FROM budgets
            JOIN branches ON branches.branch_id = budgets.branch_id`;

            return db.execute(sql);
        }
    }

    static async updateBudget(id, amount, branchId) {

        const sql = `Update budgets SET
            amount = ?, branch_id = ?
            WHERE budget_id = ?`;

        const [result] = await db.execute(sql, [amount, branchId, id]);

        return result;
    }

    static async activate(id) {
        const sql = 'UPDATE budgets SET is_active = true WHERE budget_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE budgets SET is_active = false WHERE budget_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }
}

module.exports = Budget;