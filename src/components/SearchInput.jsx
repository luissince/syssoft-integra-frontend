import React from 'react';
import '../resource/css/searchbar.css';
import { isEmpty } from '../helper/utils.helper';
import PropTypes from 'prop-types';
import Input from './Input';
import Button from './Button';

/**
 * Componente que representa una funcionalidad específica.
 * 
 * @component
 * @param {Object} props - The component accepts text and onClick as props
 * @extends React.Component
 * 
 * @returns {JSX.Element} The rendered search input component.
 */
class SearchInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      highlightedIndex: -1,
    };

    this.refContentResult = React.createRef();

    this.debounceTime = this.props.debounceTime || 250;
    this.debouncedSearch = this.debounce(this.props.handleFilter, this.debounceTime);
    this.selectItem = false;
  }

  componentDidMount() {
    window.addEventListener('click', this.handleWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowClick);
  }

  debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  initialize = (data, select = true) => {
    this.setState({ searchTerm: data });
    this.selectItem = select;
  }

  restart = async () => {
    this.setState({
      searchTerm: '',
      highlightedIndex: -1
    }, () => {
      this.selectItem = false;
      this.props.refValue.current.focus();
    });
  }

  handleWindowClick = (event) => {
    const parent = this.refContentResult.current;
    if (parent == null) return;

    const click = event.target.parentElement.parentElement;
    if (click == null) return;

    if (parent.isEqualNode(click)) return;

    this.props.handleClearInput();
    this.setState({ highlightedIndex: -1 });
  }

  handleKeyDown = (event) => {
    const { data } = this.props;
    const { highlightedIndex } = this.state;

    if (isEmpty(data)) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.setState(prevState => ({
        highlightedIndex: Math.min(prevState.highlightedIndex + 1, data.length - 1),
      }), () => this.scrollToHighlighted());
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.setState(prevState => ({
        highlightedIndex: Math.max(prevState.highlightedIndex - 1, -1)
      }), () => this.scrollToHighlighted());
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex !== -1) {
        this.props.handleSelectItem(data[highlightedIndex]);
        this.setState({ highlightedIndex: -1 });
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.props.handleClearInput();
      this.setState({ highlightedIndex: -1 });
    }
  }

  scrollToHighlighted = () => {
    const { highlightedIndex } = this.state;
    const container = this.refContentResult.current;
    if (container && highlightedIndex !== -1) {
      const highlightedElement = container.children[highlightedIndex];
      if (highlightedElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();

        if (elementRect.bottom > containerRect.bottom) {
          container.scrollTop = highlightedElement.offsetTop + highlightedElement.clientHeight - container.clientHeight;
        } else if (elementRect.top < containerRect.top) {
          container.scrollTop = highlightedElement.offsetTop;
        }
      }
    }
  }

  // handleKeyUp = (event) => {
  //   event.stopPropagation();

  //   const dataResult = this.refContentResult.current;
  //   if (dataResult == null) return;

  //   const data = this.props.data;

  //   if (isEmpty(data)) return;

  //   if (event.key === "ArrowDown" || event.keyCode === 40) {

  //     dataResult.focus();

  //     let children = dataResult.children;

  //     if (children.length > 0) {
  //       this.index = 0;
  //       for (const item of children) {
  //         item.classList.remove('active');
  //       }
  //       children[this.index].classList.add('active');
  //       children[this.index].focus();
  //     }
  //   }

  //   if (event.key === "Enter" || event.keyCode === 13) {

  //     dataResult.focus();

  //     let children = dataResult.children;

  //     if (children.length > 0) {
  //       this.index = 0;
  //       children[this.index].classList.add('active');
  //       children[this.index].focus();
  //     }
  //   }
  // }

  // handleKeyDown = (event) => {
  //   event.stopPropagation();

  //   const dataResult = this.refContentResult.current;
  //   if (dataResult == null) return;

  //   const children = dataResult.children;

  //   if (event.key === "Escape" || event.keyCode === 27) {
  //     event.preventDefault();
  //     this.props.refValue.current.focus();
  //     this.index = -1;
  //   }

  //   if (event.key === "ArrowUp" || event.keyCode === 38) {
  //     event.preventDefault();
  //     if (this.index !== 0) {
  //       if (this.index > 0) {
  //         this.index--;
  //         for (const item of children) {
  //           item.classList.remove('active');
  //         }
  //         children[this.index].classList.add('active');
  //         children[this.index].focus();
  //       }
  //     }
  //   }

  //   if (event.key === "ArrowDown" || event.keyCode === 40) {
  //     event.preventDefault();
  //     if (this.index < children.length - 1) {
  //       this.index++;
  //       for (const item of children) {
  //         item.classList.remove('active');
  //       }
  //       children[this.index].classList.add('active');
  //       children[this.index].focus();
  //     }
  //   }
  // }

  handleInputChange = (event) => {
    const value = this.selectItem ? '' : event.target.value;
    this.setState({ searchTerm: value });
    if (this.props.handleSetValue) {
      this.props.handleSetValue(value);
    }
    this.selectItem = false;
    this.debouncedSearch(value);
  }

  handleFocus = () => {
    if (!this.props.refValue) {
      return;
    }

    const input = this.props.refValue.current;
    if (input) {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  }

  handleMouseDown = () => {
    if (!this.props.refValue) {
      return;
    }

    const input = this.props.refValue.current;
    if (input) {
      const length = input.value.length;
      setTimeout(() => {
        input.setSelectionRange(length, length);
      }, 0);
    }
  }

  render() {
    const { classNameContainer, disabled } = this.props;

    const { autoFocus, label, data, placeholder, refValue } = this.props;

    const { handleSelectItem, handleClearInput } = this.props;

    const { renderItem, renderIconLeft, renderIconRight } = this.props;

    const { customButton } = this.props;

    const { searchTerm, highlightedIndex } = this.state;

    return (
      <div className={`${classNameContainer ? classNameContainer : "form-group position-relative"}`}>
        <Input
          autoFocus={autoFocus}
          group={true}
          label={label}
          iconLeft={renderIconLeft}
          placeholder={placeholder}
          refInput={refValue}
          value={searchTerm}
          onChange={this.handleInputChange}
          // onKeyUp={this.handleKeyUp}
          onKeyDown={this.handleKeyDown}
          // onFocus={this.handleFocus}
          // onMouseDown={this.handleMouseDown}
          disabled={disabled}
          buttonRight={
            <>
              {customButton}

              <Button
                className="btn-outline-secondary"
                onClick={() => {
                  handleClearInput();
                  this.restart();
                }}
                disabled={disabled}
              >
                {renderIconRight || <i className="fa fa-close"></i>}
              </Button>
            </>
          }
        />
        {
          !isEmpty(data) && (
            <ul
              className="dataResult"
              ref={this.refContentResult}
            // tabIndex="-1"
            // onKeyDown={this.handleKeyDown}
            >
              {
                data.map((value, index) => (
                  <Button
                    key={index}
                    contentClassName={`list-group-item list-group-item-action ${index === highlightedIndex ? 'active' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectItem(value);
                    }}
                  >
                    {renderItem(value)}
                  </Button>
                ))
              }
            </ul>
          )
        }
      </div>
    );
  }
}

SearchInput.propTypes = {
  classNameContainer: PropTypes.string,
  disabled: PropTypes.bool,
  debounceTime: PropTypes.number,

  autoFocus: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  data: PropTypes.array.isRequired,
  placeholder: PropTypes.string.isRequired,
  refValue: PropTypes.object.isRequired,

  handleFilter: PropTypes.func.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  handleClearInput: PropTypes.func.isRequired,
  handleSetValue: PropTypes.func,

  renderItem: PropTypes.func,
  renderIconLeft: PropTypes.element,
  renderIconRight: PropTypes.element,

  customButton: PropTypes.element,
}

export default SearchInput;