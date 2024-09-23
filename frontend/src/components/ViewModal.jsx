import { format } from 'date-fns';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const ViewModal = (props) => {
    return (
        <Modal
            {...props}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.header}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='custom-modal-content'>
                    {props.keys.map((field) => (
                        <div key={field.label} className="modal-item">
                            <span>{field.label}: </span>
                            {
                                (field.key === "created_at" || field.key === "updated_at" || field.key === "start_date" || field.key === "end_date") && props.content[field.key]
                                    ? format(new Date(props.content[field.key]), 'yyyy-MM-dd')
                                    : (field.key === "start_time" || field.key === "end_time") && props.content[field.key]
                                        ? format(new Date(`2000-01-01T${props.content[field.key]}`), 'hh:mm a')
                                        : props.content[field.key]
                            }
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ViewModal;
