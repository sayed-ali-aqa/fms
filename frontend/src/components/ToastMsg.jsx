import Toast from "react-bootstrap/Toast";
import { CheckSquareFill, XSquareFill } from "react-bootstrap-icons";

const ToastMsg = ({ show, setShow, msg, status }) => {
    return (
        <Toast
            onClose={() => setShow(false)}
            show={show} delay={5000}
            autohide
            style={{ position: 'fixed', bottom: '16px', left: '16px', backgroundColor: '#fff' }}
        >
            <Toast.Header>
                {(status === "Success") ? <CheckSquareFill className="text-success" /> : <XSquareFill className="text-danger" />}

                <strong style={{ marginLeft: '8px' }} className={`me-auto ${status === 'Success' ? 'text-success' : 'text-danger'}`}>{status}</strong>
            </Toast.Header>
            <Toast.Body>{msg}</Toast.Body>
        </Toast>
    );
};

export default ToastMsg;
