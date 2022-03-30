import React from "react";

class Paginacion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      upperPageBound: 3,
      lowerPageBound: 0,
      isPrevBtnActive: "disabled",
      isNextBtnActive: "",
      pageBound: 3,
    };
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  handleClick = async (event) => {
    let listid = parseInt(event.target.id);
    this.setPrevAndNextBtnClass(listid);
  };

  setPrevAndNextBtnClass = async (listid) => {
    await this.setStateAsync({
      isNextBtnActive: "disabled",
      isPrevBtnActive: "disabled",
    });
    if (
      this.props.totalPaginacion === listid &&
      this.props.totalPaginacion > 1
    ) {
      await this.setStateAsync({ isPrevBtnActive: "" });
    } else if (listid === 1 && this.props.totalPaginacion > 1) {
      await this.setStateAsync({ isNextBtnActive: "" });
    } else if (this.props.totalPaginacion > 1) {
      await this.setStateAsync({ isNextBtnActive: "", isPrevBtnActive: "" });
    }

    this.props.fillTable(listid);
  };

  btnPrevClick = async () => {
    if ((this.props.paginacion - 1) % this.state.pageBound === 0) {
      await this.setStateAsync({
        upperPageBound: this.state.upperPageBound - this.state.pageBound,
        lowerPageBound: this.state.lowerPageBound - this.state.pageBound,
      });
    }
    let listid = this.props.paginacion - 1;
    this.setPrevAndNextBtnClass(listid);
  };

  btnNextClick = async () => {
    if (this.props.paginacion + 1 > this.state.upperPageBound) {
      await this.setStateAsync({
        upperPageBound: this.state.upperPageBound + this.state.pageBound,
        lowerPageBound: this.state.lowerPageBound + this.state.pageBound,
      });
    }
    let listid = this.props.paginacion + 1;
    this.setPrevAndNextBtnClass(listid);
  };

  btnDecrementClick = async () => {
    await this.setStateAsync({
      upperPageBound: this.state.upperPageBound - this.state.pageBound,
      lowerPageBound: this.state.lowerPageBound - this.state.pageBound,
    });

    let listid = this.state.upperPageBound;
    this.setPrevAndNextBtnClass(listid);
  };

  btnIncrementClick = async () => {
    await this.setStateAsync({
      upperPageBound: this.state.upperPageBound + this.state.pageBound,
      lowerPageBound: this.state.lowerPageBound + this.state.pageBound,
    });

    let listid = this.state.lowerPageBound + 1;
    this.setPrevAndNextBtnClass(listid);
  };

  render() {
    const pageNumbers = [];
    for (let i = 1; i <= this.props.totalPaginacion; i++) {
      pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map((number, index) => {
      if (number === 1 && this.props.paginacion === 1) {
        return (
          <li key={index} className="page-item active" aria-current="page">
            <span className="page-link">{number}</span>
          </li>
        );
      } else if (
        number < this.state.upperPageBound + 1 &&
        number > this.state.lowerPageBound
      ) {
        return (
          <li
            key={index}
            className={`page-item ${
              number === this.props.paginacion ? "active" : ""
            }`}
          >
            {number === this.props.paginacion ? (
              <span id={number} className="page-link">
                {number}
              </span>
            ) : (
              <button
                id={number}
                className="page-link"
                onClick={this.handleClick}
              >
                {number}
              </button>
            )}
          </li>
        );
      }
    });

    let pageDecrementBtn = null;
    if (this.state.lowerPageBound >= 1) {
      pageDecrementBtn = (
        <li className="page-item">
          <button className="page-link" onClick={this.btnDecrementClick}>
            {" "}
            &hellip;{" "}
          </button>
        </li>
      );
    }

    let pageIncrementBtn = null;
    if (pageNumbers.length > this.state.upperPageBound) {
      pageIncrementBtn = (
        <li className="page-item">
          <button className="page-link" onClick={this.btnIncrementClick}>
            {" "}
            &hellip;{" "}
          </button>
        </li>
      );
    }

    let renderPrevBtn = null;
    if (this.state.isPrevBtnActive === "disabled") {
      renderPrevBtn = (
        <li className="page-item disabled">
          <span className="page-link"> Ante. </span>
        </li>
      );
    } else {
      renderPrevBtn = (
        <li className="page-item">
          <button className="page-link" onClick={this.btnPrevClick}>
            {" "}
            Ante.{" "}
          </button>
        </li>
      );
    }

    let renderNextBtn = null;
    if (
      this.state.isNextBtnActive === "disabled" ||
      this.props.totalPaginacion <= 1
    ) {
      renderNextBtn = (
        <li className="page-item disabled">
          <span className="page-link"> Sigui. </span>
        </li>
      );
    } else {
      renderNextBtn = (
        <li className="page-item">
          <button className="page-link" onClick={this.btnNextClick}>
            {" "}
            Sigui.{" "}
          </button>
        </li>
      );
    }

    return (
      <>
        {renderPrevBtn}
        {pageDecrementBtn}
        {renderPageNumbers}
        {pageIncrementBtn}
        {renderNextBtn}
      </>
    );
  }
}

export default Paginacion;
