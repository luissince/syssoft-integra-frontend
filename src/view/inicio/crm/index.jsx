import { ContainerMenu } from '../../../components/Container';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Consultas from './consulta/lista/Consultas';
import Web from './web/index';

export { Consultas, Web };

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Crm = (props) => {
  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={props.token.userToken.menus[10].subMenus}
      url={props.match.url}
    />
  );
};

Crm.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      menus: PropTypes.array.isRequired,
    }).isRequired,
  }).isRequired,
  match: PropTypes.shape({
    url: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCrm = connect(mapStateToProps, null)(Crm);

export default ConnectedCrm;
