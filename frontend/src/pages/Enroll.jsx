import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
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
import { useParams } from "react-router-dom";


const Enroll = () => {
    const [loading, setLoading] = useState(false);
    const [classData, setClassData] = useState([]);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');

    const { id } = useParams();

    useEffect(() => {
        fetchClasses();
    }, [])

    const fetchClasses = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/classes/branch/active');
            console.log(response.data);
            setClassData(response.data.data);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching class records!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        received: Yup.number().required("Received Amount is required").min(0, "The minimum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        due: Yup.number().nullable().min(0, "The minimum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        discount: Yup.number().nullable().min(0, "The minimum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        classId: Yup.number().required("Class is required")
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            received: "",
            due: 0,
            discount: 0,
            classId: "",
        },
        validationSchema,
        onSubmit: async (values) => {

            try {
                setLoading(true);

                const response = await axios.post('http://localhost:3500/api/enrolls/new', {...values, studentId: id});

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
                    setToastMsg("Error enrolling student!");
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
    const { received, due, discount, classId } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Enrolls' parentRoute='/enrolls' childPage='Enroll' />
                    <div className="content">

                        <PageHeader pageTitle='Enroll Student' actionName='Add Student' actionLink='/students/new' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col col-md-6">
                                        <Form.Group className="mb-3" controlId="formBasicReceived">
                                            <Form.Label>Received Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="received"
                                                value={received}
                                                onChange={handleChange}
                                                placeholder="Enter Received Amount"
                                                isInvalid={touched.received && !!errors.received}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.received}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-6">
                                        <Form.Group className="mb-3" controlId="formBasicDue">
                                            <Form.Label>Due Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="due"
                                                value={due}
                                                onChange={handleChange}
                                                placeholder="Enter Due Amount"
                                                isInvalid={touched.due && !!errors.due}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.due}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col col-md-6">
                                        <Form.Group className="mb-3" controlId="formBasicDiscount">
                                            <Form.Label>Discount Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="discount"
                                                value={discount}
                                                onChange={handleChange}
                                                placeholder="Enter Discount Amount"
                                                isInvalid={touched.discount && !!errors.discount}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.discount}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-6">
                                        <Form.Group className="mb-3" controlId="formBasicClassId">
                                            <Form.Label>Select Class</Form.Label>
                                            <Form.Select aria-label="Select Class" name="classId" isInvalid={touched.classId && !!errors.classId} value={classId} onChange={handleChange}>
                                                <option key="class01" value="">Select Class</option>
                                                {classData.length > 0 ? (
                                                    classData.map((row) => (
                                                        <option key={row.class_id} value={row.class_id}>{row.class}</option>
                                                    ))
                                                ) : (
                                                    <option key="class00" value="">No class found</option>
                                                )}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.classId}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Enroll Student
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

export default Enroll;
