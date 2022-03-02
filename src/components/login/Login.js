import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { signIn } from '../../redux/actions';
import './Login.css';

class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: ''
        }

        console.log("login constructor")

    }

    componentDidMount() {
        console.log("login componentDidMount")
    }

    onEventForm = async () => {
        if (this.state.email === "") {
            this.emailInput.focus();
            return;
        }

        if (this.state.password === "") {
            this.passwordInput.focus();
            return;
        }

        try {
            let user = JSON.stringify({
                "id": Math.floor(Math.random() * 562000),
                "email": this.state.email,
                "password": this.state.password
            });
            await localStorage.setItem('login', user);
            this.props.restore(user);
            this.props.history.push("principal");
        } catch (error) {
            console.log(error)
        }
    }

    handleChangeEmail = (event) => {
        this.setState({ email: event.target.value });
    }

    handleChangePassword = (event) => {
        this.setState({ password: event.target.value });
    }

    render() {
        console.log("render login")
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

                        <label htmlFor="inputEmail" className="sr-only">usuario o correo</label>
                        <input
                            ref={(input) => { this.emailInput = input; }}
                            onChange={this.handleChangeEmail}
                            value={this.state.email}
                            type="email"
                            id="inputEmail"
                            className="form-control"
                            placeholder="Correo o usuario"
                            required=""
                            autoFocus="" />

                        <label htmlFor="inputPassword" className="sr-only">Password</label>
                        <input
                            ref={(input) => { this.passwordInput = input; }}
                            onChange={this.handleChangePassword}
                            value={this.state.password}
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
                        <button onClick={this.onEventForm} type="button" className="btn btn-lg btn-outline-primary btn-block">Recuperar</button>
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