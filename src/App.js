import React from 'react';
import './index.css';
import Login from './components/login/Login';
import Menu from './components/layouts/menu/Menu';
import Head from './components/layouts/head/Head';
import Footer from './components/layouts/footer/Footer';
import Principal from './components/principal/Principal';
import Dashboard from './components/dashboard/Dashboard';
import NotFound from './components/error/NotFound';
import Clientes from './components/facturacion/Clientes';
import Cobros from './components/facturacion/Cobros';
import './styles/App.scss';

import {
    BrowserRouter,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModal: false,
            visibility: true
        }
        this.menuRef = React.createRef();
    }

    componentDidMount() {
        console.log('componentDidMount');
    }

    setOpen = () => {
        this.setState({ isModal: !this.state.isModal }, () => {
            this.menuRef.current.handleToggleSidebar(this.state.isModal);
        });
    }

    setMinimun = () => {
        this.setState({ isModal: !this.state.isModal }, () => {
            this.menuRef.current.handleCollapsedSidebar(this.state.isModal);
        });
    }

    render() {
        return (
            <BrowserRouter>
                <div className='app toggled'>
                    <Menu ref={this.menuRef} />
                    <main>
                        <Head setOpen={this.setOpen} setMinimun={this.setMinimun}/>

                        <Switch>
                            <Route
                                path="/"
                                exact={true}>
                                <Redirect to="/login" />
                            </Route>
                            <Route
                                path="/login"
                                exact={true}
                                render={(props) => <Login />}
                            />
                            <Route
                                path="/principal"
                                exact={true}
                                render={(props) => <Principal />}
                            />
                            <Route
                                path="/dashboard"
                                exact={true}
                                render={(props) => <Dashboard />}
                            />
                            <Route
                                path="/clientes"
                                exact={true}
                                render={(props) => <Clientes />}
                            />
                            <Route
                                path="/cobros"
                                exact={true}
                                render={(props) => <Cobros />}
                            />
                            <Route component={NotFound} />
                        </Switch>

                        <Footer />

                    </main>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;