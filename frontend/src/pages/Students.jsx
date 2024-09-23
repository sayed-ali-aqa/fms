import React, { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { useQuery } from 'react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ToastMsg from '../components/ToastMsg';
import { EyeFill, PencilFill, ThreeDotsVertical, Search, PersonFillAdd } from 'react-bootstrap-icons';
import Dropdown from 'react-bootstrap/Dropdown';
import ViewModalWithImage from '../components/ViewModalWithImage';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import { Col, Row, Spinner } from 'react-bootstrap';
import PageHeader from '../components/PageHeader';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';


const Students = () => {
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastStatus, setToastStatus] = useState('');
  // Filter Search 
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef(null);

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
  const [studentInfoData, setStudentInfoData] = useState([]);

  const fields = [
    { label: 'Student ID', key: 'stu_reg_id' },
    { label: 'Name', key: 'name' },
    { label: 'Father Name', key: 'father_name' },
    { label: 'Gender', key: 'gender' },
    { label: 'Education', key: 'education' },
    { label: 'Phone', key: 'phone' },
    { label: 'Date of Birth', key: 'dob' },
    { label: 'Address', key: 'address' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
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

  const fetchStudentInfo = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/students/info/${id}`);
      setStudentInfoData(response.data.data[0]);

    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch student info!");
    }
  }

  const fetchStudents = async (pageParam) => {
    try {
      const response = await fetch(
        `http://localhost:3500/api/students/list?page=${pageParam}&pageSize=${pageSize}&search=${searchParams.get('search')}&selectedField=${searchParams.get('selectedField')}&searchedValue=${searchParams.get('searchedValue')}`
      );
      const data = await response.json();

      // // pagination count
      const dataLength = data.studentCount;
      setDataLength(dataLength);
      const calculatedTotalPages = Math.ceil(dataLength / pageSize);
      setTotalPages(calculatedTotalPages);

      return data.data;
    } catch (error) {
      setShowToast(true);
      setToastStatus("Error");
      setToastMsg("Failed to fetch student list!");
    }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['studentData', currentPage],
    () => fetchStudents(currentPage),
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
          fetchStudentInfo(id);
          setModalShow(true);
          break;

        case "edit":
          Navigate(`/students/edit/${id}`);
          break;

        case "enroll":
          Navigate(`/students/enroll/${id}`);
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
          <Navbar parentPage='Students' parentRoute='/students' childPage={undefined} />
          <div className="content">

            <PageHeader pageTitle='Student Lists' actionName='Add Student' actionLink='/students/new' />

            <div className="body pagination-parent">
              <Row>
                <Col md={6}>
                  <Button variant="primary" onClick={handleShowSearchCanvas} className="me-2">
                    <Search /> Search & Filter
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
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Father Name</th>
                    <th>Gender</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="7" className='text-center'>No student available.</td>
                    </tr>
                  ) : (
                    data.map((student, index) => (
                      <tr key={index}>
                        <td className='text-center'>{index + 1}</td>
                        <td>{student.stu_reg_id}</td>
                        <td>{student.name}</td>
                        <td>{student.father_name}</td>
                        <td>{student.gender}</td>
                        <td>
                          <Dropdown style={{ position: 'absolute', zIndex: '99' }}>
                            <Dropdown.Toggle as={CustomToggle} id="custom-dropdown-toggle" />

                            <Dropdown.Menu >
                              <Dropdown.Item onClick={() => dropdownAction("view", student.student_id)}>
                                <EyeFill style={{ marginRight: '4px' }} /> View
                              </Dropdown.Item>

                              <Dropdown.Item onClick={() => dropdownAction("enroll", student.student_id)}>
                                <PersonFillAdd style={{ marginRight: '4px' }} /> Enroll
                              </Dropdown.Item>

                              <Dropdown.Item onClick={() => dropdownAction("edit", student.student_id)}>
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
              <ViewModalWithImage
                header="Student Information"
                photo={studentInfoData.photo}
                keys={fields}
                content={studentInfoData}
                show={modalShow}
                onHide={() => setModalShow(false)}
              />

              {/* Search sidebar */}
              <Offcanvas placement={'start'} show={showSearchCanvas} onHide={handleCloseSearchCanvas}>
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Search Student Data</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  {/* filter starts */}
                  <div className="filter-container">
                    <form ref={formRef}>
                      <div className="col-md-12 mb-4">
                        <label htmlFor="selectedField" className='mb-1'>Select search field</label>
                        <Form.Select aria-label="Select search field" value={searchedData.selectedField ? searchedData.selectedField : searchParams.get('selectedField')} name='selectedField'
                          onChange={(event) => {
                            setSearchedData({ ...searchedData, searchedValue: '', selectedField: event.target.value })
                            setSearchParams({ ...searchedData, searchedValue: '', selectedField: event.target.value });
                          }}>

                          <option value="">Select search field</option>
                          <option value="stu_reg_id">Student ID</option>
                          <option value="name">Name</option>
                          <option value="gender">Gender</option>
                          <option value="education">Education</option>
                          <option value="phone">Phone</option>
                        </Form.Select>

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "stu_reg_id") || (searchParams.get('selectedField') === "stu_reg_id" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <Form.Control
                              className='mt-3'
                              placeholder="Enter student ID"
                              aria-label="search student ID"
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

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "phone") || (searchParams.get('selectedField') === "phone" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <Form.Control
                              className='mt-3'
                              placeholder="Enter phone number"
                              aria-label="search phone number"
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

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "name") || (searchParams.get('selectedField') === "name" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <Form.Control
                              className='mt-3'
                              placeholder="Enter student name"
                              aria-label="search student"
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

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "gender") || (searchParams.get('selectedField') === "gender" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <Form.Select className='mt-4' aria-label="Select gender" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                              onChange={(event) => {
                                setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                setSearchParams({ ...searchedData, searchedValue: event.target.value });
                              }}>
                              <option key="gender00" value="">Select gender</option>
                              <option key="gender01" value="Male">Male</option>
                              <option key="gender02" value="Female">Female</option>
                            </Form.Select>
                          ) : null
                        }

                        {((searchedData.selectedField !== "" && searchedData.selectedField === "education") || (searchParams.get('selectedField') === "education" && searchParams.get('searchedValue') !== "")) ?
                          (
                            <Form.Select className='mt-4' aria-label="Select education" value={searchedData.searchedValue ? searchedData.searchedValue : searchParams.get('searchedValue')}
                              onChange={(event) => {
                                setSearchedData({ ...searchedData, searchedValue: event.target.value });
                                setSearchParams({ ...searchedData, searchedValue: event.target.value });
                              }}>
                              <option key="education00" value="">Select education</option>
                              <option key="education01" value="Below 6th Grade">Below 6th Grade</option>
                              <option key="education02" value="Above 6th Grade">Above 6th Grade</option>
                              <option key="education03" value="School Graduate">School Graduate</option>
                              <option key="education04" value="14 Graduate">14 Graduate</option>
                              <option key="education05" value="Bachelor">Bachelor</option>
                              <option key="education06" value="Master">Master</option>
                              <option key="education07" value="PHD">PHD</option>
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

export default Students;
