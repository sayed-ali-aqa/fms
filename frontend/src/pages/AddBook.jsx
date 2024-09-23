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


const AddBook = () => {
    const [loading, setLoading] = useState(false);
    const [branchData, setBranchData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');

    useEffect(() => {
        fetchBranches();
        fetchCategories();
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

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/categories/active');
            setCategoryData(response.data.categories);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching category records!");
        }
    }


    // Define validation schema using Yup
    const validationSchema = Yup.object({
        title: Yup.string().trim().required("Book Title is required").max(100, "The maximum value allowed is 50"),
        author: Yup.string().trim().required("Author Name is required").max(150, "The maximum value allowed is 150"),
        price: Yup.number().required("Price is required").min(0, "The maximum value allowed is 0").max(9999, "The maximum value allowed is 9999"),
        quantity: Yup.number().required("Book quantity is required").min(0, "The maximum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        categoryId: Yup.string().trim().required("Book category is required"),
        branchId: Yup.string().trim().required("Branch is required"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            title: "",
            author: "",
            price: "",
            quantity: "",
            categoryId: "",
            branchId: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const response = await axios.post('http://localhost:3500/api/Books/new', values);

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
                    setToastMsg("Error creating book record!");
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
                    setToastMsg("Error creating book record!");
                }
            }
        },
    });

    const { values, touched, errors, handleChange, handleSubmit } = formik;
    const { title, author, price, quantity, categoryId, branchId } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Books' parentRoute='/books' childPage='Add' />
                    <div className="content">

                        <PageHeader pageTitle='Add Book' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col">
                                        <Form.Group className="mb-3" controlId="formBasicBookTitle">
                                            <Form.Label>Book Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={title}
                                                onChange={handleChange}
                                                placeholder="Enter Book Title"
                                                isInvalid={touched.title && !!errors.title}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.title}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col">
                                        <Form.Group className="mb-3" controlId="formBasicAuthor">
                                            <Form.Label>Author Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="author"
                                                value={author}
                                                onChange={handleChange}
                                                placeholder="Enter Author Name"
                                                isInvalid={touched.author && !!errors.author}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.author}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <Form.Group className="mb-3" controlId="formBasicPrice">
                                            <Form.Label>Price</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="price"
                                                value={price}
                                                onChange={handleChange}
                                                placeholder="Enter Price"
                                                isInvalid={touched.price && !!errors.price}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.price}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col">
                                        <Form.Group className="mb-3" controlId="formBasicQuantity">
                                            <Form.Label>Quantity</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="quantity"
                                                value={quantity}
                                                onChange={handleChange}
                                                placeholder="Enter Quantity"
                                                isInvalid={touched.quantity && !!errors.quantity}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.quantity}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col">
                                        <Form.Group className="mb-3" controlId="formBasicCategory">
                                            <Form.Label>Select Category</Form.Label>
                                            <Form.Select aria-label="Select Branch" name="categoryId" isInvalid={touched.categoryId && !!errors.categoryId} value={categoryId} onChange={handleChange}>
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

                                    <div className="col">
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
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Add Book
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

export default AddBook;
