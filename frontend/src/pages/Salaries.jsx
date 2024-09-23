import React, { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { useQuery } from 'react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ToastMsg from '../components/ToastMsg';
import { ThreeDotsVertical, Search, CashCoin } from 'react-bootstrap-icons';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import { Col, Row, Spinner } from 'react-bootstrap';
import PageHeader from '../components/PageHeader';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';

const Salaries = () => {
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastStatus, setToastStatus] = useState('');
  // Filter Search 
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef(null);

  // Input Search 
  const [searchedData, setSearchedData] = useState({ search: 'active', salaryType: "", employeeId: "" });
  const [showSearchCanvas, setShowSearchCanvas] = useState(false);
  const handleShowSearchCanvas = () => setShowSearchCanvas(true);
  const handleCloseSearchCanvas = () => setShowSearchCanvas(false)
  const [fixedTypeEmployees, setFixedTypeEmployees] = useState([]);
  const [percentageTypeEmployees, setPercentageTypeEmployees] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const [totalPages, setTotalPages] = useState(1);
  const [dataLength, setDataLength] = useState(0);

  const Navigate = useNavigate();
  const [selectedSalaryType, setSelectedSalaryType] = useState(null);

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

  const fetchSalaries = async (pageParam) => {
    try {
      setSelectedSalaryType(searchParams.get('salaryType'));

      const response = await fetch(
        `http://localhost:3500/api/salaries/list?page=${pageParam}&search=${searchParams.get('search')}&salaryType=${searchParams.get('salaryType')}&employeeId=${searchParams.get('employeeId')}&pageSize=${pageSize}`
      );

      const data = await response.json();

      // // pagination count
      const dataLength = data.salaryCount;
      setDataLength(dataLength);
      const calculatedTotalPages = Math.ceil(dataLength / pageSize);
      setTotalPages(calculatedTotalPages);

      return data.data;
    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch salary list!");
    }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['salaryData', currentPage],
    () => fetchSalaries(currentPage),
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
    }
  );

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

  useEffect(() => {
    fetchActiveBranches();
  }, []);

  const fetchFixedSalaries = async (branchId) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/employees/fixed-type/${branchId}`);

      setFixedTypeEmployees(response.data.data);

    } catch (error) {
      console.log(error);
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch salary records!");
    }
  }

  const fetchPercentageSalaries = async (branchId) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/employees/percentage-type/${branchId}`);

      setPercentageTypeEmployees(response.data.data);

    } catch (error) {
      console.log(error);
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch salary records!");
    }
  }

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
        case "fixedTypeSalaryPay":
          Navigate(`/salaries/fixed-type/${id}`);
          break;

        case "notAllowed":
          setShowToast(true);
          setToastStatus("Error");
          setToastMsg("The teaher's class does have any enrolls!");
          break;

        case "percTypeSalaryPay":
          Navigate(`/salaries/percentage-type/${id}`);
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
    setSearchedData({ search: 'active', salaryType: '', employeeId: '' });
    setSearchParams({});
    setSelectedBranch("");

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
          <Navbar parentPage='Employees' parentRoute='/employees' childPage='Salaries' />
          <div className="content">

            <PageHeader pageTitle='Salary Lists' actionName='Add Student' actionLink='/students/new' />

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

              {
                (selectedSalaryType === "fixed") ?

                  (
                    <Table responsive striped bordered hover>
                      <thead>
                        <tr>
                          <th>NO.</th>
                          <th>Employee</th>
                          <th>Phone</th>
                          <th>Branch</th>
                          <th>Position</th>
                          <th>Salary (Fixed)</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.length === 0 ? (
                          <tr>
                            <td colSpan="7" className='text-center'>No result available.</td>
                          </tr>
                        ) : (
                          data.map((row, index) => (
                            <tr key={index}>
                              <td className='text-center'>{index + 1}</td>
                              <td>{row.name}</td>
                              <td>{row.phone}</td>
                              <td>{row.branch}</td>
                              <td>{row.position}</td>
                              <td>{row.salary ? Number(row.salary).toFixed(2) : null}</td>
                              <td>
                                <Dropdown style={{ position: 'absolute', zIndex: '99' }}>
                                  <Dropdown.Toggle as={CustomToggle} id="custom-dropdown-toggle" />

                                  <Dropdown.Menu>
                                    {/* fixedTypeSalaryPay = fixed Type Salary Pay */}
                                    <Dropdown.Item onClick={() => dropdownAction("fixedTypeSalaryPay", row.employee_id)}>
                                      <CashCoin style={{ marginRight: '4px' }} /> Pay Salary
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )
                  :
                  (
                    (selectedSalaryType === "percentage") ?
                      (
                        <Table responsive striped bordered hover>
                          <thead>
                            <tr>
                              <th>NO.</th>
                              <th>Teacher</th>
                              <th>Phone</th>
                              <th>Class</th>
                              <th>Branch</th>
                              <th>Salary (%)</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.length === 0 ? (
                              <tr>
                                <td colSpan="7" className='text-center'>No result available.</td>
                              </tr>
                            ) : (
                              data.map((row, index) => (
                                <tr key={index}>
                                  <td className='text-center'>{index + 1}</td>
                                  <td>{row.name}</td>
                                  <td>{row.phone}</td>
                                  <td>{row.class}</td>
                                  <td>{row.branch}</td>
                                  <td>{row.salary ? Number(row.salary).toFixed(2) : 0}</td>
                                  <td>
                                    <Dropdown style={{ position: 'absolute', zIndex: '99' }}>
                                      <Dropdown.Toggle as={CustomToggle} id="custom-dropdown-toggle" />

                                      <Dropdown.Menu>
                                        {/* percTypeSalaryPay = percentage Type Salary Pay */}
                                        {row.salary ?
                                          (
                                            <Dropdown.Item onClick={() => dropdownAction("percTypeSalaryPay", row.class_id)}>
                                              <CashCoin style={{ marginRight: '4px' }} /> Pay Salary
                                            </Dropdown.Item>
                                          ) :
                                          (
                                            <Dropdown.Item onClick={() => dropdownAction("notAllowed", row.class_id)}>
                                              <CashCoin style={{ marginRight: '4px' }} /> Pay Salary
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
                      )
                      :
                      (
                        <Table responsive striped bordered hover>
                          <thead>
                            <tr>
                              <th>NO.</th>
                              <th>Teacher</th>
                              <th>Phone</th>
                              <th>Class</th>
                              <th>Branch</th>
                              <th>Total Fee</th>
                              <th>Total Recieved</th>
                              <th>Total Due</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.length === 0 ? (
                              <tr>
                                <td colSpan="7" className='text-center'>No result available.</td>
                              </tr>
                            ) : (
                              data.map((row, index) => (
                                <tr key={index}>
                                  <td className='text-center'>{index + 1}</td>
                                  <td>{row.teacher}</td>
                                  <td>{row.phone}</td>
                                  <td>{row.class}</td>
                                  <td>{row.branch}</td>
                                  <td>{Number(row.totalReceived) + Number(row.totalDue)}</td>
                                  <td>{Number(row.totalReceived)}</td>
                                  <td>{Number(row.totalDue)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      )
                  )
              }

              {/* Toast messages */}
              <ToastMsg
                show={showToast}
                setShow={setShowToast}
                msg={toastMsg}
                status={toastStatus}
              />

              {/* Search sidebar */}
              <Offcanvas placement={'start'} show={showSearchCanvas} onHide={handleCloseSearchCanvas}>
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Search Salary Data</Offcanvas.Title>
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
                            setSearchedData({ search: 'active', branchId: event.target.value, salaryType: '', employeeId: '' });
                            setSearchParams({ branchId: event.target.value, salaryType: '', employeeId: '' });
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
                            <label htmlFor="salaryType" className='mb-1'>Select salary type</label>
                            <Form.Select aria-label="Select search field" value={searchedData.salaryType ? searchedData.salaryType : searchParams.get('salaryType')} name='salaryType'
                              onChange={(event) => {
                                setSearchedData({ search: 'active', salaryType: event.target.value, employeeId: '' })
                                setSearchParams({ search: 'active', salaryType: event.target.value, employeeId: '' });

                                switch (event.target.value) {
                                  case 'fixed':
                                    fetchFixedSalaries(selectedBranch);
                                    break;

                                  case 'percentage':
                                    fetchPercentageSalaries(selectedBranch);
                                    break;
                                }
                              }}>

                              <option value="">Select salary type</option>
                              <option value="fixed">Fixed</option>
                              <option value="percentage">Percentage</option>
                            </Form.Select>

                            {(searchedData.salaryType !== "" && searchedData.salaryType === "fixed") || (searchParams.get('salaryType') && searchParams.get('salaryType') === "fixed") ?
                              (
                                <>
                                  <label htmlFor="employeeId" className='mt-3'>Select Employee</label>
                                  <Form.Select className='mt-1' aria-label="Select employee" value={searchedData.employeeId ? searchedData.employeeId : searchParams.get('employeeId')}
                                    onChange={(event) => {
                                      setSearchedData({ ...searchedData, employeeId: event.target.value });
                                      setSearchParams({ ...searchedData, employeeId: event.target.value });
                                    }}>

                                    <option value="">Select employee</option>
                                    {fixedTypeEmployees.length === 0 ? (
                                      <option value="">No employee available</option>
                                    ) : (
                                      fixedTypeEmployees.map((row) => (
                                        <option key={row.employee_id} value={row.employee_id}>{row.name}</option>
                                      ))
                                    )}
                                  </Form.Select>
                                </>
                              ) :
                              null
                            }

                            {(searchedData.salaryType !== "" && searchedData.salaryType === "percentage") || (searchParams.get('salaryType') && searchParams.get('salaryType') === "percentage") ?
                              (
                                <>
                                  <label htmlFor="employeeId" className='mt-3'>Select Employee</label>
                                  <Form.Select className='mt-1' aria-label="Select employee" value={searchedData.employeeId ? searchedData.employeeId : searchParams.get('employeeId')}
                                    onChange={(event) => {
                                      setSearchedData({ ...searchedData, employeeId: event.target.value });
                                      setSearchParams({ ...searchedData, employeeId: event.target.value });
                                    }}>

                                    <option value="">Select employee</option>
                                    {percentageTypeEmployees.length === 0 ? (
                                      <option value="">No employee available</option>
                                    ) : (
                                      percentageTypeEmployees.map((row) => (
                                        <option key={row.employee_id} value={row.employee_id}>{row.name}</option>
                                      ))
                                    )}
                                  </Form.Select>
                                </>
                              ) :
                              null
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
          </div >
          <Footer />
        </div >
      </div >
    </>
  );
};

export default Salaries;
