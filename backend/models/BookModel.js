const db = require('../config/db');

class Book {
    static async createBook(title, author, price, quantity, categoryId, branchId) {

        const sql = `INSERT INTO books
            (title, author, price, quantity, category_id, branch_id) 
            VALUES(?, ?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [title, author, price, quantity, categoryId, branchId]);

        return result;
    }

    static async sellBook(bookId, buyerInfo, received, discount, due, quantity) {
        const userId = 2;
        let connection = null;
        let transactionError = null;

        try {
            // Get connection from the pool
            connection = await db.getConnection();

            // Begin transaction
            await connection.beginTransaction();

            // Insert into book_sales table
            const sql1 = `INSERT INTO book_sales
                (book_id, buyer_info, quantity, received, due, discount, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            await connection.execute(sql1, [bookId, buyerInfo, quantity, received, due, discount, userId]);

            // Deduct quantity from books table
            const sql2 = `UPDATE books SET quantity = quantity - ? WHERE book_id = ?`;
            await connection.execute(sql2, [quantity, bookId]);

            // Commit transaction
            await connection.commit();

            return "Success"; // Indicate successful operation
        } catch (error) {
            transactionError = error;
            console.error("Error selling book:", error);

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

    static getBooksList(search, branchId, selectedField, searchedValue, page, pageSize) {
        const offset = (page - 1) * pageSize;

        if (search && search === 'active' && (branchId !== null) && (selectedField === null && searchedValue === null)) {
            const sql = `SELECT book_id, title, author, price, quantity, category, branch FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE branches.branch_id = ?
            ORDER BY book_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [branchId, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'title' || selectedField === 'author') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT book_id, title, author, price, quantity, category, branch FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE books.${selectedField} LIKE UPPER(?)
            AND branches.branch_id = ?
            ORDER BY book_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, branchId, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'category') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT book_id, title, author, price, quantity, category, branch FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE categories.category LIKE UPPER(?)
            AND branches.branch_id = ?
            ORDER BY book_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, branchId, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'availablity') && (branchId !== null && searchedValue !== null)) {
            const operation = (searchedValue === "notAvailable") ? '=' : '>';

            const sql = `SELECT book_id, title, author, price, quantity, category, branch FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE books.quantity ${operation} 0
            AND branches.branch_id = ?
            ORDER BY book_id ASC
            LIMIT ? OFFSET ?`;

            return db.execute(sql, [branchId, pageSize, offset]);
        }
        else {
            const sql = `SELECT book_id, title, author, price, quantity, category, branch FROM books
                JOIN categories ON categories.category_id = books.category_id
                JOIN branches ON branches.branch_id = books.branch_id
                ORDER BY book_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getBookSalesList(filter, isActive, search, selectedField, searchedValue, startDate, endDate, page, pageSize) {
        const offset = (page - 1) * pageSize;

        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT book_sale_id, title, received, due, discount, book_sales.quantity, book_sales.is_active, branch FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                JOIN branches ON branches.branch_id = books.branch_id
                WHERE book_sales.is_active = ?
                ORDER BY book_sale_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [isActive, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'buyerInfo') && searchedValue !== null) {
            const sql = `SELECT book_sale_id, title, received, due, discount, book_sales.quantity, book_sales.is_active, branch FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                JOIN branches ON branches.branch_id = books.branch_id
                WHERE buyer_info LIKE UPPER(?)
                ORDER BY book_sale_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'title') && searchedValue !== null) {
            const sql = `SELECT book_sale_id, title, received, due, discount, book_sales.quantity, book_sales.is_active, branch FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                JOIN branches ON branches.branch_id = books.branch_id
                WHERE books.title LIKE UPPER(?)
                ORDER BY book_sale_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'branch') && searchedValue !== null) {
            const sql = `SELECT book_sale_id, title, received, due, discount, book_sales.quantity, book_sales.is_active, branch FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                JOIN branches ON branches.branch_id = books.branch_id
                WHERE branches.branch_id = ?
                ORDER BY book_sale_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [searchedValue, pageSize, offset]);
        }
        else if (search && search === 'active' && (selectedField === 'due') && searchedValue !== null) {
            const condition = searchedValue === 'withDue' ? '>' : '=';

            const sql = `SELECT book_sale_id, title, received, due, discount, book_sales.quantity, book_sales.is_active, branch FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                JOIN branches ON branches.branch_id = books.branch_id
                WHERE book_sales.due ${condition} 0
                ORDER BY book_sale_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
        else if (search && search === 'active' && startDate !== null) {
            const sql = `SELECT book_sale_id, title, received, due, discount, book_sales.quantity, book_sales.is_active, branch FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                JOIN branches ON branches.branch_id = books.branch_id
                WHERE book_sales.created_at >= ?
                AND book_sales.created_at <= ?
                ORDER BY book_sale_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [startDate, endDate, pageSize, offset]);
        }
        else {
            const sql = `SELECT book_sale_id, title, received, due, discount, book_sales.quantity, book_sales.is_active, branch FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                JOIN branches ON branches.branch_id = books.branch_id
                ORDER BY book_sale_id ASC
                LIMIT ? OFFSET ?`;

            return db.execute(sql, [pageSize, offset]);
        }
    }

    static getBookInfo(id) {
        const sql = `
            SELECT title, author, price, quantity, category, books.category_id, branch, 
            books.branch_id, books.created_at, books.updated_at
            FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE book_id = ?    
        `;

        return db.execute(sql, [id]);
    }

    static getBookSaleInfo(id) {
        const sql = `SELECT book_sale_id, title, received, due, discount, book_sales.quantity, SUM(received + due + discount) AS totalAmount,
            buyer_info, book_sales.is_active, book_sales.created_at, book_sales.updated_at, users.name as manager, branch FROM book_sales
            JOIN books ON books.book_id = book_sales.book_id
            JOIN branches ON branches.branch_id = books.branch_id
            JOIN users ON users.user_id = book_sales.created_by
            WHERE book_sale_id = ?`;

        return db.execute(sql, [id]);
    }

    static getBookCount(search, branchId, selectedField, searchedValue) {
        if (search && search === 'active' && (branchId !== null) && (selectedField === null && searchedValue === null)) {
            const sql = `SELECT COUNT(book_id) AS bookCount FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE branches.branch_id = ?`;

            return db.execute(sql, [branchId]);
        }
        else if (search && search === 'active' && (selectedField === 'title' || selectedField === 'author') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT COUNT(book_id) AS bookCount FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE books.${selectedField} LIKE UPPER(?)
            AND branches.branch_id = ?`;

            return db.execute(sql, [searchedValue, branchId]);
        }
        else if (search && search === 'active' && (selectedField === 'category') && (branchId !== null && searchedValue !== null)) {
            const sql = `SELECT COUNT(book_id) AS bookCount FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE categories.category LIKE UPPER(?)
            AND branches.branch_id = ?`;

            return db.execute(sql, [searchedValue, branchId]);
        }
        else if (search && search === 'active' && (selectedField === 'availablity') && (branchId !== null && searchedValue !== null)) {
            const operation = (searchedValue === "notAvailable") ? '=' : '>';

            const sql = `SELECT COUNT(book_id) AS bookCount FROM books
            JOIN categories ON categories.category_id = books.category_id
            JOIN branches ON branches.branch_id = books.branch_id
            WHERE books.quantity ${operation} 0
            AND branches.branch_id = ?`;

            return db.execute(sql, [branchId]);
        }
        else {
            const sql = `SELECT COUNT(book_id) AS bookCount FROM books
                JOIN categories ON categories.category_id = books.category_id
                JOIN branches ON branches.branch_id = books.branch_id`;

            return db.execute(sql);
        }
    }

    static getBookSalesCount(filter, isActive, search, selectedField, searchedValue, startDate, endDate) {
        if (filter && filter === 'active' && (isActive === true || isActive === false)) {
            const sql = `SELECT COUNT(book_sale_id) AS bookSaleCount FROM book_sales
                WHERE book_sales.is_active = ?`;

            return db.execute(sql, [isActive]);
        }
        else if (search && search === 'active' && (selectedField === 'buyerInfo') && searchedValue !== null) {
            const sql = `SELECT COUNT(book_sale_id) AS bookSaleCount FROM book_sales
                WHERE buyer_info LIKE UPPER(?)`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && (selectedField === 'title') && searchedValue !== null) {
            const sql = `SELECT COUNT(book_sale_id) AS bookSaleCount FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                WHERE books.title LIKE UPPER(?)`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && (selectedField === 'branch') && searchedValue !== null) {
            const sql = `SELECT COUNT(book_sale_id) AS bookSaleCount FROM book_sales
                JOIN books ON books.book_id = book_sales.book_id
                JOIN branches ON branches.branch_id = books.branch_id
                WHERE branches.branch_id = ?`;

            return db.execute(sql, [searchedValue]);
        }
        else if (search && search === 'active' && (selectedField === 'due') && searchedValue !== null) {
            const condition = searchedValue === 'withDue' ? '>' : '=';

            const sql = `SELECT COUNT(book_sale_id) AS bookSaleCount FROM book_sales
                WHERE book_sales.due ${condition} 0`;

            return db.execute(sql);
        }
        else if (search && search === 'active' && startDate !== null) {
            const sql = `SELECT COUNT(book_sale_id) AS bookSaleCount FROM book_sales
                WHERE book_sales.created_at >= ?
                AND book_sales.created_at <= ?`;

            return db.execute(sql, [startDate, endDate]);
        }
        else {
            const sql = `SELECT COUNT(book_sale_id) AS bookSaleCount FROM book_sales`;

            return db.execute(sql);
        }
    }

    static async updateBook(id, title, author, price, quantity, categoryId, branchId) {

        const sql = `Update books SET
            title = ?, author = ?, price = ?, quantity = ?, category_id = ?, branch_id = ?
            WHERE book_id = ?`;

        const [result] = await db.execute(sql, [title, author, price, quantity, categoryId, branchId, id]);

        return result;
    }

    static getPreviousQuantity(id) {
        const sql = `SELECT quantity AS previousQuantity FROM book_sales WHERE book_sale_id = ?`;

        return db.execute(sql, [id]);
    }

    static async updateBookSale(id, buyerInfo, received, discount, due, quantity, previousQuantity) {
        const userId = 2;
        let connection = null;
        let transactionError = null;

        try {
            // Get connection from the pool
            connection = await db.getConnection();

            // Begin transaction
            await connection.beginTransaction();

            // Update book_sales table
            const sql = `UPDATE book_sales SET
                buyer_info = ?, quantity = ?, received = ?, due = ?, discount = ? 
                WHERE book_sale_id = ?
                AND created_by = ?`;

            await db.execute(sql, [buyerInfo, quantity, received, due, discount, id, userId]);

            const updatedQuantity = previousQuantity - quantity;

            // Update books table
            const sql2 = `UPDATE books SET quantity = quantity + ? 
                WHERE book_id = (SELECT book_id FROM book_sales WHERE book_sale_id = ?)`;

            await connection.execute(sql2, [updatedQuantity, id]);

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

    static async activate(id) {
        const sql = 'UPDATE book_sales SET is_active = true WHERE book_sale_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }

    static async deactivate(id) {
        const sql = 'UPDATE book_sales SET is_active = false WHERE book_sale_id = ?';
        const [result] = await db.execute(sql, [id]);

        return result;
    }
}

module.exports = Book;