import React from 'react';
import Footer from './layouts/footer/Footer';

const ContainerWrapper = ({ children }) => {
  return (
    <main>
      <div className="container-fluid mt-3">
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
    <main>
      <div className="h-100">
        <div className="d-flex border border-light-purple rounded position-relative h-100">
          {children}
        </div>
      </div>
    </main>
  );
};

export default ContainerWrapper;