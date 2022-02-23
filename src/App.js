import React from 'react';
import './index.css';
import Login from './components/login/Login';
import Principal from './components/principal/Principal';
import Dashboard from './components/dashboard/Dashboard';
import NotFound from './components/error/NotFound';
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
    }

    componentDidMount() {
        console.log('componentDidMount');
    }

    render() {
        return (
            <BrowserRouter>
                <Switch>
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
                        path="/"
                        exact={true}>
                        <Redirect to="/login" />
                    </Route>
                    <Route component={NotFound} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;