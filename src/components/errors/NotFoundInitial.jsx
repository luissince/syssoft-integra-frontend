import React from 'react';
import { images } from '../../helper';
import Button from '../Button';
import Image from '../Image';

const NotFoundInitial = (props) => {
  return (
    <div className="px-4 py-5 text-center">
      <Image
        default={images.noImage}
        src={images.icono}
        alt={'No encontrado'}
        width={150}
      />
      <h1 className="display-5 fw-bold">Error 404 página no encontrada</h1>
      <div className="col-lg-6 mx-auto">
        <p className="lead mb-4">
          No se encuentra la página que ha solicitado.
        </p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <Button
            onClick={() => props.history.goBack()}
            className="btn-outline-secondary btn-lg px-4"
          >
            <i className="bi bi-arrow-left"></i> Regresar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundInitial;
