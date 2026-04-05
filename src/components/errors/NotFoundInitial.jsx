import React from 'react';
import { images } from '../../helper';
import Button from '../Button';
import Image from '../Image';
import { useHistory } from 'react-router-dom';

const NotFoundInitial = () => {
  const history = useHistory();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <Image
        default={images.noImage}
        src={images.icono}
        alt={'No encontrado'}
        width={150}
      />
      <h4 className="">Error 404 página no encontrada</h4>

      <p>
        No se encuentra la página que ha solicitado.
      </p>

      <Button
        onClick={() => history.goBack()}
        className="btn-outline-secondary btn-lg px-4"
      >
        <i className="bi bi-arrow-left"></i> Regresar
      </Button>
    </div>
  );
};

export default NotFoundInitial;
