const db = require('../config/db');
const crypto = require('crypto');

// Add a function to generate a unique 6-digit ID
async function generateUniqueId() {
    let uniqueId = '';
    const characters = '0123456789'; // Pool of characters to choose from
    const idLength = 8; // Length of the unique ID

    // Generate a random ID
    for (let i = 0; i < idLength; i++) {
        uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if the ID already exists in the database
    const sql = `SELECT COUNT(stu_reg_id) AS countId FROM students WHERE stu_reg_id = ?`;
    const result = await db.execute(sql, [uniqueId]);
    const countId = result[0][0].countId;

    // If ID is not unique, retry a limited number of times
    if (countId > 0) {
        const maxAttempts = 20; // Maximum number of attempts to generate a unique ID
        let attempts = 0;

        while (countId > 0 && attempts < maxAttempts) {
            // Generate a new ID
            uniqueId = '';
            for (let i = 0; i < idLength; i++) {
                uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // Check if the new ID exists in the database
            const result = await db.execute(sql, [uniqueId]);
            countId = result[0][0].countId;
            attempts++;
        }

        // If maximum attempts reached and still not unique, handle the error
        if (attempts === maxAttempts && countId > 0) {
            throw new Error('Failed to generate a unique ID');
        }
    }

    return uniqueId;
}

class Student {
    static async createStudent(name, fatherName, gender, education, dob, phone, address, imagePath) {
        // Generate a unique 6-digit ID
        const uniqueId = await generateUniqueId();

        const sql = `INSERT INTO students
            (stu_reg_id, name, father_name, gender, education, dob, phone, address, photo) 
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [uniqueId, name, fatherName, gender, education, dob, phone, address, imagePath]);

        return result;
    }

    static getStudentList(search, selectedField, searchedValue, page = 1, pageSize = 1) {
        const offset = (page - 1) * pageSize;

        if ((search && search === 'active') && (selectedField === 'name' && searchedValue !== null)) {
            const sql = `SELECT student_id, stu_reg_id, name, father_name, gender FROM students
                WHERE name LIKE UPPER (?)
                ORDER BY student_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'stu_reg_id' || selectedField === 'phone' || selectedField === 'gender' || selectedField === 'education') && (searchedValue !== null)) {
            const sql = `SELECT student_id, stu_reg_id, name, father_name, gender FROM students
                WHERE ${selectedField} = (?)
                ORDER BY student_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else {
            const sql = `SELECT student_id, stu_reg_id, name, father_name, gender FROM students
            ORDER BY student_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getStudentInfo(id) {
        const sql = `SELECT student_id, stu_reg_id, name, father_name, gender, 
            education, dob, phone, address, photo, created_at, updated_at
            FROM students
            WHERE student_id = ?`;

        return db.execute(sql, [id]);
    }

    static getStudentCount(search, selectedField, searchedValue) {
        if ((search && search === 'active') && (selectedField === 'name' && searchedValue !== null)) {
            const sql = `SELECT COUNT(student_id) AS studentCount FROM students
                WHERE name LIKE UPPER (?)`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && (selectedField === 'stu_reg_id' || selectedField === 'phone' || selectedField === 'gender' || selectedField === 'education') && (searchedValue !== null)) {
            const sql = `SELECT COUNT(student_id) AS studentCount FROM students
                WHERE ${selectedField} = (?)`;

            return db.execute(sql, [searchedValue]);
        }
        else {
            const sql = `SELECT COUNT(student_id) AS studentCount FROM students`;

            return db.execute(sql);
        }
    }

    static getStudentImagePath(id) {
        const sql = `SELECT photo FROM students WHERE student_id = ?`;

        return db.execute(sql, [id]);
    }

    static async updateStudent(id, name, fatherName, gender, education, dob, phone, address, imagePath) {

        const sql = `UPDATE students
                    SET name = ?, father_name = ?, gender = ?, education = ?, dob = ?, phone = ?, address = ?, photo = ?
                    WHERE student_id = ?`;

        const [result] = await db.execute(sql, [name, fatherName, gender, education, dob, phone, address, imagePath, id]);

        return result;
    }

}

module.exports = Student;
