import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useEffect, useRef } from "react";
import { PlusLg, PersonSquare } from "react-bootstrap-icons";
import Spinner from 'react-bootstrap/Spinner';
import Image from 'react-bootstrap/Image';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useParams } from "react-router-dom";
import ToastMsg from "../components/ToastMsg";
import PageHeader from "../components/PageHeader";

const EditEmployee = () => {
    const [loading, setLoading] = useState(false);
    const [branchData, setBranchData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastStatus, setToastStatus] = useState('');
    // Edit states
    const { id } = useParams();
    // Create a ref
    const imageRef = useRef(null);
    // State variable for previewing the selected image
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchEmployeeData(id);
        fetchBranches();
        fetchCategories();
    }, []);

    const fetchEmployeeData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/employees/info/${id}`);
            formik.setValues({
                name: response.data.data[0].name,
                position: response.data.data[0].position,
                gender: response.data.data[0].gender,
                phone: response.data.data[0].phone,
                education: response.data.data[0].education,
                address: response.data.data[0].address,
                categoryId: response.data.data[0].category_id,
                branchId: response.data.data[0].branch_id,
                paymentType: response.data.data[0].payment_type,
                paymentValue: response.data.data[0].payment_value,
                image: response.data.data[0].photo
            });
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching employee information!");
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

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3500/api/categories');
            setCategoryData(response.data.categories);
        } catch (error) {
            setShowToast(true);
            setToastStatus("Error");
            setToastMsg("Error fetching category records!");
        }
    }

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string().trim().required("Full name is required").max(50, "The maximum value allowed is 50"),
        position: Yup.string().trim().required("Position is required").max(30, "The maximum value allowed is 50").oneOf(['SEO', 'Manager', 'Consultant', 'Teacher', 'Chef', 'Guard', 'Cleaner', 'Driver']),
        gender: Yup.string().trim().required("Gender is required").oneOf(['Male', 'Female'], "Invalid gender"),
        phone: Yup.string().trim().required("Phone Number is required").matches(/^[0-9\-+]+$/, "Invalid phone number format").max(10, "The maximum value allowed is 10"),
        education: Yup.string().trim().required("Education is required").max(50, "The maximum value allowed is 50"),
        address: Yup.string().trim().nullable().max(150, "The maximum value allowed is 150"),
        paymentType: Yup.string().trim().required("Payment Type is a required").oneOf(['Fixed', 'Percentage'], "Invalid payment type"),
        paymentValue: Yup.number().required("Payment Value is required").max(9999999999, "The maximum value allowed is 9999999999"),
        categoryId: Yup.string().trim().required("Category is required"),
        branchId: Yup.string().trim().required("Branch is required"),
    });

    // Initialize Formik form with initial values, validation, and submission logic
    const formik = useFormik({
        initialValues: {
            name: "",
            position: "",
            gender: "",
            phone: "",
            education: "",
            address: "",
            paymentType: "",
            paymentValue: "",
            categoryId: "",
            branchId: "",
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
                formData.append('position', values.position);
                formData.append('gender', values.gender);
                formData.append('phone', values.phone);
                formData.append('education', values.education);
                formData.append('address', values.address);
                formData.append('paymentType', values.paymentType);
                formData.append('paymentValue', values.paymentValue);
                formData.append('categoryId', values.categoryId);
                formData.append('branchId', values.branchId);
                formData.append('image', selectedImage);

                // Send FormData object containing form data and image file to the backend
                const response = await axios.patch(`http://localhost:3500/api/employees/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' } // Set content type to multipart/form-data
                });

                if (response.data.statusCode === 200) {
                    setShowToast(true);
                    setToastStatus("Success");
                    setToastMsg(response.data.msg);

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
                    setToastMsg(error);
                }
            }
        },
    });

    const { values, touched, errors, handleChange, handleSubmit } = formik;
    const { name, position, gender, phone, education, address, paymentType, paymentValue, image, categoryId, branchId } = values;

    return (
        <>
            <div className="main">
                <div className="left">
                    <Sidebar />
                </div>

                <div className="right">
                    <Navbar parentPage='Employees' parentRoute='/employees' childPage='Edit' />
                    <div className="content">

                        <PageHeader pageTitle='Edit Employee' actionName='Enroll Student' actionLink='/students/enroll' />

                        <div className="body">
                            <Form onSubmit={handleSubmit} encType='multipart/form-data'>

                                <div className="row">
                                    <div className="col-md-3">
                                        {
                                            (image === null && previewImage === null) ? (
                                                <PersonSquare fill="#7e8299" width={'165px'} height={'165px'} />
                                            ) : (
                                                <Image
                                                    src={previewImage ? previewImage :
                                                        (image !== null ? `http://localhost:3500/${image}` :
                                                            (gender && gender === "Female" ? '../../public/images/avatar/female-avatar.png' : '../../public/images/avatar/male-avatar.png'))
                                                    }
                                                    rounded
                                                    fluid
                                                    thumbnail
                                                    style={{ maxHeight: '220px', maxWidth: '165px' }}
                                                />
                                            )
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
                                        </div>

                                        <div className="row">
                                            <div className="col col-md-4">
                                                <Form.Group className="mb-3" controlId="formBasicPosition">
                                                    <Form.Label>Select Position</Form.Label>
                                                    <Form.Select aria-label="Select Position" name="position" isInvalid={touched.position && !!errors.position} value={position} onChange={handleChange}>
                                                        <option key="position00" value="">Select Position</option>
                                                        <option key="position01" value="SEO">SEO</option>
                                                        <option key="position02" value="Manager">Manager</option>
                                                        <option key="position03" value="Consultant">Consultant</option>
                                                        <option key="position04" value="Teacher">Teacher</option>
                                                        <option key="position05" value="Chef">Chef</option>
                                                        <option key="position06" value="Guard">Guard</option>
                                                        <option key="position07" value="Cleaner">Cleaner</option>
                                                        <option key="position08" value="Driver">Driver</option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                        {errors.position}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>

                                            <div className="col col-md-4">
                                                <Form.Group className="mb-3" controlId="formBasicEducation">
                                                    <Form.Label>Select Education</Form.Label>
                                                    <Form.Select aria-label="Select Education" name="education" isInvalid={touched.education && !!errors.education} value={education} onChange={handleChange}>
                                                        <option key="education00" value="">Select Education</option>
                                                        <option key="education01" value="School Student">School Student</option>
                                                        <option key="education02" value="School Graduate">School Graduate</option>
                                                        <option key="education03" value="14 Graduate">14 Graduate</option>
                                                        <option key="education04" value="Bachelor">Bachelor</option>
                                                        <option key="education05" value="Master">Master</option>
                                                        <option key="education06" value="PHD">PHD</option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                        {errors.education}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>

                                            <div className="col col-md-4">
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
                                        <Form.Group className="mb-3" controlId="formBasicCategoryId">
                                            <Form.Label>Select Category</Form.Label>
                                            <Form.Select aria-label="Select Category" name="categoryId" isInvalid={touched.categoryId && !!errors.categoryId} value={categoryId} onChange={handleChange}>
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

                                    <div className="col col-md-4">
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

                                    <div className="col col-md-4">
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
                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicPaymentType">
                                            <Form.Label>Select Payment Type</Form.Label>
                                            <Form.Select aria-label="Select Payment Type" name="paymentType" isInvalid={touched.paymentType && !!errors.paymentType} value={paymentType} onChange={handleChange}>
                                                <option key="paymentType00" value="">Select Payment Type</option>
                                                <option key="paymentType01" value="Fixed">Fixed</option>
                                                <option key="paymentType02" value="Percentage">Percentage</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                {errors.paymentType}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col col-md-4">
                                        <Form.Group className="mb-3" controlId="formBasicPaymentValue">
                                            <Form.Label>Payment Value</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="paymentValue"
                                                value={paymentValue}
                                                onChange={handleChange}
                                                placeholder="Enter Payment Value"
                                                isInvalid={touched.paymentValue && !!errors.paymentValue}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.paymentValue}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="col-md-4">
                                        <Form.Group controlId="formBasicFileName" className="mb-3">
                                            <Form.Label>Upload New Image</Form.Label>
                                            <Form.Control
                                                type="file"
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

                                <Button className="mt-2" variant="primary" type="submit">
                                    {loading ? <Spinner size="sm" animation="border" /> : <PlusLg />} Update Employee
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

export default EditEmployee;
