import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { useQuery } from 'react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ToastMsg from '../components/ToastMsg';
import { FunnelFill, PencilFill, ThreeDotsVertical, Search, LightbulbOffFill, LightbulbFill, EyeFill } from 'react-bootstrap-icons';
import Dropdown from 'react-bootstrap/Dropdown';
import ViewModal from '../components/ViewModal';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


const Classes = () => {
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastStatus, setToastStatus] = useState('');
  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const [totalPages, setTotalPages] = useState(1);
  const [dataLength, setDataLength] = useState(0);
  // Filter Search 
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedData, setSelectedData] = useState({ filter: 'active', time: "" });
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
  const [branchData, setBranchData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);

  const Navigate = useNavigate();
  // modal info and data
  const [modalShow, setModalShow] = React.useState(false);
  const [classInfoData, setClassInfoData] = useState([]);

  const fields = [
    { label: 'Class', key: 'name' },
    { label: 'Class Room No.', key: 'class_room_no' },
    { label: 'Start Date', key: 'start_date' },
    { label: 'End Date', key: 'end_date' },
    { label: 'Class Days', key: 'class_days' },
    { label: 'Fee', key: 'fee' },
    { label: 'Start Time', key: 'start_time' },
    { label: 'End Time', key: 'end_time' },
    { label: 'Branch', key: 'branch' },
    { label: 'Subject', key: 'subject' },
    { label: 'Teacher', key: 'teacher' },
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

  const fetchTeachersByBranch = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/employees/teachers/active/${id}`);
      setTeacherData(response.data.teachers);

    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Error fetching teacher records!");
    }
  }

  const fetchSubjectsByBranch = async () => {
    try {
      const response = await axios.get('http://localhost:3500/api/subjects/active');
      setSubjectData(response.data.data);

    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Error fetching subject records!");
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

  const fetchClassInfo = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/classes/info/${id}`);
      setClassInfoData(response.data.data[0]);

    } catch (error) {
      throw new Error('Failed to fetch class info');
    }
  }

  const fetchClasses = async (pageParam) => {
    try {
      const url = `http://localhost:3500/api/classes/list?page=${pageParam}&filter=${searchParams.get('filter')}&isActive=${searchParams.get('isActive')}&search=${searchParams.get('search')}&branchId=${searchParams.get('branchId')}&selectedField=${searchParams.get('selectedField')}&searchedValue=${searchParams.get('searchedValue')}&pageSize=${pageSize}`;
      const response = await fetch(url);
      const data = await response.json();

      // // pagination count
      const dataLength = data.classCount;
      setDataLength(dataLength);
      const calculatedTotalPages = Math.ceil(dataLength / pageSize);
      setTotalPages(calculatedTotalPages);

      return data.classData;
    } catch (error) {
      throw new Error('Failed to fetch classes');
    }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['classData', currentPage],
    () => fetchClasses(currentPage), {
    refetchOnWindowFocus: false,
    cacheTime: 0,
  }
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const activateClass = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3500/api/classes/activate/${id}`);

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

  const deactivateClass = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3500/api/classes/deactivate/${id}`);

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
          fetchClassInfo(id);
          setModalShow(true);
          break;

        case "notAllowed":
          setShowToast(true);
          setToastStatus("Error");
          setToastMsg("A deactive class reocrd cannot be edited!");
          break;

        case "edit":
          Navigate(`/classes/edit/${id}`);
          break;

        case "activate":
          const activationConfirmed = confirm('Are you sure to activate the class reocord?');
          if (activationConfirmed) {
            activateClass(id);
          }

          break;

        case "deactivate":
          const deactivationConfirmed = confirm('Are you sure to deactivate the class reocord?');
          if (deactivationConfirmed) {
            deactivateClass(id);
          }

          break;

        case "delete":
          Navigate(`/classes/delete/${id}`);
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
    setSearchParams({ ...searchedData, search: 'active' });

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
          <Navbar parentPage='Classes' parentRoute='/classes' childPage={undefined} />
          <div className="content">

            <PageHeader pageTitle='Class List' actionName='Add Class' actionLink='/classes/new' />

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
                    <th>Class</th>
                    <th>Start Time</th>
                    <th>Branch</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="7" className='text-center'>No classes available.</td>
                    </tr>
                  ) : (
                    data.map((classItem, index) => (
                      <tr key={index}>
                        <td className='text-center'>{index + 1}</td>
                        <td>{classItem.name}</td>
                        <td>{new Date(`1970-01-01T${classItem.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                        <td>{classItem.branch}</td>
                        <td>{format(new Date(classItem.start_date), 'yyyy-MM-dd')}</td>
                        <td>{(classItem.is_active === 1) ? (<span className='text-primary'>Active</span>) : (<span className='text-danger'>Deactive</span>)}</td>
                        <td>
                          <Dropdown style={{ position: 'absolute', zIndex: '99' }}>
                            <Dropdown.Toggle as={CustomToggle} id="custom-dropdown-toggle" />

                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => dropdownAction("view", classItem.class_id)}>
                                <EyeFill style={{ marginRight: '4px' }} /> View
                              </Dropdown.Item>

                              {(classItem.is_active === 1) ?
                                (
                                  <Dropdown.Item onClick={() => dropdownAction("edit", classItem.class_id)}>
                                    <PencilFill style={{ marginRight: '4px' }} /> Edit
                                  </Dropdown.Item>
                                ) :
                                (
                                  <Dropdown.Item onClick={() => dropdownAction("notAllowed", classItem.class_id)}>
                                    <PencilFill style={{ marginRight: '4px' }} /> Edit
                                  </Dropdown.Item>
                                )
                              }

                              {(classItem.is_active === 1) ? (
                                <Dropdown.Item onClick={() => dropdownAction("deactivate", classItem.class_id)}>
                                  <LightbulbOffFill className='text-danger' style={{ marginRight: '4px' }} /> <span className='text-danger'>Deactivate</span>
                                </Dropdown.Item>
                              ) : (
                                <Dropdown.Item onClick={() => dropdownAction("activate", classItem.class_id)}>
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
                header="Class Information"
                keys={fields}
                content={classInfoData}
                show={modalShow}
                onHide={() => setModalShow(false)}
              />

              {/* Filter sidebar */}
              <Offcanvas placement={'start'} show={showFilterCanvas} onHide={handleCloseFilterCanvas}>
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Filter Class Data</Offcanvas.Title>
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
                  <Offcanvas.Title>Search Class Data</Offcanvas.Title>
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
                                  case "subject":
                                    fetchSubjectsByBranch();
                                    break;

                                  case "teacher":
                                    fetchTeachersByBranch(selectedBranch);
                                    break;
                                }
                              }}>

                              <option value="">Select search field</option>
                              <option value="class">Class</option>
                              <option value="subject">Subject</option>
                              <option value="teacher">Teacher</option>
                            </Form.Select>

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "class") || (searchParams.get('selectedField') === "class" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Control
                                  className='mt-3'
                                  placeholder="Enter class name"
                                  aria-label="search class"
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

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "subject") || (searchParams.get('selectedField') === "subject" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Select className='mt-4' aria-label="Select subject" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                  onChange={(event) => {
                                    setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                    setSearchParams({ ...searchedData, searchedValue: event.target.value });
                                  }}>
                                  <option value="">Select subject</option>
                                  {subjectData.length === 0 ? (
                                    <option value="">No subject available</option>
                                  ) : (
                                    subjectData.map((row) => (
                                      <option key={row.subject_id} value={row.subject}>{row.subject}</option>
                                    ))
                                  )}
                                </Form.Select>
                              ) : null
                            }

                            {((searchedData.selectedField !== "" && searchedData.selectedField === "teacher") || (searchParams.get('selectedField') === "teacher" && searchParams.get('searchedValue') !== "")) ?
                              (
                                <Form.Select className='mt-4' aria-label="Select teacher" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                                  onChange={(event) => {
                                    setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                    setSearchParams({ ...searchedData, searchedValue: event.target.value });
                                  }}>

                                  <option value="">Select teacher</option>
                                  {teacherData.length === 0 ? (
                                    <option value="">No teacher available</option>
                                  ) : (
                                    teacherData.map((teacher) => (
                                      <option key={teacher.employee_id} value={teacher.name}>{teacher.name}</option>
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

export default Classes;
