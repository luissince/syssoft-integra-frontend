import Row from "../../../components/Row";
import { images } from "../../../helper";
import PropTypes from 'prop-types';

const Title = ({ razonSocial, nombreEmpresa, documento, handleSignIn }) => {
  return (
    <Row>
      <div className="col-md-3 col-12">
        <div className="d-flex h-100 justify-content-start align-items-center">
          <div className="form-group">
            <img
                className="img-fluid"
                src={images.icono}
                alt="logo"
                width="140"
            />
          </div>
        </div>
      </div>  
      <div className="col-md-6 col-12">
        <div className="d-flex h-100 flex-column justify-content-center align-items-center">
          <div className="form-group text-center">
            <h4 className="text-dark">{razonSocial}</h4>
            <h5 className="text-dark">{nombreEmpresa}</h5>
            <h5 className="text-secondary">Ruc: {documento}</h5>
          </div>
        </div>
      </div>  
      <div className="col-md-3 col-12">
        <div className="d-flex h-100 justify-content-end align-items-center">
          <div className="form-group">
            <button
                onClick={handleSignIn}
                className="btn btn-danger"
                type="button"
            >
                <i className="fa fa-power-off"></i>
            </button>
          </div>
        </div>
      </div>
    </Row>
  );
}

Title.propTypes = {
    razonSocial: PropTypes.string.isRequired,
    nombreEmpresa: PropTypes.string.isRequired,
    documento: PropTypes.string.isRequired,
    handleSignIn: PropTypes.func.isRequired,
};

export default Title;