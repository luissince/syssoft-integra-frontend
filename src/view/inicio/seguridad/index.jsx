import { ContainerMenu } from "../../../components/Container";
import { connect } from "react-redux";
import PropTypes from 'prop-types';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Seguridad = (props) => {
    return (
        <ContainerMenu
            title={"Seleccione el módulo correspondiente"}
            subMenus={props.token.userToken.menus[1].subMenus}
            url={props.match.url}
        />
    );
}

Seguridad.propTypes = {
    token: PropTypes.shape({
        userToken: PropTypes.shape({
            menus: PropTypes.array.isRequired,
        }).isRequired,
    }).isRequired,
    match: PropTypes.shape({
        url: PropTypes.string
    })
}

const mapStateToProps = (state) => {
    return {
        token: state.principal,
    };
};

const ConnectedSeguridad = connect(mapStateToProps, null)(Seguridad);

export default ConnectedSeguridad;