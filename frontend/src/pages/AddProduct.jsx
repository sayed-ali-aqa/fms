import axios from 'axios'
import React, { useState } from 'react'
import { Container, Form, Button } from 'react-bootstrap'

const AddProduct = () => {

    const [title, setTitle] = useState('')
    const [price, setPrice] = useState(0)
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')

    const addProductHandler = async (e) => {

        e.preventDefault()

        const formData = new FormData()

        formData.append('image', image)
        formData.append('title', title)
        formData.append('price', price)
        formData.append('description', description)

        const response = await axios.post('http://localhost:3500/api/products/new', formData)

        if (response.data.statusCode === 201) {
            alert("Add successfully!")
        }
        else{
            alert("Error adding new product!")
        }

    }


    return (
        <>
            <Container className='mt-5 p-2'>
                <h1>Add Product</h1>
                <hr />

                <Form onSubmit={addProductHandler} method="POST" encType='multipart/form-data'>
                    <Form.Group className="mb-3" controlId="title">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="price">
                        <Form.Label>Price ($)</Form.Label>
                        <Form.Control
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            type="number"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            as="textarea"
                        />
                    </Form.Group>

                    <Form.Group controlId="fileName" className="mb-3">
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control
                            type="file"
                            name='image'
                            onChange={(e) => setImage(e.target.files[0])}
                            size="lg" />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Add Product
                    </Button>
                </Form>
            </Container>
        </>
    )
}

export default AddProduct;
