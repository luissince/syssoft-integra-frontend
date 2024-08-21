import PropTypes from 'prop-types';
import { isEmpty } from '../helper/utils.helper';
import { NavLink } from 'react-router-dom';

const Button = ({
    refButton,
    autoFocus,
    type = "button",
    contentClassName = "",
    className = "",
    style,
    title,
    text,
    icono,
    disabled = false,
    onClick,
    children
}) => {
    if (!isEmpty(contentClassName)) {
        return (
            <button
                ref={refButton}
                type={type}
                className={contentClassName}
                style={style}
                title={title}
                autoFocus={autoFocus}
                disabled={disabled}
                onClick={onClick}>
                {children}
            </button>
        );
    }

    if (children) {
        return (
            <button
                ref={refButton}
                type={type}
                className={`btn ${className}`}
                style={style}
                title={title}
                autoFocus={autoFocus}
                disabled={disabled}
                onClick={onClick}>
                {children}
            </button>
        );
    }

    return (
        <button
            ref={refButton}
            type={type}
            className={`btn ${className}`}
            style={style}
            title={title}
            autoFocus={autoFocus}
            disabled={disabled}
            onClick={onClick}>
            {text} {icono}
        </button>
    );
};

Button.propTypes = {
    refButton: PropTypes.object,
    autoFocus: PropTypes.bool,
    type: PropTypes.oneOf(["button", "submit", "reset"]),
    contentClassName: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    title: PropTypes.string,
    text: PropTypes.string,
    icono: PropTypes.element,
    disabled: PropTypes.bool,
    refInput: PropTypes.object,
    onClick: PropTypes.func,
    children: PropTypes.node,
};

export const ButtonMenu = ({ icon, path, title, category }) => {
    return (
        <NavLink
            to={path}
            className="d-flex flex-column align-items-center btn btn-link text-dark border-0">
            <i className={`${icon} text-5xl mb-2`} ></i>
            <p className="text-base m-0">{title}</p>
            <p className="text-sm text-primary m-0">{category}</p>
        </NavLink>
    );
}

ButtonMenu.propTypes = {
    icon: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
}

export default Button;