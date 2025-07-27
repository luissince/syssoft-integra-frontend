import PropTypes from 'prop-types';

export const Card = ({ className = '', children }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const CardHeader = ({ className = '', children }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const CardBody = ({ className = '', children }) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

CardBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const CardTitle = ({ className, children }) => {
  return <h5 className={`card-title m-0 ${className}`}>{children}</h5>;
};

CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const CardDescription = ({ className, children }) => {
  return (
    <h4 className={`text-secondary text-base ${className}`}>{children}</h4>
  );
};

CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const CardText = ({ className, children }) => {
  return <h3 className={`card-text ${className}`}>{children}</h3>;
};

CardText.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
