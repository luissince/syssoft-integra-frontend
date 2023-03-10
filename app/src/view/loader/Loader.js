import React from 'react';
import axios from 'axios';
import '../../recursos/css/loader.css';
import { connect } from 'react-redux';
import { config, restoreToken } from '../../redux/actions';

class Loader extends React.Component {

    async componentDidMount() {      
        let empresa = null;
        try {
            // 
            let config = await axios.get("/api/empresa/config");
            empresa = config.data;
            // 
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

            this.props.restore(user, config.data);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    this.props.config();
                } else {
                    window.localStorage.removeItem('login');
                    window.localStorage.removeItem('project');
                    this.props.restore(null, empresa);
                }
            } else {
                window.localStorage.removeItem('login');
                window.localStorage.removeItem('project');
                this.props.restore(null, empresa);
            }
        }
    }

    render() {
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
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        config: () => dispatch(config()),
        restore: (user, empresa) => dispatch(restoreToken(user, empresa))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Loader);