import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { PlusLg } from "react-bootstrap-icons";
import Spinner from 'react-bootstrap/Spinner';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ToastMsg from "../components/ToastMsg";
import PageHeader from '../components/PageHeader';


const AddBranch = () => {
    const [loading, setLoading] = useState(false);
    const [managerData, setManagerData] = useState([]);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');

    useEffect(() => {
        fetchManagers();
    }, [])

    const fetchManagers = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/managers');
            setManagerData(response.data.managers);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching manager records!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        branch: Yup.string().trim().required("Branch Name is required").max(30, "The maximum value allowed is 30"),
        address: Yup.string().trim().required("Branch Address is required").max(150, "The maximum value allowed is 150"),
        managerId: Yup.string().trim().required("Manager is required"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            branch: "",
            address: "",
            managerId: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const response = await axios.post('http://localhost:3500/api/branches/new', values);

                if (response.data.statusCode === 201) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);
                    await fetchManagers();

                    // Reset the form fields after submission
                    formik.resetForm();
                }
                else if (response.status === 204) {
                    setShowToast(true);
                    setToastStatus("Fail");
                    setToastMsg('Branch name already exists!');
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
                    setToastMsg('Internal server error!');
                }
            }
        },
    });

    const { values, touched, errors, handleChange, handleSubmit } = formik;
    const { branch, address, managerId } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">

                    <Navbar parentPage='Branches' parentRoute='/branches' childPage='Add' />

                    <div className="content">

                        <PageHeader pageTitle='Add New Branch' actionName='Enroll Student' actionLink='/student/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicBranch">
                                            <Form.Label>Branch Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="branch"
                                                value={branch}
                                                onChange={handleChange}
                                                placeholder="Enter Branch Name"
                                                isInvalid={touched.branch && !!errors.branch}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.branch}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicAddress">
                                            <Form.Label>Branch Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                value={address}
                                                onChange={handleChange}
                                                placeholder="Enter Branch Address"
                                                isInvalid={touched.address && !!errors.address}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.address}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicManagerId">
                                            <Form.Label>Select Manager</Form.Label>
                                            <Form.Select aria-label="Select Manager" name="managerId" isInvalid={touched.managerId && !!errors.managerId} value={managerId} onChange={handleChange}>
                                                <option key="manager01" value="">Select Manager</option>
                                                {managerData.length > 0 ? (
                                                    managerData.map((row) => (
                                                        <option key={row.user_id} value={row.user_id}>{row.name}</option>
                                                    ))
                                                ) : (
                                                    <option key="manager00" value="">No manager found</option>
                                                )}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.managerId}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Add Branch
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

export default AddBranch;
