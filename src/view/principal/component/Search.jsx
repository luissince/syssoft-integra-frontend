import PropTypes from 'prop-types';
import Row from "../../../components/Row";
import Input from '../../../components/Input';

const Search = ({ refTxtSearch, handleSearch }) => {
  return (
    <Row>
      <div className="col-md-12 col-sm-12 col-12">
        <div className="form-group">
          <div className="input-group">
            <Input
              className="bg-transparent"
              type="search"
              placeholder="Filtar por nombre de sucursal"
              refInput={refTxtSearch}
              onKeyUp={(event) => handleSearch(event.target.value)}
            />
            <div className="input-group-append">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Row>
  );
}

Search.propTypes = {
  refTxtSearch: PropTypes.object.isRequired,
  handleSearch: PropTypes.func.isRequired,
};


export default Search;