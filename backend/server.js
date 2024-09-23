require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
// imported routes
const BrachesRoutes = require('./routes/BranchRouter'); 
const ManagerRoutes = require('./routes/ManagerRouter');
const CategoryRoutes = require('./routes/CategoryRouter');
const BudgetRoutes = require('./routes/BudgetRouter');
const EmployeeRoutes = require('./routes/EmployeeRouter');
const SubjectRoutes = require('./routes/SubjectRouter');
const StudentRoutes = require('./routes/StudentRouter');
const ClassRoutes = require('./routes/ClassRouter');
const BookRoutes = require('./routes/BookRouter');
const ExpenseRoutes = require('./routes/ExpenseRouter');
const EnrollRoutes = require('./routes/EnrollRouter');
const ProductRoutes = require('./routes/ProductRouter');
const SalaryRoutes = require('./routes/SalaryRouter');

const app = new express();
// enable json passing
app.use(express.json({ extended: true }));

// register routes
app.use(cors());
app.use('/api/branches', BrachesRoutes);
app.use('/api/managers', ManagerRoutes);
app.use('/api/categories', CategoryRoutes);
app.use('/api/budgets', BudgetRoutes);
app.use ('/api/employees', EmployeeRoutes);
app.use('/api/subjects', SubjectRoutes);
app.use('/api/students', StudentRoutes);
app.use('/api/classes', ClassRoutes);
app.use('/api/books', BookRoutes);
app.use('/api/expenses', ExpenseRoutes);
app.use('/api/enrolls', EnrollRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/salaries', SalaryRoutes);


//static Images Folder
app.use('/public/uploads/images/employees', express.static('./public/uploads/images/employees'))
app.use('/public/uploads/images/managers', express.static('./public/uploads/images/managers'))
app.use('/public/uploads/images/students', express.static('./public/uploads/images/students'))

// create log file stream
// The 'a' flag is used to open the file in append mode.
// const logFileStream = fs.createWriteStream('./logs/app.log', {flags: 'a'});

// for global error handling
// app.use((err, req, res, next) =>{
//     console.log(err.stack);
//     console.log(err.name);
//     console.log(err.code);

//     const date = new Date();
    
//     logFileStream.write(`----------------------------- ${date} ---------------------------------`);
//     logFileStream.write(`Error Stack: ${err.stack}/n`);
//     logFileStream.write(`Error Name: ${err.nane}/n`);
//     logFileStream.write(`Error Code: ${err.code}/n`);
    
//     logFileStream.end();

//     res.status(500).json({
//         message: "500: Server Error!"
//     })
//     next();
// })

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
})
