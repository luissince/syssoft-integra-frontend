import React from 'react';
import axios from 'axios';
import './recursos/css/loader.css';
import Configurar from './components/empresa/Configurar';
import Login from './components/login/Login';
import Inicio from './components/inicio/Inicio';
import Principal from './components/principal/Principal';
import NotFound from './components/error/NotFound';
import { connect } from 'react-redux';
import { config, restoreToken } from './redux/actions';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

const Loader = () => {
    return (
        <>
            <div className="loader text-center">
                <div className="loader-inner">

                    <div className="lds-roller mb-3">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    <h4 className="text-uppercase font-weight-bold">Cargando...</h4>
                    <p className="font-italic text-muted">Se está estableciendo conexión con el servidor...</p>
                </div>
            </div>
        </>);
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.menuRef = React.createRef();
    }

    async componentDidMount() {
        try {
            let config = await axios.get("/api/empresa/config");
            
            if(config.data.length === 0) {
                this.props.config();
            }else{
                let userToken = window.localStorage.getItem('login');
                let user = JSON.parse(userToken);
                await axios.get("/api/login/validtoken", {
                    headers: {
                        Authorization: "Bearer " + user.token
                    }
                });
    
                let project = JSON.parse(window.localStorage.getItem('project'));
    
                user = {
                    ...user,
                    project: project
                }
    
                this.props.restore(user);
            }
        } catch (error) {
            window.localStorage.removeItem('login');
            window.localStorage.removeItem('project');
            this.props.restore(null);
        }
    }

    render() {
        console.log(this.props.token.isConfig)
        return (
            <>
                {
                    this.props.token.isLoading ? (
                        <Loader />
                    ) : (
                        <BrowserRouter>
                            <Switch>

                                <Route
                                    path="/"
                                    exact={true}>
                                    <Redirect to={this.props.token.isConfig? "/configurar" : "/login"} />
                                    {/* <Redirect to={ "/login"} /> */}
                                </Route>

                                <Route
                                    path="/login"
                                    exact={true}
                                    render={(props) => <Login {...props} />}
                                />

                                <Route
                                    path="/configurar"
                                    exact={true}
                                    render={(props) => <Configurar {...props} />}
                                />

                                <Route
                                    path="/principal"
                                    exact={true}
                                    render={(props) => <Principal {...props} />}
                                />

                                <Route
                                    path="/inicio"
                                    render={(props) => <Inicio {...props} />}
                                />

                                <Route component={NotFound} />
                            </Switch>

                        </BrowserRouter>
                    )
                }
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
        config: () => dispatch(config()),
        restore: (user) => dispatch(restoreToken(user))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);