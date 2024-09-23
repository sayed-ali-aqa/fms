const db = require('../config/db');

class Salary {

    static async payFixedSalary(id, totalSalary, paidAmount, monthOfSalary) {
        const userId = 2;

        const sql = `INSERT INTO salaries
            (employee_id, total_amount, paid_amount, details, created_by) 
            VALUES(?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [id, totalSalary, paidAmount, monthOfSalary, userId]);

        return result;
    }

    static async updateFixedSalary(id, paidAmount, monthOfSalary) {

        const sql = `UPDATE salaries
            SET paid_amount = ?, details = ?
            WHERE salary_id = ?`;

        const [result] = await db.execute(sql, [paidAmount, monthOfSalary, id]);

        return result;
    }

    static async updatePercentageSalary(id, paidAmount, salaryDetails) {
        const sql = `UPDATE salaries
            SET paid_amount = ?, details = ?
            WHERE salary_id = ?`;

        const [result] = await db.execute(sql, [paidAmount, salaryDetails, id]);

        return result;
    }

    static async payPercentageSalary(id, employeeId, totalSalary, paidAmount, salaryDetails) {
        const userId = 2;

        let connection = null;
        let transactionError = null;

        try {
            // Get connection from the pool
            connection = await db.getConnection();

            // Begin transaction
            await connection.beginTransaction();

            // add to salareis table
            const sql = `INSERT INTO salaries
            (employee_id, total_amount, paid_amount, details, created_by) 
            VALUES(?, ?, ?, ?, ?)`;

            const [result] = await db.execute(sql, [employeeId, totalSalary, paidAmount, salaryDetails, userId]);

            // Retrieve the inserted salary_id
            const insertedSalaryId = result.insertId;

            // insert into percentage_paid_salaries table
            const sql2 = `INSERT INTO percentage_paid_salaries(class_id, salary_id) 
            VALUES(?, ?)`;

            await connection.execute(sql2, [id, insertedSalaryId]);

            // Commit transaction
            await connection.commit();

            return "Success"; // Indicate successful operation
        } catch (error) {
            transactionError = error;
            console.error("Error updating book sale:", error);

            // Rollback transaction if an error occurred
            if (connection && transactionError) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.error("Error rolling back transaction:", rollbackError);
                }
            }

            return "Failed"; // Indicate failure
        } finally {
            // Release connection back to the pool
            if (connection) {
                connection.release();
            }
        }
    }

    static getSalaryList(search, salaryType, employeeId, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if ((search && search === 'active') && (salaryType === 'fixed' && employeeId !== null)) {
            const sql = `SELECT employee_id, name, phone, position, payment_value AS salary, branch FROM employees
                JOIN branches ON branches.branch_id = employees.branch_id
                WHERE employee_id = ?
                AND payment_type = 'Fixed'
                AND employees.is_active = true`;

            return db.execute(sql, [employeeId]);
        }
        else if (search && search === 'active' && (salaryType === 'percentage') && employeeId !== null) {
            const sql = `SELECT employees.employee_id, classes.class_id, employees.name, employees.phone, classes.class, branches.branch,
                (SUM(enrolls.received) + SUM(enrolls.due)) - ((SUM(enrolls.received) + SUM(enrolls.due)) * employees.payment_value / 100) AS salary
                FROM employees
                JOIN branches ON branches.branch_id = employees.branch_id
                LEFT JOIN classes ON classes.employee_id = employees.employee_id
                LEFT JOIN enrolls ON enrolls.class_id = classes.class_id
                WHERE employees.employee_id = ?
                    AND employees.payment_type = 'Percentage'
                    AND employees.is_active = true
                    AND classes.is_active = true
                    AND NOT EXISTS (
                        SELECT 1
                        FROM percentage_paid_salaries
                        WHERE percentage_paid_salaries.class_id = classes.class_id
                    )
                GROUP BY employees.employee_id, classes.class_id
                ORDER BY classes.class_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [employeeId, pageSize, offset]);
        }
        else {
            const sql = `SELECT class, phone, employees.name AS teacher, SUM(enrolls.received) AS totalReceived, SUM(enrolls.due) AS totalDue, branch
                FROM classes
                LEFT JOIN enrolls ON enrolls.class_id = classes.class_id
                LEFT JOIN employees ON employees.employee_id = classes.employee_id
                LEFT JOIN branches ON branches.branch_id = classes.branch_id
                WHERE classes.is_active = true
                GROUP BY employees.employee_id, classes.class_id
                ORDER BY classes.class_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getPaidSalaryList(search, employeeId, startDate, endDate, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if (search === 'active' && employeeId !== null) {
            const sql = `SELECT salary_id, name, payment_type, position, total_amount, paid_amount, salaries.created_at
                FROM salaries
                JOIN employees ON employees.employee_id = salaries.employee_id
                WHERE salaries.employee_id = ?
                AND salaries.created_at >= ?
                AND salaries.created_at <= ?
                ORDER BY salaries.salary_id DESC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [employeeId, startDate, endDate, pageSize, offset]);
        }
        else {
            const sql = `SELECT salary_id, name, payment_type, position, total_amount, paid_amount, salaries.created_at
                FROM salaries
                JOIN employees ON employees.employee_id = salaries.employee_id
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getSalaryCount(search, salaryType, employeeId) {
        if ((search && search === 'active') && (salaryType === 'fixed' && employeeId !== null)) {
            const sql = `SELECT COUNT(employee_id) as salaryCount FROM employees
                WHERE employee_id = ?
                AND payment_type = 'Fixed'
                AND employees.is_active = true`;

            return db.execute(sql, [employeeId]);
        }
        else if (search && search === 'active' && (salaryType === 'percentage') && employeeId !== null) {
            const sql = `SELECT COUNT(*) as salaryCount FROM (
                SELECT classes.class_id
                FROM employees
                JOIN branches ON branches.branch_id = employees.branch_id
                LEFT JOIN classes ON classes.employee_id = employees.employee_id
                LEFT JOIN enrolls ON enrolls.class_id = classes.class_id
                WHERE employees.employee_id = ?
                    AND employees.payment_type = 'Percentage'
                    AND employees.is_active = true
                    AND classes.is_active = true
                    AND NOT EXISTS (
                        SELECT 1
                        FROM percentage_paid_salaries
                        WHERE percentage_paid_salaries.class_id = classes.class_id
                    )
                GROUP BY employees.employee_id, classes.class_id
            ) AS subquery `;

            return db.execute(sql, [employeeId]);
        }
        else {
            const sql = `SELECT COUNT(class) AS salaryCount
                FROM enrolls
                JOIN classes ON classes.class_id = enrolls.class_id
                WHERE classes.is_active = true`;

            return db.execute(sql);
        }
    }

    static getPaidSalaryCount(search, employeeId, startDate, endDate) {
        if (search === 'active' && employeeId !== null) {
            const sql = `SELECT COUNT(salary_id) AS salaryCount FROM salaries
                WHERE salaries.employee_id = ?
                AND salaries.created_at >= ?
                AND salaries.created_at <= ?`;

            return db.execute(sql, [employeeId, startDate, endDate]);
        }
        else {
            const sql = `SELECT COUNT(salary_id) AS salaryCount FROM salaries`;

            return db.execute(sql);
        }
    }

    static getFixedSalaryInfo(id) {
        const sql = `SELECT employee_id, payment_value AS salary FROM employees
                WHERE employee_id = ?
                AND payment_type = 'Fixed'
                AND employees.is_active = true`;

        return db.execute(sql, [id]);
    }

    static getPercSalaryInfo(id) {
        const sql = `SELECT classes.class_id, employees.employee_id,
                (SUM(enrolls.received) + SUM(enrolls.due)) - ((SUM(enrolls.received) + SUM(enrolls.due)) * employees.payment_value / 100) AS salary
                FROM employees
                JOIN branches ON branches.branch_id = employees.branch_id
                LEFT JOIN classes ON classes.employee_id = employees.employee_id
                LEFT JOIN enrolls ON enrolls.class_id = classes.class_id
                WHERE enrolls.class_id = ?
                AND employees.payment_type = 'Percentage'
                AND employees.is_active = true
                AND classes.is_active = true
                GROUP BY employees.employee_id, classes.class_id`;

        return db.execute(sql, [id]);
    }

    static getPaidSalaryInformation(id) {
        const sql = `SELECT salaries.salary_id, name, position, total_amount, paid_amount, class, details, salaries.created_at, salaries.updated_at
            FROM salaries
            JOIN employees ON employees.employee_id = salaries.employee_id
            LEFT JOIN percentage_paid_salaries ON percentage_paid_salaries.salary_id = salaries.salary_id
            LEFT JOIN classes ON classes.class_id = percentage_paid_salaries.class_id
            WHERE salaries.salary_id = ?`;

        return db.execute(sql, [id]);
    }
}

module.exports = Salary;
