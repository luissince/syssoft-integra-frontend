import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { images } from '../../../helper';
import PropTypes from 'prop-types';

const Form = (props) => {
  const {
    loading,

    message,
    
    username,
    usernameRef,
    handleChangeUsername,

    password,
    passwordRef,
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

            <div className="mb-4">
              <Input
                refInput={usernameRef}
                value={username}
                onChange={handleChangeUsername}
                placeholder="Ingrese su usuario"
                autoFocus={true}
              />
            </div>

            <div className="mb-4">
              <Input
                group={true}
                refInput={passwordRef}
                value={password}
                onChange={handleChangePassword}
                type={lookPassword ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                buttonRight={
                  <Button
                    className={"btn-outline-secondary"}
                    icono={
                      <i className={lookPassword ? 'fa fa-eye' : 'fa fa-eye-slash'} ></i>
                    }
                    onClick={handleViewPassword}
                  />
                }
              />
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
  loading: PropTypes.bool,
  message: PropTypes.string,
  
  username: PropTypes.string,
  usernameRef: PropTypes.object,

  password: PropTypes.string,
  passwordRef: PropTypes.object,
  
  handleChangeUsuario: PropTypes.func,
  passwordInput: PropTypes.object,
  handleChangePassword: PropTypes.func,
  lookPassword: PropTypes.bool,
  handleViewPassword: PropTypes.func,
  handleSendForm: PropTypes.func,
};


export default Form;
