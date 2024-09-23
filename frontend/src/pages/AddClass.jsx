import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Link } from "react-router-dom";
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


const AddClass = () => {
    const [loading, setLoading] = useState(false);
    const [branchData, setBranchData] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);
    const [ampm, setAmPm] = useState(''); // State to store AM or PM
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');

    useEffect(() => {
        fetchBranches();
        fetchSubjects();
        fetchTeachers();
    }, [])

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
        startTime: Yup.string().trim().required("Start Time is required"),
        endTime: Yup.string().trim().required("End Time is required"),
        branchId: Yup.string().trim().required("Branch is required"),
        employeeId: Yup.string().trim().required("Teacher is required"),
        fee: Yup.number().required("Fee is required").positive("The value should be positive").min(0, "The minimum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        startDate: Yup.string().trim().required("Start Date is required"),
        endDate: Yup.string().trim().required("End Date is required"),
        classRoomNo: Yup.number().nullable().positive("The value should be positive").min(1, "The minimum value allowed is 1").max(9999, "The maximum value allowed is 9999"),
        classDays: Yup.string().required("Class Days is required").oneOf(["Everyday", "Even Days", "Odd Days"], "Class Days should be one of: Everyday, Even Days, or Odd Days"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            name: "",
            startTime: "",
            endTime: "",
            branchId: "",
            employeeId: "",
            subjectId: "",
            fee: "",
            startDate: "",
            endDate: "",
            classRoomNo: "",
            classDays: "",
        },
        validationSchema,
        onSubmit: async (values) => {

            try {
                setLoading(true);

                const response = await axios.post('http://localhost:3500/api/classes/new', values);

                if (response.data.statusCode === 201) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);

                    // Reset the form fields after submission
                    formik.resetForm();
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
    const { name, startTime, endTime, branchId, employeeId, subjectId, fee, startDate, endDate, classRoomNo, classDays } = values;

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
                                        <Form.Group className="mb-3" controlId="formBasicClassRoomNo">
                                            <Form.Label>Class Room No.</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="classRoomNo"
                                                value={classRoomNo}
                                                onChange={handleChange}
                                                placeholder="Enter Class Room No."
                                                isInvalid={touched.classRoomNo && !!errors.classRoomNo}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.classRoomNo}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicStartDate">
                                            <Form.Label>Select Start Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="startDate"
                                                value={startDate}
                                                onChange={handleChange}
                                                isInvalid={touched.startDate && !!errors.startDate}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.startDate}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicEndDate">
                                            <Form.Label>Select End Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="endDate"
                                                value={endDate}
                                                onChange={handleChange}
                                                isInvalid={touched.endDate && !!errors.endDate}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.endDate}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicClassDays">
                                            <Form.Label>Select Class Days</Form.Label>
                                            <Form.Select aria-label="Select Class Days" name="classDays" isInvalid={touched.classDays && !!errors.classDays} value={classDays} onChange={handleChange}>
                                                <option value="">Select Class Days</option>
                                                <option value="Even Days">Even Days</option>
                                                <option value="Odd Days">Odd Days</option>
                                                <option value="Everyday">Everyday</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.classDays}
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
                                        <Form.Group className="mb-3" controlId="formBasicStartTime">
                                            <Form.Label>Select Start Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="startTime"
                                                value={startTime}
                                                onChange={handleChange}
                                                isInvalid={touched.startTime && !!errors.startTime}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.startTime}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicEndTime">
                                            <Form.Label>Select End Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="endTime"
                                                value={endTime}
                                                onChange={handleChange}
                                                isInvalid={touched.endTime && !!errors.endTime}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.endTime}
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
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Add Class
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

export default AddClass;
