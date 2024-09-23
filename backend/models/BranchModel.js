const db = require('../config/db');

class Branch {
    static async createBranch(branch, address, userId) {

        const sql = `INSERT INTO branches
            (branch, user_id, address) 
            VALUES(?, ?, ?)`;

        const [result] = await db.execute(sql, [branch, userId, address]);

        return result;
    }

    static getBranches() {
        const sql = 'SELECT branch_id, branch FROM branches';
        return db.execute(sql);
    }

    static getActiveBranches() {
        const sql = 'SELECT branch_id, branch FROM branches WHERE is_active = true';
        return db.execute(sql);
    }

    static getBranchInfo(id) {
        const sql = `
            SELECT branch_id, branch, address
            FROM branches
            WHERE branch_id = ? 
            AND 
            is_active = true   
        `;

        return db.execute(sql, [id]);
    }

    static getBranchesList(filter, isActive, search, selectedField, searchedValue, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `
            SELECT 
            branch_id, branch, address, branches.is_active, branches.created_at, branches.updated_at, name 
            FROM branches
            JOIN users on users.user_id = branches.user_id
            WHERE branches.is_active = ?
            ORDER BY branch_id ASC
            LIMIT ? OFFSET ?
            `;
            return db.execute(sql, [isActive, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'name' || selectedField === 'branch') && searchedValue !== null) {
            const sql = `
            SELECT 
            branch_id, branch, address, branches.is_active, branches.created_at, branches.updated_at, name 
            FROM branches
            JOIN users on users.user_id = branches.user_id
            WHERE ${selectedField} LIKE UPPER(?)
            ORDER BY branch_id ASC
            LIMIT ? OFFSET ?
            `;
            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else {
            const sql = `
            SELECT 
            branch_id, branch, address, branches.is_active, branches.created_at, branches.updated_at, name 
            FROM branches
            JOIN users on users.user_id = branches.user_id
            ORDER BY branch_id ASC
            LIMIT ? OFFSET ?
            `;
            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getBranchCount(filter, isActive, search, selectedField, searchedValue) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(branch_id) AS branchCount 
            FROM branches
            JOIN users on users.user_id = branches.user_id
            WHERE branches.is_active = ?`;

            return db.execute(sql, [isActive]);
        }
        else if (search && search === 'active' && (selectedField === 'name' || selectedField === 'branch') && searchedValue !== null) {
            const sql = `SELECT COUNT(branch_id) AS branchCount 
            FROM branches
            JOIN users on users.user_id = branches.user_id
            WHERE ${selectedField} LIKE UPPER(?)`;

            return db.execute(sql, [searchedValue]);
        }
        else {
            const sql = `SELECT COUNT(branch_id) AS branchCount 
            FROM branches
            JOIN users on users.user_id = branches.user_id`;

            return db.execute(sql);
        }
    }

    static async udpateBranch(id, branch, address) {
        const sql = `Update branches SET
            branch = ?, address = ?
            WHERE branch_id = ?
            AND is_active = true`;

        const [result] = await db.execute(sql, [branch, address, id]);

        return result;
    }

    static async activate(id) {
        const sql = 'UPDATE branches SET is_active = true WHERE branch_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE branches SET is_active = false WHERE branch_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async existedBranchCount(branch) {
        const sql = 'SELECT COUNT(branch_id) AS branchCount FROM branches WHERE branch = ?';
        const [result] = await db.execute(sql, [branch]);

        return result;
    }

    static async branchNameTakenCount(id, branch) {
        const sql = 'SELECT COUNT(branch_id) AS branchNameTakenCount FROM branches WHERE branch = ? AND branch_id != ?';
        const [result] = await db.execute(sql, [branch, id]);

        return result;
    }
}

module.exports = Branch;