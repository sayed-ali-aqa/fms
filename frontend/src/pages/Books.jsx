import React, { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { useQuery } from 'react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ToastMsg from '../components/ToastMsg';
import { EyeFill, PencilFill, ThreeDotsVertical, LightbulbFill, LightbulbOffFill, FunnelFill, Search, Receipt } from 'react-bootstrap-icons';
import Dropdown from 'react-bootstrap/Dropdown';
import ViewModal from '../components/ViewModal';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import { Col, Row, Spinner } from 'react-bootstrap';
import PageHeader from '../components/PageHeader';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';


const Books = () => {
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastStatus, setToastStatus] = useState('');
  // Filter Search 
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBranch, setSelectedBranch] = useState('');
  const formRef = useRef(null);

  // Input Search 
  const [searchedData, setSearchedData] = useState({ search: 'active', selectedField: "", searchedValue: "" });
  const [showSearchCanvas, setShowSearchCanvas] = useState(false);
  const handleShowSearchCanvas = () => setShowSearchCanvas(true);
  const handleCloseSearchCanvas = () => setShowSearchCanvas(false);
  const [branchData, setBranchData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const [totalPages, setTotalPages] = useState(1);
  const [dataLength, setDataLength] = useState(0);

  const Navigate = useNavigate();
  // modal info and data
  const [modalShow, setModalShow] = React.useState(false);
  const [bookInfoData, setBookInfoData] = useState([]);

  const fields = [
    { label: 'Title', key: 'title' },
    { label: 'Author', key: 'author' },
    { label: 'Price', key: 'price' },
    { label: 'Available', key: 'quantity' },
    { label: 'Category', key: 'category' },
    { label: 'Branch', key: 'branch' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
  ];

  const fetchActiveBranches = async () => {
    try {
      const response = await axios.get('http://localhost:3500/api/branches/active');
      setBranchData(response.data.branches);
    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Error fetching branch records!");
    }
  }

  const fetchActiveCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3500/api/categories/active');
      console.log(response.data);
      setCategoryData(response.data.categories);

    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Error fetching category records!");
    }
  };

  useEffect(() => {
    fetchActiveBranches();
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


  const fetchBookInfo = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/books/info/${id}`);
      setBookInfoData(response.data.data[0]);

    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch book info!");
    }
  }

  const fetchBooks = async (pageParam) => {
    try {
      const response = await fetch(
        `http://localhost:3500/api/books/list?page=${pageParam}&pageSize=${pageSize}&search=${searchParams.get('search')}&branchId=${searchParams.get('branchId')}&selectedField=${searchParams.get('selectedField')}&searchedValue=${searchParams.get('searchedValue')}`
      );
      const data = await response.json();

      // // pagination count
      const dataLength = data.bookCount;
      setDataLength(dataLength);
      const calculatedTotalPages = Math.ceil(dataLength / pageSize);
      setTotalPages(calculatedTotalPages);

      return data.data;
    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch book list!");
    }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['bookData', currentPage],
    () => fetchBooks(currentPage),
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
    }
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
        case "view":
          fetchBookInfo(id);
          setModalShow(true);
          break;

        case "edit":
          Navigate(`/books/edit/${id}`);
          break;

        case "enroll":
          Navigate(`/book-sales/new/${id}`);
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ------------------ Search starts ----------------
  const searchData = async () => {
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
    setSearchedData({ search: 'active', selectedField: '', searchedValue: '' });
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
          <Navbar parentPage='Books' parentRoute='/books' childPage={undefined} />
          <div className="content">

            <PageHeader pageTitle='Book Lists' actionName='Add Book' actionLink='/books/new' />

            <div className="body pagination-parent">
              <Row>
                <Col md={6}>
                  <Button variant="primary" onClick={handleShowSearchCanvas} className="me-2">
                    <Search /> Search
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
                    <th>Title</th>
                    <th>Price</th>
                    <th>Author</th>
                    <th>Available</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="6" className='text-center'>No books available.</td>
                    </tr>
                  ) : (
                    data.map((book, index) => (
                      <tr key={index}>
                        <td className='text-center'>{index + 1}</td>
                        <td>{book.title}</td>
                        <td>{book.price}</td>
                        <td>{book.author}</td>
                        <td>{book.quantity}</td>
                        <td>
                          <Dropdown style={{ position: 'absolute', zIndex: '99' }}>
                            <Dropdown.Toggle as={CustomToggle} id="custom-dropdown-toggle" />

                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => dropdownAction("view", book.book_id)}>
                                <EyeFill style={{ marginRight: '4px' }} /> View
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => dropdownAction("enroll", book.book_id)}>
                                <Receipt style={{ marginRight: '4px' }} /> Sell
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => dropdownAction("edit", book.book_id)}>
                                <PencilFill style={{ marginRight: '4px' }} /> Edit
                              </Dropdown.Item>
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

              {/* View info modal */}
              <ViewModal
                header="Book Information"
                keys={fields}
                content={bookInfoData}
                show={modalShow}
                onHide={() => setModalShow(false)}
              />

              {/* Search sidebar */}
              <Offcanvas placement={'start'} show={showSearchCanvas} onHide={handleCloseSearchCanvas}>
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Search Book Data</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  {/* filter starts */}
                  <div className="filter-container">
                    <form ref={formRef}>

                      <div className="col-md-12 mb-4">
                        <label htmlFor="selectedBranch" className='mb-1'>Select branch</label>
                        <Form.Select aria-label="Select branch" value={selectedBranch} name='selectedBranch'
                          onChange={(event) => {
                            setSelectedBranch(event.target.value);

                            // reset the selected data and field
                            setSearchedData({ search: 'active', branchId: event.target.value, selectedField: '', searchedValue: '' });
                            setSearchParams({ branchId: event.target.value, selectedField: '', searchedValue: '' });

                          }}>

                          <option value="">Select branch</option>
                          {
                            branchData.length === 0 ? (
                              <option value="noBranch">No branch available</option>
                            )
                              :
                              (
                                branchData.map((row) => (
                                  <option key={row.branch_id} value={row.branch_id}>{row.branch}</option>
                                ))
                              )
                          }

                        </Form.Select>
                      </div>

                      {
                        selectedBranch ? (
                          <div className="col-md-12 mb-4">
                            <label htmlFor="selectedField" className='mb-1'>Select search field</label>
                            <Form.Select aria-label="Select search field" value={searchedData.selectedField ? searchedData.selectedField : searchParams.get('selectedField')} name='selectedField'
                              onChange={(event) => {
                                setSearchedData({ ...searchedData, searchedValue: '', selectedField: event.target.value })
                                setSearchParams({ ...searchedData, searchedValue: '', selectedField: event.target.value });

                                switch (event.target.value) {
                                  case "category":
                                    fetchActiveCategories();
                                    break;
                                }
                              }}>

                              <option value="">Select search field</option>
                              <option value="title">Title</option>
                              <option value="author">Author</option>
                              <option value="category">Category</option>
                              <option value="availablity">Availablity</option>
                            </Form.Select>

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "title") || (searchParams.get('selectedField') === "title" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Control
                                  className='mt-3'
                                  placeholder="Enter book title"
                                  aria-label="search title"
                                  aria-describedby="basic-addon2"
                                  value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                  onChange={(event) => {
                                    setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                    setSearchParams({ ...searchedData, searchedValue: event.target.value });
                                  }}
                                  name='searchedValue'
                                />
                              ) :
                              null
                            }

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "author") || (searchParams.get('selectedField') === "author" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Control
                                  className='mt-3'
                                  placeholder="Enter book author"
                                  aria-label="search author"
                                  aria-describedby="basic-addon2"
                                  value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                  onChange={(event) => {
                                    setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                    setSearchParams({ ...searchedData, searchedValue: event.target.value });
                                  }}
                                  name='searchedValue'
                                />
                              ) :
                              null
                            }

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "category") || (searchParams.get('selectedField') === "category" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Select className='mt-4' aria-label="Select category" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                  onChange={(event) => {
                                    setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                    setSearchParams({ ...searchedData, searchedValue: event.target.value });
                                  }}>

                                  <option value="">Select category</option>
                                  {categoryData.length === 0 ? (
                                    <option value="">No category available</option>
                                  ) : (
                                    categoryData.map((row) => (
                                      <option key={row.category_id} value={row.category}>{row.category}</option>
                                    ))
                                  )}
                                </Form.Select>
                              ) : null
                            }

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "availablity") || (searchParams.get('selectedField') === "availablity" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Select className='mt-4' aria-label="Select availablity" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                  onChange={(event) => {
                                    setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                    setSearchParams({ ...searchedData, searchedValue: event.target.value });
                                  }}>

                                  <option value="">Select availablity</option>
                                  <option value="notAvailable">Not available</option>
                                  <option value="available">Available</option>

                                </Form.Select>
                              ) : null
                            }

                          </div>
                        )
                          :
                          null
                      }

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

export default Books;
