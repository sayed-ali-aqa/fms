import './assets/styles/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';

import DashboardIndex from './pages/DashboardIndex';
import Branches from './pages/Branches';
import AddBranch from './pages/AddBranch';
import EditBranch from './pages/EditBranch';
import Managers from './pages/Managers';
import EditManager from './pages/EditManager';
import Categories from './pages/Categories';
import AddCategory from './pages/AddCategory';
import EditCategory from './pages/EditCategory';
import AddManager from './pages/AddManager';
import AddProduct from './pages/AddProduct';
import Subjects from './pages/Subjects';
import AddSubject from './pages/AddSubject';
import EditSubject from './pages/EditSubject';
import Budgets from './pages/Budgets';
import AddBudget from './pages/AddBudget';
import EditBudget from './pages/EditBudget';
import Classes from './pages/Classes';
import AddClass from './pages/AddClass';
import EditClass from './pages/EditClass';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpenses';
import EditExpense from './pages/EditExpense';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import Enrolls from './pages/Enrolls';
import Enroll from './pages/Enroll';
import EditEnroll from './pages/EditEnroll';
import BookSales from './pages/BookSales';
import SellBook from './pages/SellBook';
import EditBookSale from './pages/EditBookSale';
import Salaries from './pages/Salaries';
import PayFixedSalary from './pages/PayFixedSalary';
import PayPercentageSalary from './pages/PayPercentageSalary';
import PaidSalaries from './pages/PaidSalaries';
import EditFixedSalary from './pages/EditFixedSalary';
import EditPercentageSalary from './pages/EditPercentageSalary';


// import Admins from './pages/Admins';


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<DashboardIndex />} />
        <Route path='/branches' element={<Branches />} />
        <Route path='/branches/new' element={<AddBranch />} />
        <Route path='/branches/edit/:id' element={<EditBranch />} />
        <Route path='/managers' element={<Managers />} />
        <Route path='/managers/new' element={<AddManager />} />
        <Route path='/managers/edit/:id' element={<EditManager />} />
        <Route path='/categories' element={<Categories />} />
        <Route path='/categories/new' element={<AddCategory />} />
        <Route path='/categories/edit/:id' element={<EditCategory />} />
        <Route path='/products/new' element={<AddProduct />} />
        <Route path='/subjects' element={<Subjects />} />
        <Route path='/subjects/new' element={<AddSubject />} />
        <Route path='/subjects/edit/:id' element={<EditSubject />} />
        <Route path='/budgets' element={<Budgets />} />
        <Route path='/budgets/new' element={<AddBudget />} />
        <Route path='/budgets/edit/:id' element={<EditBudget />} />
        <Route path='/classes' element={<Classes />} />
        <Route path='/classes/new' element={<AddClass />} />
        <Route path='/classes/edit/:id' element={<EditClass />} />
        <Route path='/employees' element={<Employees />} />
        <Route path='/employees/new' element={<AddEmployee />} />
        <Route path='/employees/edit/:id' element={<EditEmployee />} />
        <Route path='/expenses' element={<Expenses />} />
        <Route path='/expenses/new' element={<AddExpense />} />
        <Route path='/expenses/edit/:id' element={<EditExpense />} />
        <Route path='/books' element={<Books />} />
        <Route path='/books/new' element={<AddBook />} />
        <Route path='/books/edit/:id' element={<EditBook />} />
        <Route path='/students' element={<Students />} />
        <Route path='/students/new' element={<AddStudent />} />
        <Route path='/students/edit/:id' element={<EditStudent />} />
        <Route path='/enrolls' element={<Enrolls />} />
        <Route path='/students/enroll/:id' element={<Enroll />} />
        <Route path='/enrolls/edit/:id' element={<EditEnroll />} />
        <Route path='/book-sales' element={<BookSales />} />
        <Route path='/book-sales/new/:id' element={<SellBook />} />
        <Route path='/book-sales/edit/:id' element={<EditBookSale />} />
        <Route path='/salaries' element={<Salaries />} />
        <Route path='/salaries/fixed-type/:id' element={<PayFixedSalary />} />
        <Route path='/salaries/percentage-type/:id' element={<PayPercentageSalary />} />
        <Route path='/paid-salaries' element={<PaidSalaries />} />
        <Route path='/salaries/fixed-type/edit/:id' element={<EditFixedSalary />} />
        <Route path='/salaries/percentage-type/edit/:id' element={<EditPercentageSalary />} />
        

        {/* <Route path='/admins' element={<Admins />} />
        */}
      </Routes>
    </>
  )
}

export default App
