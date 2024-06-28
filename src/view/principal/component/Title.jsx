import Button from "../../../components/Button";
import Column from "../../../components/Column";
import Image from "../../../components/Image";
import Row from "../../../components/Row";
import { images } from "../../../helper";
import PropTypes from 'prop-types';

const Title = ({ rutaImage, razonSocial, nombreEmpresa, documento, handleSignOut }) => {
  return (
    <Row>
      <Column className="col-md-3 col-12">
        <div className="d-flex h-100 justify-content-start align-items-center">
          <div className="form-group">
            <Image
              default={images.icono}
              src={`${rutaImage}`}
              className="d-block mx-auto mb-2"
              alt={"Logo"}
              width={140}
            />
          </div>
        </div>
      </Column>

      <Column className="col-md-6 col-12">
        <div className="d-flex h-100 flex-column justify-content-center align-items-center">
          <div className="form-group text-center">
            <h4 className="text-dark">{razonSocial}</h4>
            <h5 className="text-dark">{nombreEmpresa}</h5>
            <h5 className="text-secondary">{documento}</h5>
          </div>
        </div>
      </Column>

      <Column className="col-md-3 col-12">
        <div className="d-flex h-100 justify-content-end align-items-center">
          <div className="form-group">
            <Button 
              className="btn-danger"
              onClick={handleSignOut}
              icono={<i className="fa fa-power-off"></i>}
            />
          </div>
        </div>
      </Column>
    </Row>
  );
}

Title.propTypes = {
  rutaImage: PropTypes.string,
  razonSocial: PropTypes.string.isRequired,
  nombreEmpresa: PropTypes.string.isRequired,
  documento: PropTypes.string.isRequired,
  handleSignOut: PropTypes.func.isRequired,
};

export default Title;