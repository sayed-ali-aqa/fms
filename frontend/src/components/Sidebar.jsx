import Logo from '../assets/images/logo/logo-default.svg'
import {
    MortarboardFill, CardChecklist, Clipboard2CheckFill, JournalArrowUp,
    BookHalf, SignIntersectionYFill, CurrencyExchange, CashStack,
    Bank2, BuildingFill, PersonFillCheck, PersonFill, GearFill, BoxArrowInRight,
    Receipt,
    CashCoin
} from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="logo"><img src={Logo} alt="default logo" /></div>

            <div className="links">
                <ul>
                    <li className='label'>PRIMARY LINKS</li>
                    <li>
                        <NavLink to='/students'>
                            <MortarboardFill className='icon' size={20} />
                            <div className="link">Students</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/enrolls'>
                            <CardChecklist className='icon' size={20} />
                            <div className="link">Enrolls</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/classes'>
                            <Clipboard2CheckFill className='icon' size={20} />
                            <div className="link">Classes</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/subjects'>
                            <JournalArrowUp className='icon' size={20} />
                            <div className="link">Subjects</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/books'>
                            <BookHalf className='icon' size={20} />
                            <div className="link">Books</div>
                        </NavLink>
                    </li>
                    
                    <li>
                        <NavLink to='/book-sales'>
                            <Receipt className='icon' size={20} />
                            <div className="link">Book Sales</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/categories'>
                            <SignIntersectionYFill className='icon' size={20} />
                            <div className="link">Categories</div>
                        </NavLink>
                    </li>

                    <li className='label'>SECONDARY LINKS</li>

                    <li>
                        <NavLink to='/expenses'>
                            <CurrencyExchange className='icon' size={20} />
                            <div className="link">Expenese</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/salaries'>
                            <CashStack className='icon' size={20} />
                            <div className="link">Salaries</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/paid-salaries'>
                            <CashCoin className='icon' size={20} />
                            <div className="link">Paid Salaries</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/budgets'>
                            <Bank2 className='icon' size={20} />
                            <div className="link">Budgets</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/branches'>
                            <BuildingFill className='icon' size={20} />
                            <div className="link">Branches</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/managers'>
                            <PersonFillCheck className='icon' size={20} />
                            <div className="link">Managers</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/employees'>
                            <PersonFill className='icon' size={20} />
                            <div className="link">Employees</div>
                        </NavLink>
                    </li>
                    <li className='seperator'></li>
                    <li>
                        <NavLink to='/account-setting'>
                            <GearFill className='icon' size={20} />
                            <div className="link">Account Setting</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/logout'>
                            <BoxArrowInRight className='icon' size={20} />
                            <div className="link">Logout</div>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar;
