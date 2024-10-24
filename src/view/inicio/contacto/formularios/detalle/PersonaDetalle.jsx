import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import Title from '../../../../../components/Title';

class ClienteDetalle extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {

  }

  componentWillUnmount() {
  }



  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Persona'
          subTitle='DETALLE'
          handleGoBack={() => this.props.history.goBack()}
        />

      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedClienteDetalle = connect(mapStateToProps, null)(ClienteDetalle)

export default ConnectedClienteDetalle;
