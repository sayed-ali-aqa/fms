import React, { useState, useRef, useLayoutEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { useQuery } from 'react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { format } from 'date-fns';
import Footer from '../components/Footer';
import ToastMsg from '../components/ToastMsg';
import { PencilFill, ThreeDotsVertical, LightbulbFill, LightbulbOffFill, FunnelFill, Search } from 'react-bootstrap-icons';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import { Col, Row, Spinner } from 'react-bootstrap';
import PageHeader from '../components/PageHeader';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';

const Subjects = () => {
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');
    // Filter Search 
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedData, setSelectedData] = useState({ filter: 'active', isActive: "" });
    const formRef = useRef(null);

    const [showFilterCanvas, setShowFilterCanvas] = useState(false);
    const handleShowFilterCanvas = () => setShowFilterCanvas(true);
    const handleCloseFilterCanvas = () => setShowFilterCanvas(false);

    // Input Search 
    const [searchedData, setSearchedData] = useState({ search: 'active', selectedField: "", searchedValue: "" });
    const [showSearchCanvas, setShowSearchCanvas] = useState(false);
    const handleShowSearchCanvas = () => setShowSearchCanvas(true);
    const handleCloseSearchCanvas = () => setShowSearchCanvas(false);
    const [categoryData, setCategoryData] = useState([]);

    // pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 1;
    const [totalPages, setTotalPages] = useState(1);
    const [dataLength, setDataLength] = useState(0);

    const Navigate = useNavigate();

    useLayoutEffect(() => {
        getCategories();
    }, []);

    // ----------------------------- Pagination starts ----------------------------------------
    const MAX_PAGES_DISPLAYED = 5; // Adjust this as needed

    // Render pagination items based on the current page and total pages
    const renderPaginationItems = () => {
        const pagesToRender = Math.min(MAX_PAGES_DISPLAYED, totalPages);

        const startPage = Math.max(1, currentPage - Math.floor(pagesToRender / 2));
        const endPage = Math.min(totalPages, startPage + pagesToRender - 1);

        return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
    };

    // ----------------------------- Pagination ends ----------------------------------------
    const fetchSubjects = async (pageParam) => {
        try {
            const response = await fetch(
                `http://localhost:3500/api/subjects/list?page=${pageParam}&filter=${searchParams.get('filter')}&isActive=${searchParams.get('isActive')}&pageSize=${pageSize}&search=${searchParams.get('search')}&selectedField=${searchParams.get('selectedField')}&searchedValue=${searchParams.get('searchedValue')}`
            );
            const data = await response.json();

            // // pagination count
            const dataLength = data.subjectCount;
            setDataLength(dataLength);
            const calculatedTotalPages = Math.ceil(dataLength / pageSize);
            setTotalPages(calculatedTotalPages);

            return data.data;
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Failed to fetch subject list!");
        }
    }

    const getCategories = async () => {
        try {
            const response = await fetch(
                "http://localhost:3500/api/categories/"
            );

            const data = await response.json();

            setCategoryData(data.categories);

        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Failed to fetch category records!");
        }
    }

    const { data, isLoading, error, refetch } = useQuery(
        ['subjectData', currentPage],
        () => fetchSubjects(currentPage),
        {
            refetchOnWindowFocus: false,
            cacheTime: 0,
        }
    );

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const activateSubject = async (id) => {
        try {
            const response = await axios.patch(`http://localhost:3500/api/subjects/activate/${id}`);

            if (response.data.statusCode === 200) {
                setShowToast(true);
                setToastStatus("Success");
                setToastMsg(response.data.msg);

                // refetching updated data
                refetch();
            } else {
                setShowToast(true);
                setToastStatus("Error");
                setToastMsg(response.data.msg);
            }

        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Internal server error!");
        }
    }

    const deactivateSubject = async (id) => {
        try {
            const response = await axios.patch(`http://localhost:3500/api/subjects/deactivate/${id}`);

            if (response.data.statusCode === 200) {
                setShowToast(true);
                setToastStatus("Success");
                setToastMsg(response.data.msg);

                // refetching updated data
                refetch();
            } else {
                setShowToast(true);
                setToastStatus("Error");
                setToastMsg(response.data.msg);
            }

        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Internal server error!");
        }
    }

    if (isLoading) {
        return <div className='spinner-container'>
            <Spinner animation="grow" variant="primary" />
        </div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    // Ensure data is an array before mapping over it
    if (!Array.isArray(data)) {
        return <div>Data is not in the expected format.</div>;
    }

    //customizing the drop down icon
    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <ThreeDotsVertical
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
        </ThreeDotsVertical>
    ));

    const dropdownAction = (action, id) => {
        try {
            switch (action) {
                case "edit":
                    Navigate(`/subjects/edit/${id}`);
                    break;

                case "notAllowed":
                    setShowToast(true);
                    setToastStatus("Error");
                    setToastMsg("A deactive subject cannot be edited!");
                    break;

                case "activate":
                    const activationConfirmed = confirm('Are you sure to activate the subject?');
                    if (activationConfirmed) {
                        activateSubject(id);
                    }

                    break;

                case "deactivate":
                    const deactivationConfirmed = confirm('Are you sure to deactivate the subject?');
                    if (deactivationConfirmed) {
                        deactivateSubject(id);
                    }

                    break;
            }
        } catch (error) {
            console.log(error);
        }
    }

    // ------------------ Filter starts ------------------
    const filterData = async () => {
        setSearchParams({ ...selectedData });

        try {
            await handlePageChange(1);
            refetch();
        } catch (error) {
            // Handle any errors here, e.g., show an error message to the user.
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error filtering data.");
        }
    };

    const clearFilter = async () => {
        setSearchedData({ search: 'active', searchedValue: '' });
        setSelectedData({ filter: 'active', isActive: '' });
        setSearchParams({});

        if (formRef.current) {
            formRef.current.reset();
        }

        try {
            setTimeout(() => {
                handlePageChange(1);
                refetch();
            }, 1000);

        } catch (error) {
            // Handle any errors here, e.g., show an error message to the user.
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error clearing the filter!");
        }
    };
    // ------------------ Filter ends ------------------

    // ------------------ Search starts ----------------
    const searchData = async () => {
        setSelectedData({ filter: 'active', isActive: '' });
        setSearchParams({ ...searchedData });

        try {
            await handlePageChange(1);
            refetch();
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error searching data!");
        }
    };

    const clearSearch = async () => {
        setSearchedData({ search: 'active', searchedValue: '' });
        setSelectedData({ filter: 'active', isActive: '' });
        setSearchParams({});

        if (formRef.current) {
            formRef.current.reset();
        }

        try {
            setTimeout(() => {
                handlePageChange(1);
                refetch();
            }, 1000);

        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error clearing the search!");
        }
    };
    // ------------------ Search ends ------------------

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Subjects' parentRoute='/subjects' childPage={undefined} />
                    <div className="content">

                        <PageHeader pageTitle='Subject Lists' actionName='Add Subject' actionLink='/subjects/new' />

                        <div className="body pagination-parent">
                            <Row>
                                <Col md={6}>
                                    <Button variant="primary" onClick={handleShowFilterCanvas} className="me-2">
                                        <FunnelFill /> Filter
                                    </Button>

                                    <Button variant="outline-primary" onClick={handleShowSearchCanvas} className="me-2">
                                        <Search />
                                    </Button>
                                </Col>
                                <Col md={6}>
                                    {/* Pagination buttons */}
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
                                </Col>
                            </Row>

                            <div className="row-count text-end" style={{ marginTop: '-1.5rem' }}>
                                {
                                    dataLength > 0 ? (
                                        `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, dataLength)} of ${dataLength} entries`
                                    ) :
                                        (
                                            'Showing 0 entries'
                                        )
                                }
                            </div>

                            <Table responsive striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>NO.</th>
                                        <th>Subject</th>
                                        <th>Status</th>
                                        <th>Category</th>
                                        <th>Created At</th>
                                        <th>Updated At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className='text-center'>No subjects available.</td>
                                        </tr>
                                    ) : (
                                        data.map((subject, index) => (
                                            <tr key={index}>
                                                <td className='text-center'>{index + 1}</td>
                                                <td>{subject.subject}</td>
                                                <td>{(subject.is_active === 1) ? (<span className='text-primary'>Active</span>) : (<span className='text-danger'>Deactive</span>)}</td>
                                                <td>{subject.category}</td>
                                                <td>{format(new Date(subject.created_at), 'yyyy-MM-dd hh:MM:ss')}</td>
                                                <td>{format(new Date(subject.updated_at), 'yyyy-MM-dd hh:MM:ss')}</td>
                                                <td>
                                                    <Dropdown style={{ position: 'absolute', zIndex: '99' }}>
                                                        <Dropdown.Toggle as={CustomToggle} id="custom-dropdown-toggle" />

                                                        <Dropdown.Menu>
                                                            {(subject.is_active === 1) ?
                                                                (
                                                                    <Dropdown.Item onClick={() => dropdownAction("edit", subject.subject_id)}>
                                                                        <PencilFill style={{ marginRight: '4px' }} /> Edit
                                                                    </Dropdown.Item>
                                                                ) :
                                                                (
                                                                    <Dropdown.Item onClick={() => dropdownAction("notAllowed", subject.subject_id)}>
                                                                        <PencilFill style={{ marginRight: '4px' }} /> Edit
                                                                    </Dropdown.Item>
                                                                )
                                                            }

                                                            {(subject.is_active === 1) ? (
                                                                <Dropdown.Item onClick={() => dropdownAction("deactivate", subject.subject_id)}>
                                                                    <LightbulbOffFill className='text-danger' style={{ marginRight: '4px' }} /> <span className='text-danger'>Deactivate</span>
                                                                </Dropdown.Item>
                                                            ) : (
                                                                <Dropdown.Item onClick={() => dropdownAction("activate", subject.subject_id)}>
                                                                    <LightbulbFill className='text-primary' style={{ marginRight: '4px' }} /> <span className='text-primary'>Activate</span>
                                                                </Dropdown.Item>
                                                            )
                                                            }
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>


                            {/* Toast messages */}
                            <ToastMsg
                                show={showToast}
                                setShow={setShowToast}
                                msg={toastMsg}
                                status={toastStatus}
                            />

                            {/* Filter sidebar */}
                            <Offcanvas placement={'start'} show={showFilterCanvas} onHide={handleCloseFilterCanvas}>
                                <Offcanvas.Header closeButton>
                                    <Offcanvas.Title>Filter Subject Data</Offcanvas.Title>
                                </Offcanvas.Header>
                                <Offcanvas.Body>
                                    {/* filter starts */}
                                    <div className="filter-container">
                                        <form ref={formRef}>
                                            <div className="col-md-12 mb-4">
                                                <Form.Select aria-label="Select Subject Status" value={selectedData.isActive ? selectedData.isActive : searchParams.get('isActive')} name='status' onChange={(event) => setSelectedData({ ...selectedData, isActive: event.target.value })}>
                                                    <option value="">Select Subject Status</option>
                                                    <option value="true">Active</option>
                                                    <option value="false">Deactive</option>
                                                </Form.Select>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <Button variant='primary' className='mt-2 mb-2' onClick={() => filterData()}><FunnelFill /> Filter</Button>
                                        <Button variant='default' className='text-danger' onClick={() => clearFilter()}>Reset Filter</Button>
                                    </div>
                                </Offcanvas.Body>
                            </Offcanvas>

                            {/* Search sidebar */}
                            <Offcanvas placement={'start'} show={showSearchCanvas} onHide={handleCloseSearchCanvas}>
                                <Offcanvas.Header closeButton>
                                    <Offcanvas.Title>Search Subject Data</Offcanvas.Title>
                                </Offcanvas.Header>
                                <Offcanvas.Body>
                                    {/* filter starts */}
                                    <div className="filter-container">
                                        <form ref={formRef}>
                                            <div className="col-md-12 mb-4">
                                                <label htmlFor="selectedField" className='mb-1'>Select search field</label>
                                                <Form.Select aria-label="Select search field" value={searchedData.selectedField ? searchedData.selectedField : searchParams.get('selectedField')} name='selectedField'
                                                    onChange={(event) => {
                                                        setSearchedData({ ...searchedData, selectedField: event.target.value })
                                                        setSearchParams({ ...searchedData,  selectedField: event.target.value});
                                                    }}>

                                                    <option value="">Select search field</option>
                                                    <option value="subject">Subject</option>
                                                    <option value="category">Category</option>
                                                </Form.Select>

                                                {((searchedData.selectedField !== "" && searchedData.selectedField === "subject") || (searchParams.get('selectedField') === "subject" && searchParams.get('searchedValue') !== "")) ?
                                                    (
                                                        <Form.Control
                                                            className='mt-3'
                                                            placeholder="Enter subject name"
                                                            aria-label="search subject"
                                                            aria-describedby="basic-addon2"
                                                            value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                                            name='searchedValue'
                                                            onChange={(event) => setSearchedData({ ...searchedData, searchedValue: event.target.value })}
                                                        />
                                                    ) :
                                                    null
                                                }

                                                {((searchedData.selectedField !== "" && searchedData.selectedField === "category") || (searchParams.get('selectedField') === "category" && searchParams.get('searchedValue') !== "")) ?
                                                    (
                                                        <Form.Select className='mt-4' aria-label="Select category" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')} onChange={(event) => setSearchedData({ ...searchedData, searchedValue: event.target.value })}>
                                                            {categoryData.length === 0 ? (
                                                                <option value="">No category available</option>
                                                            ) : (
                                                                categoryData.map((category) => (
                                                                    <option key={category.category_id} value={category.category}>{category.category}</option>
                                                                ))
                                                            )}
                                                        </Form.Select>
                                                    ) : null
                                                }

                                            </div>
                                        </form>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <Button variant='primary' className='mt-2 mb-2' onClick={() => searchData()}><Search /> Search</Button>
                                        <Button variant='default' className='mt-2 mb-2 text-danger' onClick={() => clearSearch()}>Clear Search</Button>
                                    </div>
                                </Offcanvas.Body>
                            </Offcanvas>
                        </div>
                    </div>
                    <Footer />
                </div >
            </div >
        </>
    );
};

export default Subjects;
