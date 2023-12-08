import { images } from "../../../helper";

const Form = (props) => {

    const { message, usuario, password, loading, usuarioInput, handleChangeUsuario, passwordInput, handleChangePassword, lookPassword, handleViewPassword, onEventForm } = props;

    return (
        <div className="col-lg-6 mb-5 mb-lg-0">
            <div className="card">
                <div className="card-body py-5 px-md-5">
                    <form onSubmit={onEventForm}>
                        <img
                            className="mb-4"
                            // src={`${rutaImage !== "" ? "/" + rutaImage : noimage}`}
                            src={images.icono}
                            alt="Logo"
                            width="160"
                        />

                        {
                            message !== "" &&
                            <div
                                className="alert alert-warning d-flex align-items-center justify-content-center"
                                role="alert"
                            >
                                <i className="bi bi-exclamation-diamond-fill m-1"></i>
                                <div className="m-1">{message}</div>
                            </div>
                        }

                        {
                            loading &&
                            <div className="m-3">
                                <div
                                    className="spinner-border text-success"
                                    role="status"
                                ></div>
                            </div>
                        }

                        <div className="form-outline mb-4">
                            <input
                                ref={usuarioInput}
                                onChange={handleChangeUsuario}
                                value={usuario}
                                type="text"
                                id="inputUsuario"
                                placeholder="Ingrese su usuario"
                                autoFocus
                                className="form-control"
                            />
                        </div>

                        <div className="form-outline mb-4">
                            <div className="input-group">
                                <input
                                    ref={passwordInput}
                                    onChange={handleChangePassword}
                                    value={password}
                                    id="inputPassword"
                                    type={lookPassword ? "text" : "password"}
                                    className="form-control"
                                    placeholder="Ingrese su contraseña"
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        title="Mostrar"
                                        onClick={handleViewPassword}
                                    >
                                        <i
                                            className={
                                                lookPassword
                                                    ? "fa fa-eye"
                                                    : "fa fa-eye-slash"
                                            }
                                        ></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block mb-4"
                        >
                            Ingresar <i className="fa fa-arrow-right"></i>
                        </button>

                        <div className="text-center">
                            <p>SysSoft Integra © {new Date().getFullYear()}</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Form;