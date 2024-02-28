import PropTypes from 'prop-types';
import Row from "../../../components/Row";

const Search = ({ refTxtSearch, handleSearch }) => {

    return (
        <Row>
            <div className="col-md-12 col-sm-12 col-12">
                <div className="form-group">
                    <div className="input-group">
                        <input
                            className="form-control bg-transparent"
                            type="search"
                            placeholder="filtar por sucursal o nombre del sucursal"
                            aria-label="Search"
                            ref={refTxtSearch}
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