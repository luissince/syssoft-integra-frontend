import React from "react";
import "./SearchBar.css";

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: false,
      filteredData: [],
      wordEntered: "",
    };

    this.selectItem = false;

    this.searchRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("click", this.onEventWindowClick, false);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.onEventWindowClick, false);
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
              ref={this.searchRef}
              value={this.props.ubigeo}
              onChange={this.props.handleFilter}
            />
            <div className="input-group-append">
              <button
                className="input-group-text"
                type="button"
                onClick={() => {
                  this.props.onEventClearInput();
                  this.searchRef.current.focus();
                }}
              >
                <i className="fa fa-close"></i>
              </button>
            </div>
          </div>

          {this.props.filteredData.length != 0 && (
            <div className="dataResult" id="idDataResult">
              {this.props.filteredData.map((value, index) => (
                <button
                  key={index}
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    this.props.onEventSelectItem(value);
                    this.searchRef.current.focus();
                  }}
                >
                  {value.departamento + "-" + value.provincia + "-" + value.distrito + " (" + value.ubigeo + ")"}
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