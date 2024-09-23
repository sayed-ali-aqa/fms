import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Link, useParams } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from "react";
import { PencilFill } from "react-bootstrap-icons";
import Spinner from 'react-bootstrap/Spinner';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ToastMsg from "../components/ToastMsg";
import PageHeader from "../components/PageHeader";


const EditSubject = () => {
    const [loading, setLoading] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');
    // Edit states
    const [subjectData, setSubjectData] = useState({});
    const { id } = useParams();

    useEffect(() => {
        fetchCategories();
        fetchSubjectData(id);
    }, [id]);

    const fetchSubjectData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/subjects/info/${id}`);
            setSubjectData(response.data.data[0]);

            formik.setValues({
                subject: response.data.data[0].subject,
                categoryId: String(response.data.data[0].category_id), // Convert categoryId to string
            });
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching subject information!");
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/categories');
            setCategoryData(response.data.categories);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching category records!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        subject: Yup.string().trim().required("Subject Name is required").max(50, "The maximum value allowed is 50"),
        categoryId: Yup.string().trim().required("Category is required"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            subject: "",
            categoryId: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const response = await axios.patch(`http://localhost:3500/api/subjects/${id}`, values);

                if (response.data.statusCode === 200) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);
                }
                else if (response.status === 204) {
                    setShowToast(true);
                    setToastStatus("Fail");
                    setToastMsg('Subject name already exists!');
                }
                else {
                    setShowToast(true);
                    setToastStatus("Error");
                    setToastMsg("Error updating subject record!");
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
                    setToastMsg("Error updating subject record!");
                }
            }
        },
    });

    const { values, touched, errors, handleChange, handleSubmit } = formik;
    const { subject, categoryId } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Subjects' parentRoute='/subjects' childPage='Edit' />
                    <div className="content">

                        <PageHeader pageTitle='Edit Subject' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row mb-2">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3" controlId="formBasicSubject">
                                            <Form.Label>Subject Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="subject"
                                                value={subject}
                                                onChange={handleChange}
                                                placeholder="Enter Subject Name"
                                                isInvalid={touched.subject && !!errors.subject}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.subject}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-6">
                                        <Form.Group className="mb-3" controlId="formBasicCategoryId">
                                            <Form.Label>Select Category</Form.Label>
                                            <Form.Select aria-label="Select Category" name="categoryId" isInvalid={touched.categoryId && !!errors.categoryId} value={categoryId} onChange={handleChange}>
                                                <option key="category01" value="">Select Category</option>
                                                {categoryData.length > 0 ? (
                                                    categoryData.map((row) => (
                                                        <option key={row.category_id} value={row.category_id}>{row.category}</option>
                                                    ))
                                                ) : (
                                                    <option key="category00" value="">No category found</option>
                                                )}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.categoryId}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PencilFill />} Update Subject
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

export default EditSubject;
