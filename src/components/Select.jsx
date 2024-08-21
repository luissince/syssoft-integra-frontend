import PropTypes from 'prop-types';
import React from 'react';

export class SelectActive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: props.active || false
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.active !== this.props.active) {
            this.setState({
                active: this.props.active || false,
            });
        }
    }

    handleSelectActive = () => {
        this.setState(
            prevState => ({ active: !prevState.active }),
            () => {
                this.props.handleSelect({
                    idAtributo: this.props.id,
                    nombre: this.props.name,
                    hexadecimal: this.props.background
                });
            }
        );
    };

    render() {
        const { active } = this.state;
        const { name, background } = this.props;

        return (
            <span
                className={`border border-secondary ${active ? 'bg-primary text-white' : 'bg-white text-secondary'} position-relative px-4 py-2 btn`}
                onClick={this.handleSelectActive}
            >
                <span
                    className='btn position-absolute p-2'
                    style={{
                        left: "0",
                        bottom: "0",
                        backgroundColor: background
                    }}
                />
                {name}
            </span>
        );
    }
}

SelectActive.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    active: PropTypes.bool,
    background: PropTypes.string,
    handleSelect: PropTypes.func.isRequired
};


const Select = ({
    autoFocus = false,
    label,
    group = false,
    iconLeft,
    title,
    className,
    refSelect,
    value,
    disabled,
    buttonRight,
    onChange,
    children
}) => {
    if (group) {
        return (
            <>
                {label && <label>{label} </label>}

                <div className="input-group">
                    {iconLeft && <div className="input-group-prepend">
                        <div className="input-group-text">
                            {iconLeft}
                        </div>
                    </div>}

                    <select
                        autoFocus={autoFocus}
                        title={title}
                        className={`form-control ${className}`}
                        ref={refSelect}
                        value={value}
                        disabled={disabled}
                        onChange={onChange}>
                        {children}
                    </select>
                    <div className="input-group-append">
                        {buttonRight}
                    </div>
                </div>
            </>
        );
    }
    return (
        <>
            {label && <label>{label} </label>}

            <select
                autoFocus={autoFocus}
                title={title}
                className={`form-control ${className}`}
                ref={refSelect}
                value={value}
                disabled={disabled}
                onChange={onChange}>
                {children}
            </select>
        </>
    );
}

Select.propTypes = {
    autoFocus: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    group: PropTypes.bool,
    iconLeft: PropTypes.element,
    title: PropTypes.string,
    className: PropTypes.string,
    refSelect: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    buttonRight: PropTypes.element,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    children: PropTypes.node,
};

export default Select;