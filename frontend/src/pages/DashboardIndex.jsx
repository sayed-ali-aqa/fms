import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const DashboardIndex = () => {
  return (
    <>
      <div className="main">
        <div className="left">
          <Sidebar />
        </div>

        <div className="right">
          <Navbar />
          <div className="content">
            Content will be placed here
          </div>

          <Footer />
        </div>
      </div>
    </>
  )
}

export default DashboardIndex;
