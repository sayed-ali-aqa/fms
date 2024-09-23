import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { PencilFill } from "react-bootstrap-icons";
import Spinner from 'react-bootstrap/Spinner';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ToastMsg from "../components/ToastMsg";
import PageHeader from "../components/PageHeader";


const EditCategory = () => {
    const [loading, setLoading] = useState(false);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');
    // Edit States
    const [categoryData, setCategoryData] = useState({});
    const { id } = useParams();

    useEffect(() => {
        fetchCategoryData(id);
    }, [id]);

    const fetchCategoryData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/categories/info/${id}`);
            setCategoryData(response.data.data[0]);

            formik.setValues({
                category: response.data.data[0].category,
            });
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching category information!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        category: Yup.string().required("Category Name is required").max(30, "The maximum value allowed is 30"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            category: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const response = await axios.patch(`http://localhost:3500/api/categories/${id}`, values);

                if (response.data.statusCode === 201) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);
                }
                else if (response.status === 204) {
                    setShowToast(true);
                    setToastStatus("Fail");
                    setToastMsg('The category name already exists!');
                }
                else {
                    setShowToast(true);
                    setToastStatus("Error");
                    setToastMsg(response.data.msg);
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
    const { category } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">

                    <Navbar parentPage='Categories' parentRoute='/categories' childPage='Edit' />

                    <div className="content">

                        <PageHeader pageTitle='Category Lists' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <Form.Group className="mb-3" controlId="formBasicCategory">
                                        <Form.Label>Category Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="category"
                                            value={category}
                                            onChange={handleChange}
                                            placeholder="Enter Category Name"
                                            isInvalid={touched.category && !!errors.category}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.category}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>

                                <Button className="mt-2" variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PencilFill />} Update Category
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
    );
};

export default EditCategory;
