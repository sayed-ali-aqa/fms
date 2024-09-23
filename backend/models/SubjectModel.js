const db = require('../config/db');

class Subject {
    static async createSubject(subject, categoryId) {

        const sql = `INSERT INTO subjects
            (subject, category_id) 
            VALUES(?, ?)`;

        const [result] = await db.execute(sql, [subject, categoryId]);

        return result;
    }

    static getSubjectList(filter, isActive, search, selectedField, searchedValue, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT subject_id, subject, subjects.is_active, subjects.created_at, subjects.updated_at, category FROM subjects
            JOIN categories on categories.category_id = subjects.category_id
            WHERE subjects.is_active = ?
            ORDER BY subject_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'subject' || selectedField === 'category') && searchedValue !== null) {
            const sql = `SELECT subject_id, subject, subjects.is_active, subjects.created_at, subjects.updated_at, category FROM subjects
            JOIN categories on categories.category_id = subjects.category_id
            WHERE ${selectedField} LIKE UPPER(?)
            ORDER BY subject_id ASC
            LIMIT ? OFFSET ? `;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else {
            const sql = `SELECT subject_id, subject, subjects.is_active, subjects.created_at, subjects.updated_at, category FROM subjects
            JOIN categories on categories.category_id = subjects.category_id
            ORDER BY subject_id ASC
            LIMIT ? OFFSET ? `;

            return db.execute(sql, [pageSize, offset]);
        }


    }

    static getActiveSubjects() {
        const sql = `SELECT subject_id, subject FROM subjects WHERE is_active = true`;
        return db.execute(sql);
    }

    static getSubjectInfo(id) {
        const sql = `
            SELECT subject, category, subjects.category_id
            FROM subjects
            JOIN categories ON categories.category_id = subjects.category_id
            WHERE subjects.subject_id = ?`;

        return db.execute(sql, [id]);
    }

    static getSubjectCount(filter, isActive, search, selectedField, searchedValue) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(subject_id) AS subjectCount 
            FROM subjects
            WHERE subjects.is_active = ?`;

            return db.execute(sql, [isActive]);
        }
        else if (search && search === 'active' && (selectedField === 'subject' || selectedField === 'category') && searchedValue !== null) {
            const sql = `SELECT COUNT(subject_id) AS subjectCount FROM subjects
            JOIN categories on categories.category_id = subjects.category_id
            WHERE ${selectedField} LIKE UPPER(?)`;

            return db.execute(sql, [searchedValue]);
        }
        else {
            const sql = `SELECT COUNT(subject_id) AS subjectCount FROM subjects`;

            return db.execute(sql);
        }

    }

    static async updateSubject(id, subject, categoryId) {
        const sql = `Update subjects 
                SET subject = ?, category_id = ?
                WHERE subject_id = ?`;

        const [result] = await db.execute(sql, [subject, categoryId, id]);
        
        return result;
    }

    static async existedSubjectCount(subject) {
        const sql = 'SELECT COUNT(subject_id) AS subjectCount FROM subjects WHERE subject = ?';
        const [result] = await db.execute(sql, [subject]);

        return result;
    }

    static async subjectNameTakenCount(id, subject) {
        const sql = 'SELECT COUNT(subject_id) AS subjectNameTakenCount FROM subjects WHERE subject = ? AND subject_id != ?';
        const [result] = await db.execute(sql, [subject, id]);

        return result;
    }

    static async activate(id) {
        const sql = 'UPDATE subjects SET is_active = true WHERE subject_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE subjects SET is_active = false WHERE subject_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }
}

module.exports = Subject;