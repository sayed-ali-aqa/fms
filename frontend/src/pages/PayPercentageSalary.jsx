import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from "react";
import { CashCoin } from "react-bootstrap-icons";
import Spinner from 'react-bootstrap/Spinner';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ToastMsg from "../components/ToastMsg";
import PageHeader from "../components/PageHeader";
import { useParams } from "react-router-dom";


const PayPercentageSalary = () => {
    const [loading, setLoading] = useState(false);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');

    const [salaryInfo, setSalaryInfo] = useState({});

    const { id } = useParams();

    const fetchSalaryInfo = async () => {
        try {
            const response = await axios.get(`http://localhost:3500/api/salaries/info/percentage-type/${id}`);
            setSalaryInfo(response.data.data[0]);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching salary info!");
        }
    }

    useEffect(() => {
        fetchSalaryInfo();
    }, []);

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        paidAmount: Yup.number()
            .required("Paid Amount is required")
            .min(0, "Paid Amount must be greater than or equal to 0")
            .max(999999, "The maximum value allowed is 999999"),
        salaryDetails: Yup.string().required("Salary Details is required").max(100, "The maximum value allowed is 100"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            paidAmount: "",
            salaryDetails: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const response = await axios.post(`http://localhost:3500/api/salaries/pay/percentage-type/${salaryInfo.class_id}`, values);

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
                    setToastMsg("Error paying salary!");
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
    const { paidAmount, salaryDetails } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Salaries' parentRoute='/salaries' childPage='Pay' />
                    <div className="content">

                        <PageHeader pageTitle={`Pay Salary - Total: ${Number(salaryInfo.salary)}`} actionName='Enroll Student ' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col col-md-3">
                                        <Form.Group className="mb-3" controlId="formBasicPaidAmount">
                                            <Form.Label>Paid Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="paidAmount"
                                                value={paidAmount}
                                                onChange={handleChange}
                                                placeholder="Enter Paid Amount"
                                                isInvalid={touched.paidAmount && !!errors.paidAmount}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.paidAmount}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-9">
                                        <Form.Group className="mb-3" controlId="formBasicSalaryDetails">
                                            <Form.Label>Salary Details</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="salaryDetails"
                                                value={salaryDetails}
                                                onChange={handleChange}
                                                placeholder="Enter Salary Details"
                                                isInvalid={touched.salaryDetails && !!errors.salaryDetails}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.salaryDetails}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <CashCoin />} Pay Salary
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

export default PayPercentageSalary;
