const db = require('../config/db');


class Employee {
    static async createEmployee(name, position, gender, phone, education, address, imagePath, paymentType, paymentValue, categoryId, branchId) {

        const sql = `INSERT INTO employees
            (name, position, gender, phone, education, address, photo, category_id, branch_id, payment_type, payment_value) 
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [name, position, gender, phone, education, address, imagePath, categoryId, branchId, paymentType, paymentValue]);

        return result;
    }

    static getEmployees() {
        const sql = 'SELECT employee_id, name FROM employee';
        return db.execute(sql);
    }

    static getEmployeesList(filter, isActive, search, branchId, selectedField, searchedValue, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT employees.employee_id, name, position, category, branch, employees.is_active FROM employees
            JOIN categories ON categories.category_id = employees.category_id
            JOIN branches ON branches.branch_id = employees.branch_id
            WHERE employees.is_active = ?
            ORDER BY employee_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'name' || selectedField === 'position') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT employees.employee_id, name, position, category, branch, employees.is_active FROM employees
            JOIN categories ON categories.category_id = employees.category_id
            JOIN branches ON branches.branch_id = employees.branch_id
            WHERE employees.${selectedField} LIKE UPPER(?)
            AND branches.branch_id = ?
            ORDER BY employee_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, branchId, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'category') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT employees.employee_id, name, position, category, branch, employees.is_active FROM employees
            JOIN categories ON categories.category_id = employees.category_id
            JOIN branches ON branches.branch_id = employees.branch_id
            WHERE categories.category LIKE UPPER(?)
            AND branches.branch_id = ?
            ORDER BY employee_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, branchId, pageSize, offset]);
        }
        else {
            const sql = `SELECT employees.employee_id, name, position, category, branch, employees.is_active FROM employees
            JOIN categories ON categories.category_id = employees.category_id
            JOIN branches ON branches.branch_id = employees.branch_id
            ORDER BY employee_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getFixedTypeEmployess(branchId) {
        const sql = `SELECT employee_id, name FROM employees
            WHERE branch_id = ?
            AND payment_type = 'Fixed'
            AND is_active = true
            ORDER BY employee_id ASC`;

        return db.execute(sql, [branchId]);
    }

    static getPercentageTypeEmployess(branchId) {
        const sql = `SELECT employee_id, name FROM employees
            WHERE branch_id = ?
            AND payment_type = 'Percentage'
            AND is_active = true
            ORDER BY employee_id ASC`;

        return db.execute(sql, [branchId]);
    }

    static getActiveEmployees() {
        const sql = 'SELECT employee_id, name FROM employees WHERE is_active = true';
        return db.execute(sql);
    }

    static getActiveTeacherEmployees() {
        const sql = `SELECT employee_id, name FROM employees 
        WHERE is_active = true
        AND position = 'Teacher'`;

        return db.execute(sql);
    }

    static getEmployeesByBranch(id) {
        const sql = `SELECT employee_id, name FROM employees 
        JOIN branches ON branches.branch_id = employees.branch_id
        WHERE branches.is_active = true
        AND branches.branch_id = ?`;

        return db.execute(sql, [id]);
    }

    static getTeacherEmployeesByBranch(id) {
        const sql = `SELECT employee_id, name FROM employees 
        JOIN branches ON branches.branch_id = employees.branch_id
        WHERE branches.is_active = true
        AND branches.branch_id = ?
        AND employees.position = 'Teacher'`;

        return db.execute(sql, [id]);
    }

    static getEmployeeInfo(id) {
        const sql = `
            SELECT employees.name, position, gender, employees.phone, education, employees.address, employees.photo, category, branch, 
            payment_type, payment_value, branches.branch_id, categories.category_id, employees.created_at, employees.updated_at
            FROM employees
            JOIN categories ON categories.category_id = employees.category_id
            JOIN branches ON branches.branch_id = employees.branch_id
            WHERE employee_id = ?    
        `;

        return db.execute(sql, [id]);
    }

    static getEmployeeImagePath(id) {
        const sql = `SELECT photo FROM employees WHERE employee_id = ?`;

        return db.execute(sql, [id]);
    }

    static async activate(id) {
        const sql = 'UPDATE employees SET is_active = true WHERE employee_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE employees SET is_active = false WHERE employee_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static getEmployeeCount(filter, isActive, search, branchId, selectedField, searchedValue) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(employee_id) AS employeeCount 
            FROM employees
            JOIN branches ON branches.branch_id = employees.branch_id
            WHERE employees.is_active = ?`;

            return db.execute(sql, [isActive]);
        }
        else if (search && search === 'active' && (selectedField === 'name' || selectedField === 'position') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT COUNT(employee_id) AS employeeCount 
            FROM employees
            JOIN branches ON branches.branch_id = employees.branch_id
            WHERE employees.${selectedField} LIKE UPPER(?)
            AND branches.branch_id = ?`;

            return db.execute(sql, [searchedValue, branchId]);
        }
        else if (search && search === 'active' && (selectedField === 'category') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT COUNT(employee_id) AS employeeCount 
            FROM employees
            JOIN categories ON categories.category_id = employees.category_id
            JOIN branches ON branches.branch_id = employees.branch_id
            WHERE categories.category LIKE UPPER(?)
            AND branches.branch_id = ?`;

            return db.execute(sql, [searchedValue, branchId]);
        }
        else {
            const sql = `SELECT COUNT(employee_id) AS employeeCount FROM employees`;

            return db.execute(sql);
        }
    }

    static async updateEmployee(id, name, position, gender, phone, education, address, imagePath, paymentType, paymentValue, categoryId, branchId) {

        const sql = `
            UPDATE employees SET
            name = ?,
            position =?,
            gender = ?,
            phone = ?,
            education = ?,
            address = ?,
            photo = CASE
                WHEN ? IS NOT NULL THEN ?
                ELSE photo
            END,
            category_id = ?,
            branch_id = ?,
            payment_type = ?,
            payment_value = ?
            WHERE employee_id = ?
            AND is_active = true
        `;

        const [result] = await db.execute(sql, [name, position, gender, phone, education, address, imagePath, imagePath, categoryId, branchId, paymentType, paymentValue, id]);

        return result;
    }

}

module.exports = Employee;