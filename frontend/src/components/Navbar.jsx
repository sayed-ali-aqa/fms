import { XLg } from 'react-bootstrap-icons';
import Avatar from '../assets/images/avatar/avatar.jpg';
import { Link } from 'react-router-dom';

const Navbar = ({ parentPage, parentRoute, childPage }) => {
    return (
        <div className="navbar">
            <div className="breadcrumb">
                <ul>
                    <li><Link to="/">Dashboard</Link></li>/
                    <li className={(childPage === undefined) ? 'active-breadcrumb' : ''}>
                        <Link to={parentRoute ? parentRoute : '/'}>{parentPage}</Link>
                    </li>
                    {
                        childPage ? (<li className='active-breadcrumb'>/ {childPage}</li>) : ''
                    }

                </ul>
            </div>
            <div className="user-info"><img src={Avatar} alt='user profile image' /></div>
        </div>
    )
}

export default Navbar;