const db = require('../config/db');

class Class {
    static async createClass(name, startTime, endTime, branchId, employeeId, subjectId, fee, startDate, endDate, classRoomNo, classDays) {
        const sql = `INSERT INTO classes
            (class, start_time, end_time, branch_id, employee_id, subject_id, fee, start_date, end_date, class_room_no, class_days) 
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [name, startTime, endTime, branchId, employeeId, subjectId, fee, startDate, endDate, classRoomNo, classDays]);

        return result;
    }

    static getClassList(filter, isActive, search, branchId, selectedField, searchedValue, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT class_id, class AS name, start_time, 
                branch, start_date, classes.is_active
                FROM classes
                JOIN branches ON branches.branch_id = classes.branch_id
                WHERE classes.is_active = ?
                ORDER BY classes.class_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);

        } else if (search && search === 'active' && (selectedField === 'class' || selectedField === 'subject') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT class_id, class AS name, start_time, 
                branch, start_date, classes.is_active
                FROM classes
                JOIN branches ON branches.branch_id = classes.branch_id
                JOIN subjects ON subjects.subject_id = classes.subject_id
                WHERE ${selectedField} LIKE UPPER(?)
                AND branches.branch_id = ?
                ORDER BY classes.class_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, branchId, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'teacher') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT class_id, class AS name, start_time, 
                branch, start_date, classes.is_active
                FROM classes
                JOIN branches ON branches.branch_id = classes.branch_id
                JOIN employees ON employees.employee_id = classes.employee_id
                WHERE employees.name LIKE UPPER(?)
                AND branches.branch_id = ?
                ORDER BY classes.class_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, branchId, pageSize, offset]);
        }
        else {
            const sql = `SELECT class_id, class AS name, start_time, 
                branch, start_date, classes.is_active
                FROM classes
                JOIN branches ON branches.branch_id = classes.branch_id
                ORDER BY classes.class_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }
    
    static getClasses() {
        const sql = `SELECT class_id, class FROM classes`;

        return db.execute(sql);
    }

    static getActiveClasses() {
        const branchId = 3;

        const sql = `SELECT class_id, class FROM classes 
            WHERE is_active = true
            AND branch_id = ?`;

        return db.execute(sql, [branchId]);
    }

    static getClassInfo(id) {

        const sql = `SELECT classes.class_id, class AS name, start_time, 
        end_time, branch, employees.name AS teacher, subject, fee, 
        start_date, end_date, class_room_no, class_days, classes.created_at, classes.updated_at,
        employees.employee_id AS employeeId, subjects.subject_id AS subjectId, branches.branch_id AS branchId
        FROM classes
        JOIN branches ON branches.branch_id = classes.branch_id
        JOIN employees ON employees.employee_id = classes.employee_id
        JOIN subjects ON subjects.subject_id = classes.subject_id
        WHERE employees.position = 'Teacher'
        AND class_id = ?`;

        return db.execute(sql, [id]);
    }

    static getClassCount(filter, isActive, search, branchId, selectedField, searchedValue) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(class_id) AS classCount FROM classes
                WHERE is_active = ?`;

            return db.execute(sql, [isActive]);

        } else if (search && search === 'active' && (selectedField === 'class' || selectedField === 'subject') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT COUNT(class_id) AS classCount FROM classes
                JOIN branches ON branches.branch_id = classes.branch_id
                JOIN subjects ON subjects.subject_id = classes.subject_id
                WHERE ${selectedField} LIKE UPPER(?)
                AND branches.branch_id = ?`;

            return db.execute(sql, [searchedValue, branchId]);
        }
        else if (search && search === 'active' && (selectedField === 'teacher') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT COUNT(class_id) AS classCount FROM classes
                JOIN branches ON branches.branch_id = classes.branch_id
                JOIN employees ON employees.employee_id = classes.employee_id
                JOIN subjects ON subjects.subject_id = classes.subject_id
                WHERE employees.name LIKE UPPER(?)
                AND branches.branch_id = ?`;

            return db.execute(sql, [searchedValue, branchId]);
        }
        else {
            const sql = `SELECT COUNT(class_id) AS classCount FROM classes`;

            return db.execute(sql);
        }
    }

    static async updateClass(id, data) {
        const sql = `UPDATE classes SET
            class = ?, start_time = ?, end_time = ?, branch_id = ?, employee_id = ?, subject_id = ?, fee = ?, start_date = ?, end_date = ?, class_room_no = ?, class_days = ?
            WHERE class_id = ?`;

        const { name, startTime, endTime, branchId, employeeId, subjectId, fee, startDate, endDate, classRoomNo, classDays } = data;

        const [result] = await db.execute(sql, [name, startTime, endTime, branchId, employeeId, subjectId, fee, startDate, endDate, classRoomNo, classDays, id]);

        return result;
    }

    static getTimes() {
        const sql = 'SELECT DISTINCT time from classes';
        return db.execute(sql);
    }

    static async activate(id) {
        const sql = 'UPDATE classes SET is_active = true WHERE class_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE classes SET is_active = false WHERE class_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }
}


module.exports = Class;