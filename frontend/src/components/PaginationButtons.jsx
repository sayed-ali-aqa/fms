import React from 'react';
import Pagination from 'react-bootstrap/Pagination';

const PaginationButtons = ({renderPaginationItems, currentPage, totalPages, handlePageChange }) => {
    return (
        <div className="pagination custom-pagination">
            <Pagination>
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} />
                {renderPaginationItems().map((page) => (
                    <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                        {page}
                    </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
        </div>
    )
}

export default PaginationButtons;
