const db = require('../config/db');

class Enroll {
    static async enroll(studentId, received, due, discount, classId) {
        const userId = 2;
        const branchId = 3;

        const sql = `INSERT INTO enrolls
            (student_id, received, due, discount, class_id, branch_id, created_by) 
            VALUES(?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [studentId, received, due, discount, classId, branchId, userId]);

        return result;
    }

    static getEnrollList(filter, isActive, search, selectedField, searchedValue, startDate, endDate, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT enroll_id, stu_reg_id, name, class, received, due, discount, enrolls.is_active, branch FROM enrolls
                JOIN students ON students.student_id = enrolls.student_id
                JOIN classes ON classes.class_id = enrolls.class_id
                JOIN branches ON branches.branch_id = enrolls.branch_id
                WHERE enrolls.is_active = ?
                ORDER BY enroll_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'studentID') && searchedValue !== null) {
            const sql = `SELECT enroll_id, stu_reg_id, name, class, received, due, discount, enrolls.is_active, branch FROM enrolls
            JOIN students ON students.student_id = enrolls.student_id
            JOIN classes ON classes.class_id = enrolls.class_id
            JOIN branches ON branches.branch_id = enrolls.branch_id
            WHERE students.stu_reg_id = ?
            ORDER BY enroll_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'class') && searchedValue !== null) {
            const sql = `SELECT enroll_id, stu_reg_id, name, class, received, due, discount, enrolls.is_active, branch FROM enrolls
            JOIN students ON students.student_id = enrolls.student_id
            JOIN classes ON classes.class_id = enrolls.class_id
            JOIN branches ON branches.branch_id = enrolls.branch_id
            WHERE enrolls.class_id = ?
            ORDER BY enroll_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'branch') && searchedValue !== null) {
            const sql = `SELECT enroll_id, stu_reg_id, name, class, received, due, discount, enrolls.is_active, branch FROM enrolls
                JOIN students ON students.student_id = enrolls.student_id
                JOIN classes ON classes.class_id = enrolls.class_id
                JOIN branches ON branches.branch_id = enrolls.branch_id
                WHERE enrolls.branch_id = ?
                ORDER BY enroll_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'due') && searchedValue !== null) {
            const condition = searchedValue === 'withDue' ? '>' : '=';

            const sql = `SELECT enroll_id, stu_reg_id, name, class, received, due, discount, enrolls.is_active, branch FROM enrolls
                JOIN students ON students.student_id = enrolls.student_id
                JOIN classes ON classes.class_id = enrolls.class_id
                JOIN branches ON branches.branch_id = enrolls.branch_id
                WHERE enrolls.due ${condition} 0
                ORDER BY enroll_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
        else if (search && search === 'active' && startDate !== null) {
            const sql = `SELECT enroll_id, stu_reg_id, name, class, received, due, discount, enrolls.is_active, branch FROM enrolls
                JOIN students ON students.student_id = enrolls.student_id
                JOIN classes ON classes.class_id = enrolls.class_id
                JOIN branches ON branches.branch_id = enrolls.branch_id
                WHERE enrolls.created_at >= ?
                AND enrolls.created_at <= ?
                ORDER BY enroll_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [startDate, endDate, pageSize, offset]);
        }
        else {
            const sql = `SELECT enroll_id, stu_reg_id, name, class, received, due, discount, enrolls.is_active, branch FROM enrolls
                JOIN students ON students.student_id = enrolls.student_id
                JOIN classes ON classes.class_id = enrolls.class_id
                JOIN branches ON branches.branch_id = enrolls.branch_id
                ORDER BY enroll_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getEnrolledInfo(id) {
        const sql = `
            SELECT enroll_id, stu_reg_id, students.name, students.photo, father_name, class, received, due, discount, SUM(received + due + discount) AS totalFee, branch, 
            enrolls.created_at, enrolls.updated_at, users.name AS manager, enrolls.class_id FROM enrolls
            JOIN students ON students.student_id = enrolls.student_id
            JOIN classes ON classes.class_id = enrolls.class_id
            JOIN branches ON branches.branch_id = enrolls.branch_id
            JOIN users ON users.user_id = enrolls.created_by
            WHERE enroll_id = ?`;

        return db.execute(sql, [id]);
    }

    static getEnrollCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(enroll_id) AS enrollCount FROM enrolls
                WHERE is_active = ?`;

            return db.execute(sql, [isActive]);
        }
        else if (search && search === 'active' && (selectedField === 'studentID') && searchedValue !== null) {
            const sql = `SELECT COUNT(enroll_id) AS enrollCount FROM enrolls
                JOIN students ON students.student_id = enrolls.student_id
                WHERE students.stu_reg_id = ?`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && (selectedField === 'class') && searchedValue !== null) {
            const sql = `SELECT COUNT(enroll_id) AS enrollCount FROM enrolls
                WHERE enrolls.class_id = ?`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && (selectedField === 'branch') && searchedValue !== null) {
            const sql = `SELECT COUNT(enroll_id) AS enrollCount FROM enrolls
                WHERE enrolls.branch_id = ?`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && (selectedField === 'due') && searchedValue !== null) {
            const condition = searchedValue === 'withDue' ? '>' : '=';

            const sql = `SELECT COUNT(enroll_id) AS enrollCount FROM enrolls
                WHERE enrolls.due ${condition} 0`;

            return db.execute(sql);
        }
        else if (search && search === 'active' && startDate !== null) {
            const sql = `SELECT COUNT(enroll_id) AS enrollCount FROM enrolls
                WHERE enrolls.created_at >= ?
                AND enrolls.created_at <= ?`;

            return db.execute(sql, [startDate, endDate]);
        }
        else {
            const sql = `SELECT COUNT(enroll_id) AS enrollCount FROM enrolls`;

            return db.execute(sql);
        }
    }

    static async updateEnroll(id, received, due, discount, classId) {
        const userId = 2;
        const branchId = 3;

        const sql = `UPDATE enrolls SET 
            received = ?, due = ?, discount = ?, class_id = ?
            WHERE enroll_id = ?
            AND branch_id = ?
            ADN is_active = true
            AND created_by = ?`;

        const [result] = await db.execute(sql, [received, due, discount, classId, id, branchId, userId]);

        return result;
    }

    static async activate(id) {
        const sql = 'UPDATE enrolls SET is_active = true WHERE enroll_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE enrolls SET is_active = false WHERE enroll_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }
}

module.exports = Enroll;
