import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState } from "react";
import { PersonSquare, PlusLg } from "react-bootstrap-icons";
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRef } from "react";
import axios from "axios";
import ToastMsg from "../components/ToastMsg";
import PageHeader from "../components/PageHeader";


const AddManager = () => {
    const [loading, setLoading] = useState(false);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');
    // State variable for previewing the selected image
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    // Create a ref
    const imageRef = useRef(null);

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string().trim().required("Full name is required").max(30, "The maximum value allowed is 30"),
        phone: Yup.string().trim().required("Phone Number is required").matches(/^[0-9\-+]+$/, "Invalid phone number format").max(10, "The maximum value allowed is 10"),
        email: Yup.string().trim().email("Invalid Email format").required("Email Address is required").max(150, "The maximum value allowed is 150"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            name: "",
            phone: "",
            email: "",
            image: null,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {

                // Custom Image validation for newly selected image
                if (selectedImage !== null) {
                    // Check if the image size is greater than 2MB
                    if (selectedImage.size > 2 * 1024 * 1024) {
                        formik.setFieldError("image", "Image size is too large (maximum allowed is 2MB)");
                        return;
                    }
                    // Check if the image type is not jpeg, png, or jpg
                    else if (selectedImage.type !== "image/jpeg" && selectedImage.type !== "image/png" && selectedImage.type !== "image/jpg") {
                        formik.setFieldError("image", "Unsupported file format (only jpeg, png, or jpg are allowed)");
                        return;
                    }
                }

                setLoading(true);

                const formData = new FormData();

                formData.append('name', values.name);
                formData.append('phone', values.phone);
                formData.append('email', values.email);
                formData.append('image', selectedImage);

                // Send FormData object containing form data and image file to the backend
                const response = await axios.post('http://localhost:3500/api/managers/new', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' } // Set content type to multipart/form-data
                });

                if (response.data.statusCode === 201) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);

                    // Reset the form fields after submission
                    formik.resetForm();
                    // Reset the image field specifically
                    setSelectedImage(null);
                    if (imageRef.current) {
                        imageRef.current.value = '';
                    }
                }
                else if (response.status === 204) {
                    setShowToast(true);
                    setToastStatus("Fail");
                    setToastMsg('The email already exists!');
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
                    setToastMsg("Inernal server error!");
                }
            }
        },
    });

    const { values, touched, errors, handleChange, handleSubmit } = formik;
    const { name, phone, email } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Managers' parentRoute='/managers' childPage='Add' />

                    <div className="content">

                        <PageHeader pageTitle='Add New Manager' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="col-md-3">
                                            {
                                                previewImage ? (
                                                    <Image
                                                        src={ previewImage }
                                                        rounded
                                                        fluid
                                                        thumbnail
                                                        style={{ maxHeight: '220px', maxWidth: '165px' }}
                                                    />
                                                ) :
                                                    (
                                                        < PersonSquare fill="#7e8299" width={'165px'} height={'165px'} />
                                                    )
                                            }
                                        </div>
                                    </div>

                                    <div className="col-md-9">
                                        <div className="row mb-2">
                                            <div className="col">
                                                <Form.Group className="mb-3" controlId="formBasicFullName">
                                                    <Form.Label>Full Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={name}
                                                        onChange={handleChange}
                                                        placeholder="Enter Full Name"
                                                        isInvalid={touched.name && !!errors.name}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.name}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>

                                            <div className="col">
                                                <Form.Group className="mb-3" controlId="formBasicPhone">
                                                    <Form.Label>Phone Number</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="phone"
                                                        value={phone}
                                                        onChange={handleChange}
                                                        placeholder="Enter Phone Number"
                                                        isInvalid={touched.phone && !!errors.phone}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.phone}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>
                                        </div>

                                        <div className="row mb-4">
                                            <div className="col col-md-6">
                                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                                    <Form.Label>Email Address</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="email"
                                                        value={email}
                                                        onChange={handleChange}
                                                        placeholder="Enter Email Address"
                                                        isInvalid={touched.email && !!errors.email}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>

                                            <div className="col-md-6">
                                                <Form.Group controlId="formBasicFileName" className="mb-3">
                                                    <Form.Label>Upload Image</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        ref={imageRef}
                                                        name='image'
                                                        accept="image/*"
                                                        onChange={(event) => {
                                                            const file = event.currentTarget.files[0];
                                                            setPreviewImage(URL.createObjectURL(file)); // Set temporary URL for preview
                                                            setSelectedImage(file); // Set image file in formik values
                                                        }}
                                                        size="md"
                                                        isInvalid={touched.image && !!errors.image}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.image}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Add Manager
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

export default AddManager;
