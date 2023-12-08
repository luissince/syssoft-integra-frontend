import React from "react";
import "../recursos/css/searchbar.css";

class SearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.index = -1;
    this.dataResultRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("click", this.handleWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.handleWindowClick);
  }

  handleWindowClick = (event) => {
    const parent = this.dataResultRef.current;
    if (parent == null) return;

    const click = event.target.parentElement.parentElement;
    if (click == null) return;

    if (parent.isEqualNode(click)) return;

    this.props.handleClearInput();
    this.index = -1;
  }

  handleKeyUp(event) {
    event.stopPropagation();

    const dataResult = this.dataResultRef.current;
    if (dataResult == null) return;

    const data = this.props.data;

    if (event.keyCode === 40 || event.which === 40) {
      if (data.length === 0) return;

      dataResult.focus();

      let children = dataResult.children;

      if (children.length > 0) {
        this.index = 0;
        for (const item of children) {
          item.classList.remove("active")
        }
        children[this.index].classList.add("active")
        children[this.index].focus();
      }
    } else if (event.keyCode === 13) {

      if (data.length === 0) return;

      dataResult.focus();

      let children = dataResult.children;

      if (children.length > 0) {
        this.index = 0;
        children[this.index].classList.add("active")
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
      if (this.index !== 0) {
        if (this.index > 0) {
          this.index--;
          for (const item of children) {
            item.classList.remove("active")
          }
          children[this.index].classList.add("active")
          children[this.index].focus();
        }
      }
    } else if (event.keyCode === 40) {
      if (this.index < children.length - 1) {
        this.index++;
        for (const item of children) {
          item.classList.remove("active")
        }
        children[this.index].classList.add("active")
        children[this.index].focus();
      }
    }
  }

  render() {

    const { showLeftIcon } = this.props

    const { autoFocus, value, data, placeholder, refValue } = this.props;

    const { handleFilter, handleSelectItem, handleClearInput } = this.props;

    const { renderItem, renderIconLeft, renderIconRight } = this.props;

    return (
      <div className="form-group position-relative">
        <div className="input-group">

          {
            showLeftIcon && <div className="input-group-prepend">
              <div className="input-group-text">
                {renderIconLeft ? renderIconLeft() : <i className="bi bi-cart4"></i>}
              </div>
            </div>
          }

          <input
            autoFocus={autoFocus}
            type="text"
            className="form-control"
            placeholder={placeholder}
            ref={refValue}
            value={value}
            onChange={handleFilter}
            onKeyUp={(event) => this.handleKeyUp(event)}
          />

          <div className="input-group-append">
            <button
              className="input-group-text"
              type="button"
              onClick={() => {
                handleClearInput();
                refValue.current.focus();
                this.index = -1;
              }}
            >
              {renderIconRight ? renderIconRight() : <i className="fa fa-close"></i>}
            </button>
          </div>

        </div>

        {
          data.length !== 0 && (
            <div
              className="dataResult"
              ref={this.dataResultRef}
              tabIndex="-1"
              onKeyDown={(event) => this.handleKeyDown(event)}
            >
              {data.map((value, index) => (
                <button
                  key={index}
                  className="list-group-item list-group-item-action border-0"
                  onClick={(event) => {
                    handleSelectItem(value);
                    refValue.current.focus();
                    this.index = -1;
                  }}
                >
                  {renderItem(value)}
                </button>
              ))}
            </div>
          )
        }
      </div>
    );
  }
}

export default SearchInput;
