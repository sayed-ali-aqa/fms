import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState } from "react";
import { PlusLg } from "react-bootstrap-icons";
import Spinner from 'react-bootstrap/Spinner';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ToastMsg from "../components/ToastMsg";
import PageHeader from "../components/PageHeader";
import { useParams } from "react-router-dom";


const SellBook = () => {
    const [loading, setLoading] = useState(false);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');

    const { id } = useParams();

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        received: Yup.number().required("Received Amount is required").min(0, "The minimum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        due: Yup.number().nullable().min(0, "The minimum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        discount: Yup.number().nullable().min(0, "The minimum value allowed is 0").max(99999, "The maximum value allowed is 99999"),
        buyerInfo: Yup.string().trim().nullable(),
        quantity: Yup.number().required().min(1, "The minimum value allowed is 1").max(99, "The maximum value allowed is 99"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            received: "",
            due: 0,
            discount: 0,
            buyerInfo: "",
            quantity: 1
        },
        validationSchema,
        onSubmit: async (values) => {

            try {
                setLoading(true);

                const response = await axios.post('http://localhost:3500/api/books/sell', { ...values, bookId: id });

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
    const { received, due, discount, buyerInfo, quantity } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Book Sales' parentRoute='/book-sales' childPage='Sell' />
                    <div className="content">

                        <PageHeader pageTitle='Sell Book' actionName='Add Student' actionLink='/students/new' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col col-md-8">
                                        <Form.Group className="mb-3" controlId="formBasicBuyerInfo">
                                            <Form.Label>Buyer Info</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="buyerInfo"
                                                value={buyerInfo}
                                                onChange={handleChange}
                                                placeholder="Enter Buyer Info"
                                                isInvalid={touched.buyerInfo && !!errors.buyerInfo}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.buyerInfo}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicQuantity">
                                            <Form.Label>Book Quantity</Form.Label>
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

                                <div className="row">
                                    <div className="col col-md-4">
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

                                    <div className="col col-md-4">
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

                                    <div className="col col-md-4">
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

                                <Button variant="primary" className="mt-4" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Sell Book
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

export default SellBook;
