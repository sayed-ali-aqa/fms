import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({pageTitle, actionLink, actionName}) => {
    return (
        <div className="header">
            <div className="info">
                <h5>{pageTitle}</h5>
            </div>
            <div className="action">
                <Link to={actionLink}>{actionName}</Link>
            </div>
        </div>
    )
}

export default PageHeader;
