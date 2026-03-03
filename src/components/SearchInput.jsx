import React from 'react';
import { isEmpty } from '../helper/utils.helper';
import PropTypes from 'prop-types';
import Input from './Input';
import Button from './Button';
import { cn } from '@/lib/utils';

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
      isDropdownActive: false,
    };

    this.refContentResult = React.createRef();

    this.debounceTime = this.props.debounceTime || 250;
    this.debouncedSearch = this.debounce(
      this.props.handleFilter,
      this.debounceTime,
    );
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
  };

  initialize = (data, select = true) => {
    this.setState({ searchTerm: data });
    this.selectItem = select;
  };

  restart = async () => {
    this.setState({
      searchTerm: '',
      highlightedIndex: -1,
    }, () => {
      this.selectItem = false;
      this.props.refValue.current.focus();
    });
  };

  handleWindowClick = (event) => {
    const parent = this.refContentResult.current;
    if (parent == null) return;

    const click = event.target.parentElement.parentElement;
    if (click == null) return;

    if (parent.isEqualNode(click)) return;

    this.props.handleClearInput();
    this.setState({ highlightedIndex: -1 });
  };

  handleKeyDown = (event) => {
    const { data } = this.props;
    const { highlightedIndex } = this.state;

    if (isEmpty(data)) {
      return;
    }

    if (event.key === "Tab") {
      this.props.handleClearInput();
      this.setState({ isDropdownActive: false, highlightedIndex: -1 });
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.setState((prevState) => ({
        isDropdownActive: true,
        highlightedIndex: Math.min(
          prevState.highlightedIndex + 1,
          data.length - 1,
        ),
      }), () => this.scrollToHighlighted(),
      );
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.setState((prevState) => ({
        highlightedIndex: Math.max(prevState.highlightedIndex - 1, -1),
      }),
        () => this.scrollToHighlighted(),
      );
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
  };

  handleBlur = (event) => {
    const dropdown = this.refContentResult.current;

    // nuevo elemento enfocado
    const nextFocus = event.relatedTarget;

    // si el foco se fue hacia dentro del dropdown, no cerrar
    if (dropdown && dropdown.contains(nextFocus)) {
      return;
    }

    // cerrar normalmente
    this.setState({
      isDropdownActive: false,
      highlightedIndex: -1,
    });
  };

  scrollToHighlighted = () => {
    const { highlightedIndex } = this.state;
    const container = this.refContentResult.current;
    if (container && highlightedIndex !== -1) {
      const highlightedElement = container.children[highlightedIndex];
      if (highlightedElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();

        if (elementRect.bottom > containerRect.bottom) {
          container.scrollTop =
            highlightedElement.offsetTop +
            highlightedElement.clientHeight -
            container.clientHeight;
        } else if (elementRect.top < containerRect.top) {
          container.scrollTop = highlightedElement.offsetTop;
        }
      }
    }
  };

  handleInputChange = (event) => {
    const value = this.selectItem ? '' : event.target.value;
    this.setState({ searchTerm: value });
    if (this.props.handleSetValue) {
      this.props.handleSetValue(value);
    }
    this.selectItem = false;
    this.debouncedSearch(value);
  };

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
  };

  render() {
    const { classNameContainer, disabled } = this.props;

    const { autoFocus, label, data, placeholder, refValue } = this.props;

    const { handleSelectItem, handleClearInput } = this.props;

    const { renderItem, renderIconLeft, renderIconRight } = this.props;

    const { customButton } = this.props;

    const { searchTerm, highlightedIndex } = this.state;

    return (
      <div
        className={cn(
          classNameContainer ? classNameContainer : 'mb-3 relative group',
        )}
      >
        <Input
          autoFocus={autoFocus}
          group={true}
          label={label}
          iconLeft={renderIconLeft}
          placeholder={placeholder}
          ref={refValue}
          value={searchTerm}
          onChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleBlur}
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

        {/* {
          isLoading && (
            <div className="dataResult" ref={this.refContentResult}>
              <div className="h-full flex justify-center items-center gap-3">
                <i className="fa fa-spinner fa-spin"></i> Cargando...
              </div>
            </div>
          )
        } */}

        {
          !isEmpty(data) && (
            <ul
              ref={this.refContentResult}
              className={cn(
                "w-full h-[200px]",
                "flex flex-col",
                "pl-0 mb-0 mt-2",
                "bg-white",
                "overflow-hidden overflow-y-auto",
                "absolute z-[100]",
                "rounded border border-primary",
                "shadow-[rgba(0,0,0,0.1)_0px_0px_0px_1px,rgba(0,0,0,0.1)_0px_4px_11px]",

                "group-focus-within:border-[#80bdff]",
                "group-focus-within:shadow-[0_0_0_0.2rem_rgba(0,123,255,0.25)]"
              )}
              onMouseDown={(e) => {
                // ✅ evita que el input pierda foco
                e.preventDefault();

                // ✅ mantiene el cursor al final
                this.handleMouseDown();
              }}
            >
              {
                data.map((value, index) => (
                  <button
                    key={index}
                    tabIndex={-1}
                    className={cn(
                      "relative flex py-3 px-4 w-full text-sm text-left border-b border-gray-200 hover:bg-gray-50",
                      index === highlightedIndex && 'text-white bg-primary',
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault(); // ✅ no roba foco
                      this.handleMouseDown(); // mantiene caret
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectItem(value);
                    }}
                  >
                    {renderItem(value)}
                  </button>
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
  isLoading: PropTypes.bool,
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
};

export default SearchInput;
