import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useEffect, useRef } from "react";
import { PersonSquare, PlusLg } from "react-bootstrap-icons";
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ToastMsg from "../components/ToastMsg";
import PageHeader from "../components/PageHeader";


const AddStudent = () => {
    const [loading, setLoading] = useState(false);
    // State variable for previewing the selected image
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    // Create a ref
    const imageRef = useRef(null);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');


    // Define validation schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string().trim().required("Full Name is required").max(50, "The maximum value allowed is 50"),
        fatherName: Yup.string().trim().required("Father Name is required").max(50, "The maximum value allowed is 50"),
        gender: Yup.string().trim().required("Gender is required").oneOf(['Male', 'Female'], "Invalid gender"),
        education: Yup.string().trim().required("Education is required").max(20, "The maximum value allowed is 50"),
        dob: Yup.date().nullable(),
        phone: Yup.string().trim().required("Phone Number is required").matches(/^[0-9\-+]+$/, "Invalid phone number format").max(10, "The maximum value allowed is 10"),
        address: Yup.string().trim().nullable().max(150, "The maximum value allowed is 150"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            name: "",
            fatherName: "",
            gender: "",
            education: "",
            dob: "",
            phone: "",
            address: "",
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
                formData.append('fatherName', values.fatherName);
                formData.append('gender', values.gender);
                formData.append('education', values.education);
                formData.append('dob', values.dob);
                formData.append('phone', values.phone);
                formData.append('address', values.address);
                formData.append('image', selectedImage);

                // Send FormData object containing form data and image file to the backend
                const response = await axios.post('http://localhost:3500/api/students/new', formData, {
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
                } else if (response.data.statusCode === 400) {
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
                    setToastMsg(error.response.data.msg);
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
    const { name, fatherName, gender, education, dob, phone, address } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Students' parentRoute='/students' childPage='Add' />
                    <div className="content">

                        <PageHeader pageTitle='Add Student' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit} encType='multipart/form-data'>

                                <div className="row">
                                    <div className="col-md-3">
                                        {
                                            (gender && gender !== "") ? (
                                                <Image
                                                    src={
                                                        previewImage ? previewImage :
                                                            (gender && gender === "Female" ? '/public/images/avatar/female-avatar.png' : '/public/images/avatar/male-avatar.png')
                                                    }
                                                    rounded
                                                    fluid
                                                    thumbnail
                                                    style={{ maxHeight: '220px', maxWidth: '165px' }}
                                                />
                                            ) :
                                                <PersonSquare fill="#7e8299" width={'165px'} height={'165px'} />
                                        }
                                    </div>
                                    <div className="col-md-9">
                                        <div className="row mb-2">
                                            <div className="col col-md-6">
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

                                            <div className="col col-md-6">
                                                <Form.Group className="mb-3" controlId="formBasicFatherName">
                                                    <Form.Label>Father Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="fatherName"
                                                        value={fatherName}
                                                        onChange={handleChange}
                                                        placeholder="Enter Father Name"
                                                        isInvalid={touched.fatherName && !!errors.fatherName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.fatherName}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col col-md-6">
                                                <Form.Group className="mb-3" controlId="formBasicGender">
                                                    <Form.Label>Select Gender</Form.Label>
                                                    <Form.Select aria-label="Select Gender" name="gender" isInvalid={touched.gender && !!errors.gender} value={gender} onChange={handleChange}>
                                                        <option key="gender00" value="">Select Gender</option>
                                                        <option key="Male" value="Male">Male</option>
                                                        <option key="Female" value="Female">Female</option>

                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                        {errors.gender}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>

                                            <div className="col col-md-6">
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
                                    </div>
                                </div>

                                <div className="row mt-2">
                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicDob">
                                            <Form.Label>Date of Birth</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dob"
                                                value={dob}
                                                onChange={handleChange}
                                                isInvalid={touched.dob && !!errors.dob}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.dob}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-8">
                                        <Form.Group className="mb-3" controlId="formBasicAddress">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                value={address}
                                                onChange={handleChange}
                                                placeholder="Enter Address (optional)"
                                                isInvalid={touched.address && !!errors.address}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.address}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col col-md-6">
                                        <Form.Group className="mb-3" controlId="formBasicEducation">
                                            <Form.Label>Select Education</Form.Label>
                                            <Form.Select aria-label="Select Education" name="education" isInvalid={touched.education && !!errors.education} value={education} onChange={handleChange}>
                                                <option key="education00" value="">Select Education</option>
                                                <option key="education01" value="Below 6th Grade">Below 6th Grade</option>
                                                <option key="education02" value="Above 6th Grade">Above 6th Grade</option>
                                                <option key="education03" value="School Graduate">School Graduate</option>
                                                <option key="education04" value="14 Graduate">14 Graduate</option>
                                                <option key="education05" value="Bachelor">Bachelor</option>
                                                <option key="education06" value="Master">Master</option>
                                                <option key="education07" value="PHD">PHD</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.education}
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

                                <Button className="mt-4" variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Add Student
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

export default AddStudent;
