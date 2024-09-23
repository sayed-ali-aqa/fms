import React, { useState, useRef } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { useQuery } from 'react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ToastMsg from '../components/ToastMsg';
import { EyeFill, PencilFill, ThreeDotsVertical, LightbulbFill, LightbulbOffFill, FunnelFill, Search } from 'react-bootstrap-icons';
import Dropdown from 'react-bootstrap/Dropdown';
import ViewModal from '../components/ViewModal';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import { Col, Row, Spinner } from 'react-bootstrap';
import PageHeader from '../components/PageHeader';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';

const BookSales = () => {
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
  const handleCloseSearchCanvas = () => setShowSearchCanvas(false)
  const [branchData, setBranchData] = useState([]);
  const [endDateError, setEndDateError] = useState("");

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const [totalPages, setTotalPages] = useState(1);
  const [dataLength, setDataLength] = useState(0);

  const Navigate = useNavigate();
  // modal info and data
  const [modalShow, setModalShow] = React.useState(false);
  const [bookSalesData, setBookSalesData] = useState([]);

  const fields = [
    { label: 'buyer Info', key: 'buyer_info' },
    { label: 'Book Title', key: 'title' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Total Amount', key: 'totalAmount' },
    { label: 'Received Amount', key: 'received' },
    { label: 'Due Amount', key: 'due' },
    { label: 'Discount Amount', key: 'discount' },
    { label: 'Branch', key: 'branch' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
    { label: 'Created By', key: 'manager' },
  ];

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

  const getBookSaleInfo = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/books/sales/info/${id}`);
      setBookSalesData(response.data.data[0]);

    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch book sale info!");
    }
  }

  const fetchBookSales = async (pageParam) => {
    try {
      const response = await fetch(
        `http://localhost:3500/api/books/sales/list?page=${pageParam}&pageSize=${pageSize}&filter=${searchParams.get('filter')}&isActive=${searchParams.get('isActive')}&search=${searchParams.get('search')}&selectedField=${searchParams.get('selectedField')}&searchedValue=${searchParams.get('searchedValue')}&startDate=${searchParams.get('startDate')}&endDate=${searchParams.get('endDate')}`
      );
      const data = await response.json();

      // // pagination count
      const dataLength = data.bookSaleCount;
      setDataLength(dataLength);
      const calculatedTotalPages = Math.ceil(dataLength / pageSize);
      setTotalPages(calculatedTotalPages);

      return data.data;
    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch book sales list!");
    }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['bookSalesData', currentPage],
    () => fetchBookSales(currentPage),
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
    }
  );

  const getBranches = async () => {
    try {
      const response = await fetch(
        "http://localhost:3500/api/branches/"
      );

      const data = await response.json();

      setBranchData(data.branches);

    } catch (error) {
      console.log(error);
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch branch records!");
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const activateBookSale = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3500/api/books/sales/activate/${id}`);

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

  const deactivateBookSale = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3500/api/books/sales/deactivate/${id}`);

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
        case "view":
          getBookSaleInfo(id);
          setModalShow(true);
          break;

        case "notAllowed":
          setShowToast(true);
          setToastStatus("Error");
          setToastMsg("A deactive books sale record cannot be edited!");
          break;

        case "edit":
          Navigate(`/book-sales/edit/${id}`);
          break;

        case "activate":
          const activationConfirmed = confirm('Are you sure to activate the book sale record?');
          if (activationConfirmed) {
            activateBookSale(id);
          }
          break;

        case "deactivate":
          const deactivationConfirmed = confirm('Are you sure to deactivate the book sale record?');
          if (deactivationConfirmed) {
            deactivateBookSale(id);
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

            <PageHeader pageTitle='Book Sales List' actionName='Sell Book' actionLink='/books' />

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
                    <th>Book</th>
                    <th>Quantity</th>
                    <th>Total Amount</th>
                    <th>Due</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="8" className='text-center'>No book sale available.</td>
                    </tr>
                  ) : (
                    data.map((bookSale, index) => (
                      <tr key={index}>
                        <td className='text-center'>{index + 1}</td>
                        <td>{bookSale.title}</td>
                        <td>{bookSale.quantity}</td>
                        <td>{bookSale.received + bookSale.due + bookSale.discount}</td>
                        <td className='text-danger'>{bookSale.due}</td>
                        <td>{bookSale.branch}</td>
                        <td>{(bookSale.is_active === 1) ? (<span className='text-primary'>Active</span>) : (<span className='text-danger'>Deactive</span>)}</td>
                        <td>
                          <Dropdown style={{ position: 'absolute', zIndex: '99' }}>
                            <Dropdown.Toggle as={CustomToggle} id="custom-dropdown-toggle" />

                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => dropdownAction("view", bookSale.book_sale_id)}>
                                <EyeFill style={{ marginRight: '4px' }} /> View
                              </Dropdown.Item>

                              {(bookSale.is_active === 1) ?
                                (
                                  <Dropdown.Item onClick={() => dropdownAction("edit", bookSale.book_sale_id)}>
                                    <PencilFill style={{ marginRight: '4px' }} /> Edit
                                  </Dropdown.Item>
                                ) :
                                (
                                  <Dropdown.Item onClick={() => dropdownAction("notAllowed", bookSale.book_sale_id)}>
                                    <PencilFill style={{ marginRight: '4px' }} /> Edit
                                  </Dropdown.Item>
                                )
                              }
                              {(bookSale.is_active === 1) ? (
                                <Dropdown.Item onClick={() => dropdownAction("deactivate", bookSale.book_sale_id)}>
                                  <LightbulbOffFill className='text-danger' style={{ marginRight: '4px' }} /> <span className='text-danger'>Deactivate</span>
                                </Dropdown.Item>
                              ) : (
                                <Dropdown.Item onClick={() => dropdownAction("activate", bookSale.book_sale_id)}>
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

              {/* View info modal */}
              <ViewModal
                header="Book Sales Information"
                keys={fields}
                content={bookSalesData}
                show={modalShow}
                onHide={() => setModalShow(false)}
              />

              {/* Filter sidebar */}
              <Offcanvas placement={'start'} show={showFilterCanvas} onHide={handleCloseFilterCanvas}>
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Filter Book Sale Data</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  {/* filter starts */}
                  <div className="filter-container">
                    <form ref={formRef}>
                      <div className="col-md-12 mb-4">
                        <Form.Select aria-label="Select Subject Status" value={selectedData.isActive ? selectedData.isActive : searchParams.get('isActive')} name='status' onChange={(event) => setSelectedData({ ...selectedData, isActive: event.target.value })}>
                          <option value="">Select Book Sale Status</option>
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
                  <Offcanvas.Title>Search Book Sale Data</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  {/* filter starts */}
                  <div className="filter-container">
                    <form ref={formRef}>
                      <div className="col-md-12 mb-4">
                        <label htmlFor="selectedField" className='mb-1'>Select search field</label>
                        <Form.Select aria-label="Select search field" value={searchedData.selectedField ? searchedData.selectedField : searchParams.get('selectedField')} name='selectedField'
                          onChange={(event) => {
                            setSearchedData({ search: 'active', selectedField: event.target.value, searchedValue: '' })
                            setSearchParams({ search: 'active', selectedField: event.target.value, searchedValue: '' });

                            switch (event.target.value) {
                              case 'branch':
                                getBranches();
                                break;
                            }
                          }}>

                          <option value="">Select search field</option>
                          <option value="buyerInfo">Buyer Info</option>
                          <option value="title">Book Title</option>
                          <option value="branch">Branch</option>
                          <option value="due">Due</option>
                          <option value="date">Date</option>
                        </Form.Select>

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "buyerInfo") || (searchParams.get('selectedField') === "buyerInfo" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <Form.Control
                              className='mt-3'
                              placeholder="Enter buyer info"
                              aria-label="search buyer info"
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

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "title") || (searchParams.get('selectedField') === "title" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <Form.Control
                              className='mt-3'
                              placeholder="Enter book title"
                              aria-label="search book title"
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

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "branch") || (searchParams.get('selectedField') === "branch" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <>
                              <label htmlFor="searchedValue" className='mt-3'>Select branch</label>
                              <Form.Select className='mt-1' aria-label="Select branch" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                onChange={(event) => {
                                  setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                  setSearchParams({ ...searchedData, searchedValue: event.target.value });
                                }}>

                                <option value="">Select branch</option>
                                {branchData.length === 0 ? (
                                  <option value="">No branch available</option>
                                ) : (
                                  branchData.map((branch) => (
                                    <option key={branch.branch_id} value={branch.branch_id}>{branch.branch}</option>
                                  ))
                                )}
                              </Form.Select>
                            </>
                          ) : null
                        }

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "due") || (searchParams.get('selectedField') === "due" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <Form.Select className='mt-4' aria-label="Select due status" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                              onChange={(event) => {
                                setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                setSearchParams({ ...searchedData, searchedValue: event.target.value });
                              }}>
                              <option key="dueStatus00" value="">Select due status</option>
                              <option key="dueStatus01" value="withDue">With Due</option>
                              <option key="dueStatus02" value="withoutDue">Without Due</option>
                            </Form.Select>
                          ) : null
                        }

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "date") || (searchParams.get('selectedField') === "date" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <>
                              <label htmlFor="startDate" className='mt-3'>From</label>
                              <Form.Control
                                className='mt-1'
                                aria-label="start date"
                                type='date'
                                aria-describedby="basic-addon2StartDate"
                                value={searchedData.startDate ? searchedData.startDate : searchParams.get('startDate')}
                                name='startDate'
                                onChange={(event) => {
                                  setSearchedData({ ...searchedData, searchedValue: '', startDate: event.target.value });
                                  setSearchParams({ ...searchedData, searchedValue: '', startDate: event.target.value });
                                }} />

                              <label htmlFor="endDate" className='mt-3'>To</label>
                              <Form.Control
                                className='mt-1'
                                aria-label="end date"
                                type='date'
                                aria-describedby="basic-addon2EndDate"
                                value={searchedData.endDate ? searchedData.endDate : searchParams.get('endDate')}
                                name='endDate'
                                onChange={(event) => {
                                  setSearchedData({ ...searchedData, searchedValue: '', endDate: event.target.value });
                                  setSearchParams({ ...searchedData, searchedValue: '', endDate: event.target.value });
                                  setEndDateError(""); // Clear previous error when end date changes
                                }}
                              />
                              {endDateError && <div className="text-danger">{endDateError}</div>}
                            </>
                          ) :
                          null
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
          </div >
          <Footer />
        </div >
      </div >
    </>
  );
};

export default BookSales;
