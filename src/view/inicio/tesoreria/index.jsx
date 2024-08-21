import { ContainerMenu } from "../../../components/Container";
import { connect } from "react-redux";
import PropTypes from 'prop-types';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Tesoreria = (props) => {
    return (
        <ContainerMenu
            title={"Seleccione el módulo correspondiente"}
            subMenus={props.token.userToken.menus[4].subMenus}
            url={props.match.url}
        />
    );
}

Tesoreria.propTypes = {
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

const ConnectedTesoreria = connect(mapStateToProps, null)(Tesoreria);

export default ConnectedTesoreria;