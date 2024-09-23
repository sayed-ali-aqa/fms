import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Link, useParams } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from "react";
import { PlusLg } from "react-bootstrap-icons";
import Spinner from 'react-bootstrap/Spinner';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ToastMsg from "../components/ToastMsg";
import PageHeader from "../components/PageHeader";


const EditClass = () => {
    const [loading, setLoading] = useState(false);
    const [branchData, setBranchData] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');

    const { id } = useParams();

    useEffect(() => {
        fetchBranches();
        fetchSubjects();
        fetchTeachers();
        fetchClassinfo(id);
    }, [])

    const fetchClassinfo = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/classes/info/${id}`);

            const classInfo = response.data.data[0];
            // Extracting only the date part from the ISO string
            const startDate = classInfo.start_date.split('T')[0];
            const endDate = classInfo.end_date.split('T')[0];
            // Update the form values, replacing the ISO date with the formatted date
            classInfo.start_date = startDate;
            classInfo.end_date = endDate;
            formik.setValues(classInfo);

        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching class records!");
        }
    }

    const fetchBranches = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/branches/active');
            setBranchData(response.data.branches);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching branch records!");
        }
    }

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/subjects/active');
            setSubjectData(response.data.data);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching subject records!");
        }
    }

    const fetchTeachers = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/employees/teachers/active');
            setEmployeeData(response.data.data);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching teacher records!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string().trim().required("Class Name is required").max(50, "The maximum value allowed is 50"),
        start_time: Yup.string().trim().required("Start Time is required"),
        end_time: Yup.string().trim().required("End Time is required"),
        branchId: Yup.string().trim().required("Branch is required"),
        employeeId: Yup.string().trim().required("Teacher is required"),
        fee: Yup.number().required("Fee is required").positive("The value should be positive").min(0, "The minimum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        start_date: Yup.string().trim().required("Start Date is required"),
        end_date: Yup.string().trim().required("End Date is required"),
        class_room_no: Yup.number().nullable().positive("The value should be positive").min(1, "The minimum value allowed is 1").max(9999, "The maximum value allowed is 9999"),
        class_days: Yup.string().required("Class Days is required").oneOf(["Everyday", "Even Days", "Odd Days"], "Class Days should be one of: Everyday, Even Days, or Odd Days"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            name: "",
            start_time: "",
            end_time: "",
            branchId: "",
            employeeId: "",
            subjectId: "",
            fee: "",
            start_date: "",
            end_date: "",
            class_room_no: "",
            class_days: "",
        },
        validationSchema,
        onSubmit: async (values) => {

            try {
                setLoading(true);

                const response = await axios.patch(`http://localhost:3500/api/classes/${id}`, values);

                if (response.data.statusCode === 200) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);
                }
                else {
                    setShowToast(true);
                    setToastStatus("Error");
                    setToastMsg("Error creating class record!");
                }

                setLoading(false);
            } catch (error) {
                setLoading(false);

                if (error.code === "ERR_BAD_REQUEST") {
                    setShowToast(true);
                    setToastStatus("Error");
                    setToastMsg("Invalid input values!");
                }
                else {
                    setShowToast(true);
                    setToastStatus("Error");
                    setToastMsg("Internal server error!");
                }
            }
        },
    });

    const { values, touched, errors, handleChange, handleSubmit } = formik;
    const { name, start_time, end_time, branchId, employeeId, subjectId, fee, start_date, end_date, class_room_no, class_days } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Classes' parentRoute='/classes' childPage='Add' />
                    <div className="content">

                        <PageHeader pageTitle='Add Class' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col col-md-8">
                                        <Form.Group className="mb-3" controlId="formBasicClass">
                                            <Form.Label>Class Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={name}
                                                onChange={handleChange}
                                                placeholder="Enter Class Name"
                                                isInvalid={touched.name && !!errors.name}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.name}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicclass_room_no">
                                            <Form.Label>Class Room No.</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="class_room_no"
                                                value={class_room_no}
                                                onChange={handleChange}
                                                placeholder="Enter Class Room No."
                                                isInvalid={touched.class_room_no && !!errors.class_room_no}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.class_room_no}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicstart_date">
                                            <Form.Label>Select Start Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="start_date"
                                                value={start_date}
                                                onChange={handleChange}
                                                isInvalid={touched.start_date && !!errors.start_date}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.start_date}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicend_date">
                                            <Form.Label>Select End Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="end_date"
                                                value={end_date}
                                                onChange={handleChange}
                                                isInvalid={touched.end_date && !!errors.end_date}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.end_date}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicclass_days">
                                            <Form.Label>Select Class Days</Form.Label>
                                            <Form.Select aria-label="Select Class Days" name="class_days" isInvalid={touched.class_days && !!errors.class_days} value={class_days} onChange={handleChange}>
                                                <option value="">Select Class Days</option>
                                                <option value="Even Days">Even Days</option>
                                                <option value="Odd Days">Odd Days</option>
                                                <option value="Everyday">Everyday</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.class_days}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicFee">
                                            <Form.Label>Enter Fee</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="fee"
                                                value={fee}
                                                onChange={handleChange}
                                                placeholder="Enter Fee"
                                                isInvalid={touched.fee && !!errors.fee}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.fee}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicstart_time">
                                            <Form.Label>Select Start Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="start_time"
                                                value={start_time}
                                                onChange={handleChange}
                                                isInvalid={touched.start_time && !!errors.start_time}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.start_time}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicend_time">
                                            <Form.Label>Select End Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="end_time"
                                                value={end_time}
                                                onChange={handleChange}
                                                isInvalid={touched.end_time && !!errors.end_time}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.end_time}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicBranchId">
                                            <Form.Label>Select Branch</Form.Label>
                                            <Form.Select aria-label="Select Branch" name="branchId" isInvalid={touched.branchId && !!errors.branchId} value={branchId} onChange={handleChange}>
                                                <option key="branch01" value="">Select Branch</option>
                                                {branchData.length > 0 ? (
                                                    branchData.map((row) => (
                                                        <option key={row.branch_id} value={row.branch_id}>{row.branch}</option>
                                                    ))
                                                ) : (
                                                    <option key="branch00" value="">No branch found</option>
                                                )}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.branchId}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicSubjectId">
                                            <Form.Label>Select Subject</Form.Label>
                                            <Form.Select aria-label="Select Subject" name="subjectId" isInvalid={touched.subjectId && !!errors.subjectId} value={subjectId} onChange={handleChange}>
                                                <option key="subject01" value="">Select Subject</option>
                                                {subjectData.length > 0 ? (
                                                    subjectData.map((row) => (
                                                        <option key={row.subject_id} value={row.subject_id}>{row.subject}</option>
                                                    ))
                                                ) : (
                                                    <option key="subject00" value="">No subject found</option>
                                                )}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.subjectId}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicemployeeId">
                                            <Form.Label>Select Teacher</Form.Label>
                                            <Form.Select aria-label="Select Teacher" name="employeeId" isInvalid={touched.employeeId && !!errors.employeeId} value={employeeId} onChange={handleChange}>
                                                <option key="teacher01" value="">Select Teacher</option>
                                                {employeeData.length > 0 ? (
                                                    employeeData.map((row) => (
                                                        <option key={row.employee_id} value={row.employee_id}>{row.name}</option>
                                                    ))
                                                ) : (
                                                    <option key="teacher00" value="">No teacher found</option>
                                                )}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.employeeId}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Update Class
                                </Button>
                            </Form>

                            {/* Toast messages */}
                            <ToastMsg
                                show={showToast}
                                setShow={setShowToast}
                                msg={toastMsg}
                                status={toastStatus}
                            />
                        </div>
                    </div>

                    <Footer />
                </div>
            </div>
        </>
    )
}

export default EditClass;
