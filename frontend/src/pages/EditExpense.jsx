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


const EditExpense = () => {
    const [loading, setLoading] = useState(false);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');
    // Edit States
    const [expenseData, setExpenseData] = useState({});
    const { id } = useParams();

    useEffect(() => {
        fetchExpenseData(id);
    }, [id]);

    const fetchExpenseData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/expenses/info/${id}`);
            setExpenseData(response.data.data[0]);
            formik.setValues({
                info: response.data.data[0].info,
                amount: response.data.data[0].amount,
            });
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching expense information!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        info: Yup.string().required("Expense information is required").max(255, "The maximum value allowed is 255"),
        amount: Yup.number()
            .required("Expense amount is required")
            .min(0, "Expense Amount must be greater than or equal to 0")
            .max(9999999999, "The maximum value allowed is 9999999999")
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            info: "",
            amount: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const response = await axios.patch(`http://localhost:3500/api/expenses/${id}`, values);

                if (response.data.statusCode === 201) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);
                }
                else {
                    setShowToast(true);
                    setToastStatus("Error");
                    setToastMsg("Error updating expense record!");
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
                    setToastMsg("Error updating expense record!");
                }
            }
        },
    });

    const { values, touched, errors, handleChange, handleSubmit } = formik;
    const { info, amount } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Expenses' parentRoute='/expenses' childPage='Edit' />
                    <div className="content">

                        <PageHeader pageTitle='Edit Expense' actionName='Enroll Student ' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col col-md-9">
                                        <Form.Group className="mb-3" controlId="formBasicInformation">
                                            <Form.Label>Expense Details</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="info"
                                                value={info}
                                                onChange={handleChange}
                                                placeholder="Enter Expense Details"
                                                isInvalid={touched.info && !!errors.info}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.info}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-3">
                                        <Form.Group className="mb-3" controlId="formBasicAmount">
                                            <Form.Label>Expense Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="amount"
                                                value={amount}
                                                onChange={handleChange}
                                                placeholder="Enter Expense Amount"
                                                isInvalid={touched.amount && !!errors.amount}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.amount}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PencilFill />} Update Expense
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
                </div >
            </div >
        </>
    )
}

export default EditExpense;
