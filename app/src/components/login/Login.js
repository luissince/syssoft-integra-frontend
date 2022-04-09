import React from 'react';
import axios from 'axios';
import { getCookie } from '../tools/Tools';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { signIn } from '../../redux/actions';
import './Login.css';

class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            message: '',
        }

        this.emailInput = React.createRef();
        this.passwordInput = React.createRef();

    }


    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    componentDidMount() {

    }

    onEventForm = async () => {
        if (this.state.email === "") {
            this.emailInput.current.focus();
            this.setStateAsync({ message: "Ingrese su usuario para iniciar sesión." });
            return;
        }

        if (this.state.password === "") {
            this.passwordInput.current.focus();
            this.setStateAsync({ message: "Ingrese su contraseña para iniciar sesión." });
            return;
        }

        try {
            let user = await axios.get('/api/login', {
                params: {
                    "id": Math.floor(Math.random() * 562000),
                    "email": this.state.email,
                    "password": this.state.password
                }
            });


            localStorage.setItem('login', JSON.stringify(user.data));
            this.props.restore(JSON.parse(localStorage.getItem('login')));
            this.props.history.push("principal");
            // document.cookie = `token=${user.data.token}; max-age=${10}; path=/; samesite=strict`;

        } catch (error) {
            console.log(error)
        }
    }

    onEventRecuperar = () => {
        console.log(getCookie("token"))
        window.open("/api/login/report", "_blank");
    }

    handleChangeEmail = (event) => {
        if (event.target.value.length > 0) {
            this.setState({
                email: event.target.value,
                message: ""
            });
        } else {
            this.setState({
                email: event.target.value,
                message: "Ingrese su usuario para iniciar sesión."
            });
        }
    }

    handleChangePassword = (event) => {
        if (event.target.value.length > 0) {
            this.setState({
                password: event.target.value,
                message: ""
            });
        } else {
            this.setState({
                password: event.target.value,
                message: "Ingrese su contraseña para iniciar sesión."
            });
        }
    }

    render() {
        const { email, password, message } = this.state;
        if (this.props.token.userToken != null) {
            return <Redirect to="/principal" />
        }
        return (
            <>
                <style>{'html,body,#root{height:100%;}'}</style>
                <div className="form-content text-center bg-white">
                    <form className="form-signin">
                        <img className="mb-4" src="https://getbootstrap.com/docs/4.6/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72" />
                        <h1 className="h3 mb-3 font-weight-normal">Ingrese los datos</h1>
                        {
                            message !== "" ?
                                <div className="alert alert-warning d-flex align-items-center" role="alert">
                                    <i className="bi bi-exclamation-diamond-fill m-1"></i>
                                    <div className=" m-1">
                                        {message}
                                    </div>
                                </div> : null
                        }

                        <label htmlFor="inputEmail" className="sr-only">usuario o correo</label>
                        <input
                            ref={this.emailInput}
                            onChange={this.handleChangeEmail}
                            value={email}
                            type="email"
                            id="inputEmail"
                            className="form-control"
                            placeholder="Correo o usuario"
                            required=""
                            autoFocus="" />

                        <label htmlFor="inputPassword" className="sr-only">Password</label>
                        <input
                            ref={this.passwordInput}
                            onChange={this.handleChangePassword}
                            value={password}
                            type="password"
                            id="inputPassword"
                            className="form-control"
                            placeholder="Contraseña"
                            required="" />

                        <div className="checkbox mb-3">
                            <label>
                                <input type="checkbox" value="remember-me" /> Recuerdame
                            </label>
                        </div>
                        <button onClick={this.onEventForm} type="button" className="btn btn-lg btn-primary btn-block">Ingresar</button>
                        <button onClick={this.onEventRecuperar} type="button" className="btn btn-lg btn-outline-primary btn-block">Recuperar</button>
                        <p className="mt-5 mb-3 text-muted">© 2022</p>
                    </form>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        restore: (user) => dispatch(signIn(user))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);