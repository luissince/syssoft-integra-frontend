import PropTypes from 'prop-types';

const Title = ({ title, subTitle, icon, handleGoBack }) => {

    return (
        <div className="row">
            <div className="col">
                <div className="form-group">
                    <h5>

                        {handleGoBack !== undefined &&
                            <span role="button" onClick={handleGoBack}>
                                <i className="bi bi-arrow-left-short"></i>
                            </span>}
                        {title}
                        <small className="text-secondary"> {subTitle} {icon && icon()}</small>
                    </h5>
                </div>
            </div>
        </div>
    );
}

Title.propTypes = {
    title: PropTypes.string.isRequired,
    subTitle: PropTypes.string.isRequired,
    icon: PropTypes.func,
    handleGoBack: PropTypes.func
}

export default Title;