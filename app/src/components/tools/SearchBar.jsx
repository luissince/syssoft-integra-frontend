import React from "react";
import axios from "axios";
import "./SearchBar.css";

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredData: [],
      wordEntered: "",
    };

    this.searchRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("click", this.onEventWindowClick, false);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.onEventWindowClick, false);
  }

  onEventWindowClick(event) {
    let parent = document.getElementById("idDataResult");
    let click = event.target.parentElement.parentElement;

    if (parent == null) return;
    if (click == null) return;

    if (parent.isEqualNode(click)) {
    } else {
      if (parent != null) {
        this.clearInput();
      }
    }
  }

  handleFilter = async (event) => {
    const searchWord = event.target.value;
    this.setState({ wordEntered: searchWord });
    if (searchWord.length == 0) {
      this.setState({ filteredData: [] });
      return;
    }

    try {
      let result = await axios.get("/api/ubigeo/", {
        params: {
          filtrar: searchWord,
        },
      }); 
      this.setState({ filteredData: result.data });
    } catch (error) {
      this.setState({ filteredData: [] });
    }
  };

  clearInput = () => {
    this.setState({ filteredData: [], wordEntered: "" });
    this.searchRef.current.focus();
  };

  clearSelect = () => {
    this.setState({ filteredData: [] });
  };

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
              value={this.state.wordEntered}
              onChange={this.handleFilter}
            />
            <div className="input-group-append">
              <button
                className="btn btn-success"
                type="button"
                onClick={this.clearInput}
              >
                <i className="fa fa-close"></i>
              </button>
            </div>
          </div>

          {this.state.filteredData.length != 0 && (
            <div className="dataResult" id="idDataResult">
              {this.state.filteredData.map((value, key) => (
                <div key={key} className="btn-group-vertical">
                  <button
                    className="btn btn-link text-left text-dark"
                    onClick={() => {
                      this.setState({ wordEntered: value.informacion });
                      this.props.onChangeIdUsuario(value.idUbigeo);
                      this.clearSelect();
                    }}
                  >
                    {value.departamento + "-" + value.provincia + "-" + value.distrito + "(" + value.ubigeo + ")"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default SearchBar;