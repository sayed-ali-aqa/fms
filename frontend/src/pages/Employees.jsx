import React, { useState, useRef, useEffect } from 'react';
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
import ViewModalWithImage from '../components/ViewModalWithImage';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import { Col, Row, Spinner } from 'react-bootstrap';
import PageHeader from '../components/PageHeader';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';


const Employees = () => {
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastStatus, setToastStatus] = useState('');
  // Filter Search 
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedData, setSelectedData] = useState({ filter: 'active', isActive: "" });
  const [branchData, setBranchData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const formRef = useRef(null);

  const [showFilterCanvas, setShowFilterCanvas] = useState(false);
  const handleShowFilterCanvas = () => setShowFilterCanvas(true);
  const handleCloseFilterCanvas = () => setShowFilterCanvas(false);

  // Input Search 
  const [searchedData, setSearchedData] = useState({ search: 'active', selectedField: "", searchedValue: "" });
  const [showSearchCanvas, setShowSearchCanvas] = useState(false);
  const handleShowSearchCanvas = () => setShowSearchCanvas(true);
  const handleCloseSearchCanvas = () => setShowSearchCanvas(false);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const [totalPages, setTotalPages] = useState(1);
  const [dataLength, setDataLength] = useState(0);

  const Navigate = useNavigate();
  // modal info and data
  const [modalShow, setModalShow] = React.useState(false);
  const [employeeInfoData, setEmployeeInfoData] = useState([]);

  const fields = [
    { label: 'Name', key: 'name' },
    { label: 'Position', key: 'position' },
    { label: 'Gender', key: 'gender' },
    { label: 'Phone', key: 'phone' },
    { label: 'Education', key: 'education' },
    { label: 'Address', key: 'address' },
    { label: 'Category', key: 'category' },
    { label: 'Branch', key: 'branch' },
    { label: 'Payment Type', key: 'payment_type' },
    { label: 'Payment Value', key: 'payment_value' },
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

  const fetchCategoriesByBranch = async () => {
    try {
      const response = await axios.get('http://localhost:3500/api/categories/active');
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


  const fetchEmployeeInfo = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/employees/info/${id}`);
      setEmployeeInfoData(response.data.data[0]);

    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch employee info!");
    }
  }

  const fetchEmployees = async (pageParam) => {
    try {
      const response = await fetch(
        `http://localhost:3500/api/employees/list?page=${pageParam}&filter=${searchParams.get('filter')}&isActive=${searchParams.get('isActive')}&pageSize=${pageSize}&search=${searchParams.get('search')}&branchId=${searchParams.get('branchId')}&selectedField=${searchParams.get('selectedField')}&searchedValue=${searchParams.get('searchedValue')}`
      );
      const data = await response.json();

      // // pagination count
      const dataLength = data.employeeCount;
      setDataLength(dataLength);
      const calculatedTotalPages = Math.ceil(dataLength / pageSize);
      setTotalPages(calculatedTotalPages);

      return data.data;
    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch employee list!");
    }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['employeeData', currentPage],
    () => fetchEmployees(currentPage),
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
    }
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const activateEmployee = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3500/api/employees/activate/${id}`);

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

  const deactivateEmployee = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3500/api/employees/deactivate/${id}`);

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
          fetchEmployeeInfo(id);
          setModalShow(true);
          break;

        case "notAllowed":
          setShowToast(true);
          setToastStatus("Error");
          setToastMsg("A deactive employee record cannot be edited!");
          break;

        case "edit":
          Navigate(`/employees/edit/${id}`);
          break;

        case "activate":
          const activationConfirmed = confirm('Are you sure to activate the employee record?');
          if (activationConfirmed) {
            activateEmployee(id);
          }

          break;

        case "deactivate":
          const deactivationConfirmed = confirm('Are you sure to deactivate the employee record?');
          if (deactivationConfirmed) {
            deactivateEmployee(id);
          }

          break;

        case "delete":
          const isConfirmed = confirm('Are you sure to delete?');

          if (isConfirmed) {
            deleteEmployee(id);
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
    setSearchedData({ search: 'active', selectedField: '', searchedValue: '' });
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
    setSearchedData({ search: 'active', selectedField: '', searchedValue: '' });
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
          <Navbar parentPage='Employees' parentRoute='/employees' childPage={undefined} />
          <div className="content">

            <PageHeader pageTitle='Employee Lists' actionName='Add Employee' actionLink='/employees/new' />

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
                    <th>Name</th>
                    <th>Position</th>
                    <th>Category</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="7" className='text-center'>No employee available.</td>
                    </tr>
                  ) : (
                    data.map((employee, index) => (
                      <tr key={index}>
                        <td className='text-center'>{index + 1}</td>
                        <td>{employee.name}</td>
                        <td>{employee.position}</td>
                        <td>{employee.category}</td>
                        <td>{employee.branch}</td>
                        <td>{(employee.is_active === 1) ? (<span className='text-primary'>Active</span>) : (<span className='text-danger'>Deactive</span>)}</td>
                        <td>
                          <Dropdown style={{ position: 'absolute', zIndex: '99' }}>
                            <Dropdown.Toggle as={CustomToggle} id="custom-dropdown-toggle" />

                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => dropdownAction("view", employee.employee_id)}>
                                <EyeFill style={{ marginRight: '4px' }} /> View
                              </Dropdown.Item>
                              {(employee.is_active === 1) ?
                                (
                                  <Dropdown.Item onClick={() => dropdownAction("edit", employee.employee_id)}>
                                    <PencilFill style={{ marginRight: '4px' }} /> Edit
                                  </Dropdown.Item>
                                ) :
                                (
                                  <Dropdown.Item onClick={() => dropdownAction("notAllowed", employee.employee_id)}>
                                    <PencilFill style={{ marginRight: '4px' }} /> Edit
                                  </Dropdown.Item>
                                )
                              }
                              {(employee.is_active === 1) ? (
                                <Dropdown.Item onClick={() => dropdownAction("deactivate", employee.employee_id)}>
                                  <LightbulbOffFill className='text-danger' style={{ marginRight: '4px' }} /> <span className='text-danger'>Deactivate</span>
                                </Dropdown.Item>
                              ) : (
                                <Dropdown.Item onClick={() => dropdownAction("activate", employee.employee_id)}>
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
              <ViewModalWithImage
                header="Employee Information"
                photo={employeeInfoData.photo}
                keys={fields}
                content={employeeInfoData}
                show={modalShow}
                onHide={() => setModalShow(false)}
              />

              {/* Filter sidebar */}
              <Offcanvas placement={'start'} show={showFilterCanvas} onHide={handleCloseFilterCanvas}>
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Filter Employee Data</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  {/* filter starts */}
                  <div className="filter-container">
                    <form ref={formRef}>
                      <div className="col-md-12 mb-4">
                        <label htmlFor="status" className='mb-1'>Select Status</label>
                        <Form.Select aria-label="Select Status" value={selectedData.isActive ? selectedData.isActive : searchParams.get('isActive')} name='status' onChange={(event) => setSelectedData({ ...selectedData, isActive: event.target.value })}>
                          <option value="">Select Status</option>
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
                  <Offcanvas.Title>Search Employee Data</Offcanvas.Title>
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
                            setSelectedData({ filter: 'active', isActive: '' });
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
                                setSearchParams({ ...selectedData, searchedValue: '', selectedField: event.target.value });

                                switch (event.target.value) {
                                  case "category":
                                    fetchCategoriesByBranch(selectedBranch);
                                    break;
                                }
                              }}>

                              <option value="">Select search field</option>
                              <option value="name">Name</option>
                              <option value="position">Position</option>
                              <option value="category">Category</option>
                            </Form.Select>

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "name") || (searchParams.get('selectedField') === "name" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Control
                                  className='mt-3'
                                  placeholder="Enter employee name"
                                  aria-label="search employee"
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

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "position") || (searchParams.get('selectedField') === "position" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Select className='mt-4' aria-label="Select position" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                  onChange={(event) => {
                                    setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                    setSearchParams({ ...searchedData, searchedValue: event.target.value });
                                  }}>
                                  <option key="position00" value="">Select Position</option>
                                  <option key="position01" value="SEO">SEO</option>
                                  <option key="position02" value="Manager">Manager</option>
                                  <option key="position03" value="Consultant">Consultant</option>
                                  <option key="position04" value="Teacher">Teacher</option>
                                  <option key="position05" value="Chef">Chef</option>
                                  <option key="position06" value="Guard">Guard</option>
                                  <option key="position07" value="Cleaner">Cleaner</option>
                                  <option key="position08" value="Driver">Driver</option>
                                </Form.Select>
                              ) : null
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

export default Employees;
