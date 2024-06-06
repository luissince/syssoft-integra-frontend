import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { images } from '../../../helper';
import PropTypes from 'prop-types';

const Form = (props) => {
  const {
    message,
    usuario,
    password,
    loading,
    usuarioInput,
    handleChangeUsuario,
    passwordInput,
    handleChangePassword,
    lookPassword,
    handleViewPassword,
    handleSendForm,
  } = props;

  return (
    <div className="col-lg-6 mb-5 mb-lg-0">
      <div className="card">
        <div className="card-body py-5 px-md-5">
          <form onSubmit={handleSendForm}>
            <img
              className="mb-4"
              // src={`${rutaImage !== "" ? "/" + rutaImage : noimage}`}
              src={images.icono}
              alt="Logo"
              width="160"
            />

            {message !== '' && (
              <div
                className="alert alert-warning d-flex align-items-center justify-content-center"
                role="alert"
              >
                <i className="bi bi-exclamation-diamond-fill m-1"></i>
                <div className="m-1">{message}</div>
              </div>
            )}

            {loading && (
              <div className="m-3">
                <div
                  className="spinner-border text-success"
                  role="status"
                ></div>
              </div>
            )}

            <div className="form-outline mb-4">
              <Input
                refInput={usuarioInput}
                onChange={handleChangeUsuario}
                value={usuario}
                placeholder="Ingrese su usuario"
                autoFocus={true}
              />
              {/* <input
                ref={usuarioInput}
                onChange={handleChangeUsuario}
                value={usuario}
                type="text"
                id="inputUsuario"
                placeholder="Ingrese su usuario"
                autoFocus
                className="form-control"
              /> */}
            </div>

            <div className="form-outline mb-4">
              <div className="input-group">
                <Input
                  refInput={passwordInput}
                  onChange={handleChangePassword}
                  value={password}
                  type={lookPassword ? 'text' : 'password'}
                  placeholder="Ingrese su contraseña"
                />
                {/* <input
                  ref={passwordInput}
                  onChange={handleChangePassword}
                  value={password}
                  id="inputPassword"
                  type={lookPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Ingrese su contraseña"
                /> */}
                <div className="input-group-append">
                  <Button
                    className={"btn-outline-secondary"}
                    icono={
                      <i className={lookPassword ? 'fa fa-eye' : 'fa fa-eye-slash'} ></i>
                    }
                    onClick={handleViewPassword}
                  />
                </div>
              </div>
            </div>

            <Button
              type={"submit"}
              className={"btn-primary btn-block mb-3"}
              text={" Iniciar Sesión"}
              icono={
                <i className="fa fa-arrow-right"></i>
              }
            />

            <div className="text-center">
              <p>SysSoft Integra © {new Date().getFullYear()}</p>
              <p className='my-0'>VERSIÓN {import.meta.env.VITE_APP_VERSION}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

Form.propTypes = {
  message: PropTypes.string,
  usuario: PropTypes.string,
  password: PropTypes.string,
  loading: PropTypes.bool,
  usuarioInput: PropTypes.object,
  handleChangeUsuario: PropTypes.func,
  passwordInput: PropTypes.object,
  handleChangePassword: PropTypes.func,
  lookPassword: PropTypes.bool,
  handleViewPassword: PropTypes.func,
  handleSendForm: PropTypes.func,
};


export default Form;
