import Image from '../../../components/Image';
import { images } from '../../../helper';
import PropTypes from 'prop-types';

const Title = ({
  rutaImage,
  razonSocial,
  nombreEmpresa,
  documento
}) => {
  return (
    <div className="flex flex-col justify-center items-center mb-3">
      <div className="mb-4">
        <Image
          default={images.icono}
          src={`${rutaImage}`}
          alt={'Logo'}
          width={140}
        />
      </div>

      <div className="form-group text-center">
        <h4 className="text-dark">{razonSocial}</h4>
        <h5 className="text-dark">{nombreEmpresa}</h5>
        <h5 className="text-secondary">{documento}</h5>
      </div>
    </div>
  );
};

Title.propTypes = {
  rutaImage: PropTypes.string,
  razonSocial: PropTypes.string.isRequired,
  nombreEmpresa: PropTypes.string.isRequired,
  documento: PropTypes.string.isRequired,
};

export default Title;
