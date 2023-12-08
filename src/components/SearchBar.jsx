import React from "react";
import "../recursos/css/searchbar.css";

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.index = -1;
  }

  componentDidMount() {
    window.addEventListener("click", this.onEventWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.onEventWindowClick);
  }

  onEventWindowClick = (event) => {
    let parent = document.getElementById("idDataResult");
    let click = event.target.parentElement.parentElement;

    if (parent == null) return;
    if (click == null) return;

    if (parent.isEqualNode(click)) {
    } else {
      if (parent != null) {
        this.props.onEventClearInput();
        this.index = -1;
      }
    }
  };

  onEventKeyUp(event) {
    if (event.keyCode === 40 || event.which === 40) {
      if (this.props.filteredData.length === 0) return;

      const dataResult = document.getElementById("idDataResult");
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
      if (this.props.filteredData.length === 0) return;

      const dataResult = document.getElementById("idDataResult");
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
    }
  }

  onEventKeyDown(event) {
    if (event.keyCode === 38) {
      let children = document.getElementById("idDataResult").children;

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
      let children = document.getElementById("idDataResult").children;

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
    return (
      <div className="search">
        <div className="form-group position-relative mb-0">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder={this.props.placeholder}
              ref={this.props.refTxtUbigeo}
              value={this.props.ubigeo}
              onChange={this.props.handleFilter}
              onKeyUp={(event) => this.onEventKeyUp(event)}
            />
            <div className="input-group-append">
              <button
                className="input-group-text"
                type="button"
                onClick={() => {
                  this.props.onEventClearInput();
                  this.props.refTxtUbigeo.current.focus();
                  this.index = -1;
                }}
              >
                <i className="fa fa-close"></i>
              </button>
            </div>
          </div>

          {this.props.filteredData.length !== 0 && (
            <div
              className="dataResult"
              id="idDataResult"
              tabIndex="-1"
              onKeyDown={(event) => this.onEventKeyDown(event)}
            >
              {this.props.filteredData.map((value, index) => (
                <button
                  key={index}
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    this.props.onEventSelectItem(value);
                    this.props.refTxtUbigeo.current.focus();
                    this.index = -1;
                  }}
                >
                  {value.departamento +
                    "-" +
                    value.provincia +
                    "-" +
                    value.distrito +
                    " (" +
                    value.ubigeo +
                    ")"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default SearchBar;
