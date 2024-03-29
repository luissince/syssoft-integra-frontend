import Footer from './footer/Footer';
import PropTypes from 'prop-types';

const ContainerWrapper = ({ children }) => {
  return (
    <main>
      <div className="container-xl mt-3">
        <div className="bg-white p-3 border border-light-purple rounded position-relative">
          {children}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export const PosContainerWrapper = ({ children }) => {
  return (
    <main className="main-pos">
      <div className="h-100">
        <div className="d-flex border border-light-purple rounded position-relative h-100">
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
  children: PropTypes.node.isRequired
}

export default ContainerWrapper;
