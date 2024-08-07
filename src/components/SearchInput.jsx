import React from 'react';
import '../recursos/css/searchbar.css';
import { isEmpty } from '../helper/utils.helper';
import PropTypes from 'prop-types';
import Input from './Input';
import Button from './Button';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class SearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.index = -1;
    this.dataResultRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('click', this.handleWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowClick);
  }

  handleWindowClick = (event) => {
    const parent = this.dataResultRef.current;
    if (parent == null) return;

    const click = event.target.parentElement.parentElement;
    if (click == null) return;

    if (parent.isEqualNode(click)) return;

    this.props.handleClearInput();
    this.index = -1;
  };

  handleKeyUp(event) {
    event.stopPropagation();

    const dataResult = this.dataResultRef.current;
    if (dataResult == null) return;

    const data = this.props.data;

    if (isEmpty(data)) return;

    if (event.keyCode === 40 || event.which === 40) {

      dataResult.focus();

      let children = dataResult.children;

      if (children.length > 0) {
        this.index = 0;
        for (const item of children) {
          item.classList.remove('active');
        }
        children[this.index].classList.add('active');
        children[this.index].focus();
      }
    } else if (event.key === 'Enter') {

      dataResult.focus();

      let children = dataResult.children;

      if (children.length > 0) {
        this.index = 0;
        children[this.index].classList.add('active');
        children[this.index].focus();
      }
    }
  }

  handleKeyDown(event) {
    event.stopPropagation();

    const dataResult = this.dataResultRef.current;
    if (dataResult == null) return;

    const children = dataResult.children;

    if (event.keyCode === 38) {
      event.preventDefault();
      if (this.index !== 0) {
        if (this.index > 0) {
          this.index--;
          for (const item of children) {
            item.classList.remove('active');
          }
          children[this.index].classList.add('active');
          children[this.index].focus();
        }
      }
    } else if (event.keyCode === 40) {
      event.preventDefault();
      if (this.index < children.length - 1) {
        this.index++;
        for (const item of children) {
          item.classList.remove('active');
        }
        children[this.index].classList.add('active');
        children[this.index].focus();
      }
    }
  }

  render() {

    const { classNameContainer, disabled } = this.props;

    const { autoFocus, value, data, placeholder, refValue } = this.props;

    const { handleFilter, handleSelectItem, handleClearInput } = this.props;

    const { renderItem, renderIconLeft, renderIconRight } = this.props;

    const { customButton } = this.props;

    return (
      <div className={`${classNameContainer ? classNameContainer : "form-group position-relative"}`}>
        <div className="input-group">
          {renderIconLeft && (
            <div className="input-group-prepend">
              <div className="input-group-text">
                {renderIconLeft}
              </div>
            </div>
          )}

          <Input
            autoFocus={autoFocus}
            type="text"
            className="form-control"
            placeholder={placeholder}
            refInput={refValue}
            value={value}
            onChange={handleFilter}
            onKeyUp={(event) => this.handleKeyUp(event)}
            disabled={disabled}
          />

          <div className="input-group-append">
            {customButton}

            <Button
              className="btn-outline-secondary"
              onClick={() => {
                handleClearInput();
                refValue.current.focus();
                this.index = -1;
              }}
              disabled={disabled}
            >
              {renderIconRight || <i className="fa fa-close"></i>}
            </Button>
          </div>
        </div>

        {
          !isEmpty(data) && (
            <div
              className="dataResult"
              ref={this.dataResultRef}
              tabIndex="-1"
              onKeyDown={(event) => this.handleKeyDown(event)}
            >
              {
                data.map((value, index) => (
                  <Button
                    key={index}
                    contentClassName="list-group-item list-group-item-action"
                    onClick={(event) => {
                      handleSelectItem(value);
                      refValue.current.focus();
                      this.index = -1;
                      event.stopPropagation();
                    }}
                  >
                    {renderItem(value)}
                  </Button>
                ))
              }
            </div>
          )
        }
      </div>
    );
  }
}

SearchInput.propTypes = {
  classNameContainer: PropTypes.string,
  disabled: PropTypes.bool,

  autoFocus: PropTypes.bool,
  value: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  placeholder: PropTypes.string.isRequired,
  refValue: PropTypes.object.isRequired,

  handleFilter: PropTypes.func.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  handleClearInput: PropTypes.func.isRequired,

  renderItem: PropTypes.func,
  renderIconLeft: PropTypes.element,
  renderIconRight: PropTypes.element,

  customButton: PropTypes.element,
}


export default SearchInput;
