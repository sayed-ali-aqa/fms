import { CCircle } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer">
      <div className="copyright">
        <span>2022 <CCircle size={14} /></span>
        <Link to="#">Sayed Ali Aqa Mousavi</Link>
      </div>
    </div>
  )
}

export default Footer;
