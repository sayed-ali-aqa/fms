import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { format } from 'date-fns';
import Image from 'react-bootstrap/Image';

function ViewModalWithImage(props) {
    return (
        <Modal size="xl" {...props} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.header}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="grid-example">
                <Container>
                    <Row>
                        <Col xs={12} md={3} lg={2}>
                            {
                                (props.photo) ? (
                                    <Image
                                        src={`http://localhost:3500/${props.photo}`}
                                        rounded
                                        fluid
                                        thumbnail
                                        style={{ maxHeight: '220px', maxWidth: '165px' }}
                                    />
                                ) : (
                                    <Image
                                        src={
                                            props.content['gender'] && props.content['gender'] === "Female" ? '/public/images/avatar/female-avatar.png' : '/public/images/avatar/male-avatar.png'
                                        }
                                        rounded
                                        fluid
                                        thumbnail
                                        style={{ maxHeight: '220px', maxWidth: '165px' }}
                                    />
                                )
                            }
                        </Col>

                        <Col xs={12} md={9} lg={10}>
                            <div className='custom-modal-content'>
                                {props.keys.map((field, index) => (
                                    <div key={index} className="modal-item">
                                        <span>{field.label}: </span>
                                        {
                                            (field.key === "created_at" || field.key === "updated_at" || field.key === "dob") && props.content[field.key]
                                                ? format(new Date(props.content[field.key]), 'yyyy-MM-dd')
                                                : props.content[field.key]
                                        }
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ViewModalWithImage;