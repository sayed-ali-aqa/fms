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


const EditBranch = () => {
    const [loading, setLoading] = useState(false);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');
    // Edit States
    const [branchData, setBranchData] = useState({});
    const { id } = useParams();

    useEffect(() => {
        fetchBranchData(id);
    }, [id]);

    const fetchBranchData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/branches/info/${id}`);
            setBranchData(response.data.data[0]);
            formik.setValues({
                branch: response.data.data[0].branch,
                address: response.data.data[0].address,
            });
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching branch information!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        branch: Yup.string().required("Branch Name is required").max(30, "The maximum value allowed is 30"),
        address: Yup.string().required("Branch Address is required").max(150, "The maximum value allowed is 150"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            branch: "",
            address: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const response = await axios.patch(`http://localhost:3500/api/branches/${id}`, values);

                console.log(response);

                if (response.data.statusCode === 200) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);
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
                    setToastMsg("Internal server error!");
                }
            }
        },
    });

    const { values, touched, errors, handleChange, handleSubmit } = formik;
    const { branch, address } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">

                    <Navbar parentPage='Branches' parentRoute='/branches' childPage='Edit' />

                    <div className="content">

                        <PageHeader pageTitle='Branch Lists' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col-md-5">
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
                                    <div className="col-md-7">
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
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PencilFill />} Update Branch
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

export default EditBranch;
