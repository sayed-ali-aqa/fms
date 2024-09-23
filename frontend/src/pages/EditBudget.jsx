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


const EditBudget = () => {
    const [loading, setLoading] = useState(false);
    const [branchData, setBranchData] = useState([]);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');
    // Edit States
    const { id } = useParams();

    useEffect(() => {
        fetchBranches();
        fetchBudgetData(id);
    }, [id])

    const fetchBudgetData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/budgets/info/${id}`);
            
            formik.setValues({
                amount: response.data.data[0].amount,
                branchId: response.data.data[0].branch_id,
            });
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching budget information!");
        }
    }

    const fetchBranches = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/branches');
            setBranchData(response.data.branches);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching branch records!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        amount: Yup.number()
            .required("Budget amount is required")
            .min(0, "Budget Amount must be greater than or equal to 0")
            .max(999999999999, "The maximum value allowed is 999999999999")
            .positive("Budget Amount must be positive"),
        branchId: Yup.string().trim().required("Branch is required"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            amount: "",
            branchId: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const response = await axios.patch(`http://localhost:3500/api/budgets/${id}`, values);

                console.log(response);

                if (response.data.statusCode === 200) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);
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
    const { amount, branchId } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Budgets' parentRoute='/budgets' childPage="Edit" />
                    <div className="content">

                        <PageHeader pageTitle='Budget Lists' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col">
                                        <Form.Group className="mb-3" controlId="formBasicAmount">
                                            <Form.Label>Budget Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="amount"
                                                value={amount}
                                                onChange={handleChange}
                                                placeholder="Enter Budget Amount"
                                                isInvalid={touched.amount && !!errors.amount}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.amount}
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
                                    {loading ? <Spinner size="sm" animation="border" /> : <PencilFill />} Update Budget
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
            </div >
        </>
    )
}

export default EditBudget;
