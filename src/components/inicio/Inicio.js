import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Menu from '../layouts/menu/Menu';
import Head from '../layouts/head/Head';
import Footer from '../layouts/footer/Footer';
import Dashboard from '../dashboard/Dashboard';
import Comprobantes from '../ajustes/Comprobantes';
import Clientes from '../facturacion/Clientes';
import Ventas from '../facturacion/Ventas';
import Cobros from '../facturacion/Cobros';
// import Creditos from '../facturacion/Creditos';
// import Cotizaciones from '../facturacion/Cotizaciones';
// import Reservas from '../facturacion/Reservas';
// import Comprobantes from '../ajustes/Comprobantes';
// import Monedas from '../ajustes/Monedas';
import Bancos from '../ajustes/Bancos';



class Inicio extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModal: false
        }
        this.menuRef = React.createRef();
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
        if (this.props.token.userToken == null) {
            return <Redirect to="/login" />
        }

        const { path, url } = this.props.match;
        return (
            <div className='app'>
                <Menu ref={this.menuRef} url={url} />
                <main>
                    <Head setOpen={this.setOpen} setMinimun={this.setMinimun} />

                    <Switch>
                        <Route
                            path="/inicio"
                            exact={true}>
                            <Redirect to={`${path}/dashboard`} />
                        </Route>
                        <Route
                            path={`${path}/dashboard`}
                            render={(props) => <Dashboard {...props} />}
                        />
                        <Route
                            path={`${path}/clientes`}
                            render={(props) => <Clientes {...props} />}
                        />
                        <Route
                            path={`${path}/ventas`}
                            render={(props) => <Ventas {...props} />}
                        />
                        <Route
                            path={`${path}/cobros`}
                            render={(props) => <Cobros {...props} />}
                        />
                        <Route
                            path={`${path}/comprobantes`}
                            render={(props) => <Comprobantes {...props} />}
                        />
                        <Route
                            path={`${path}/bancos`}
                            render={(props) => <Bancos {...props} />}
                        />
                        {/* <Route component={<div>chucha</div>} /> */}
                    </Switch>

                    <Footer />

                </main>
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(Inicio);
