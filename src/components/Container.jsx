import Footer from './footer/Footer';
import PropTypes from 'prop-types';

const ContainerWrapper = ({ children }) => {
  return (
    <main>
      <div className="container-xl mt-3">
        <div className="bg-white p-3  rounded position-relative">
          {children}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export const PosContainerWrapper = ({ children, className = '' }) => {
  return (
    <main className="main-pos">
      <div className="h-100">
        <div className={`d-flex position-relative h-100 ${className}`}>
          {children}
        </div>
      </div>
    </main>
  );
};

ContainerWrapper.propTypes = {
  children: PropTypes.node.isRequired
}

PosContainerWrapper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

export default ContainerWrapper;
