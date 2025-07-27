import React from 'react';
import PropTypes from 'prop-types';

class Paginacion extends React.Component {
  constructor(props) {
    super(props);
    this.upperPageBound = 3;
    this.lowerPageBound = 0;
    this.isPrevBtnActive = 'disabled';
    this.isNextBtnActive = '';
    this.pageBound = 3;
    this.messagePaginacion = 'Mostrando 0 de 0 Páginas';
  }

  setPrevAndNextBtnClass = async (listid) => {
    const { totalPaginacion } = this.props;

    this.isNextBtnActive = 'disabled';
    this.isPrevBtnActive = 'disabled';

    if (totalPaginacion === listid && totalPaginacion > 1) {
      this.isPrevBtnActive = '';
    } else if (listid === 1 && totalPaginacion > 1) {
      this.isNextBtnActive = '';
    } else if (totalPaginacion > 1) {
      this.isNextBtnActive = '';
      this.isPrevBtnActive = '';
    }

    this.props.fillTable(listid);
  };

  handleClick = async (event) => {
    if (this.props.loading) return;
    const listid = parseInt(event.target.id);
    this.setPrevAndNextBtnClass(listid);
  };

  btnPrevClick = async () => {
    if (this.props.loading) return;
    if ((this.props.paginacion - 1) % this.pageBound === 0) {
      this.upperPageBound -= this.pageBound;
      this.lowerPageBound -= this.pageBound;
    }
    this.setPrevAndNextBtnClass(this.props.paginacion - 1);
  };

  btnNextClick = async () => {
    if (this.props.loading) return;
    if (this.props.paginacion + 1 > this.upperPageBound) {
      this.upperPageBound += this.pageBound;
      this.lowerPageBound += this.pageBound;
    }
    this.setPrevAndNextBtnClass(this.props.paginacion + 1);
  };

  btnDecrementClick = async () => {
    if (this.props.loading) return;
    this.upperPageBound -= this.pageBound;
    this.lowerPageBound -= this.pageBound;
    this.setPrevAndNextBtnClass(this.upperPageBound);
  };

  btnIncrementClick = async () => {
    if (this.props.loading) return;
    this.upperPageBound += this.pageBound;
    this.lowerPageBound += this.pageBound;
    this.setPrevAndNextBtnClass(this.lowerPageBound + 1);
  };

  renderClassicPagination() {
    const { paginacion, totalPaginacion } = this.props;
    const pageNumbers = Array.from(
      { length: totalPaginacion },
      (_, i) => i + 1,
    );
    const renderPageNumbers = pageNumbers.map((number, index) => {
      if (number < this.upperPageBound + 1 && number > this.lowerPageBound) {
        return (
          <li
            key={index}
            className={`page-item ${number === paginacion ? 'active' : ''}`}
          >
            <button
              id={number}
              onClick={this.handleClick}
              className="page-link"
              disabled={number === paginacion}
            >
              {number}
            </button>
          </li>
        );
      }
      return null;
    });

    const renderDots = (onClick) => (
      <li className="page-item">
        <button className="page-link" onClick={onClick}>
          &hellip;
        </button>
      </li>
    );

    const renderButton = (label, onClick, disabled) => (
      <li className={`page-item ${disabled ? 'disabled' : ''}`}>
        <button className="page-link" onClick={onClick} disabled={disabled}>
          {label}
        </button>
      </li>
    );

    return (
      <div className="row">
        <div className="col-sm-12 col-md-5 d-flex align-items-center">
          <span className="text-sm">{this.messagePaginacion}</span>
        </div>
        <div className="col-sm-12 col-md-7 d-flex justify-content-end">
          <ul className="pagination m-0">
            {renderButton(
              'Ante.',
              this.btnPrevClick,
              this.isPrevBtnActive === 'disabled',
            )}
            {this.lowerPageBound >= 1 && renderDots(this.btnDecrementClick)}
            {renderPageNumbers}
            {totalPaginacion > this.upperPageBound &&
              renderDots(this.btnIncrementClick)}
            {renderButton(
              'Sigui.',
              this.btnNextClick,
              this.isNextBtnActive === 'disabled',
            )}
          </ul>
        </div>
      </div>
    );
  }

  renderModernPagination() {
    const { paginacion, totalPaginacion } = this.props;
    const pageNumbers = Array.from(
      { length: totalPaginacion },
      (_, i) => i + 1,
    );
    const renderPageNumbers = pageNumbers.map((number, index) => {
      if (number < this.upperPageBound + 1 && number > this.lowerPageBound) {
        return (
          <button
            key={index}
            id={number}
            onClick={number === paginacion ? undefined : this.handleClick}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              number === paginacion
                ? 'z-10 bg-blue-600 border-blue-600 text-white'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {number}
          </button>
        );
      }
      return null;
    });

    const DotButton = ({ onClick }) => (
      <button
        onClick={onClick}
        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        &hellip;
      </button>
    );

    const ArrowButton = ({ direction, onClick, disabled }) => {
      const d = direction === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';
      return (
        <button
          onClick={onClick}
          disabled={disabled}
          className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            disabled
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={d}
            />
          </svg>
        </button>
      );
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-700">{this.messagePaginacion}</div>
          <div className="flex items-center space-x-2">
            <ArrowButton
              direction="prev"
              onClick={this.btnPrevClick}
              disabled={this.isPrevBtnActive === 'disabled'}
            />
            {this.lowerPageBound >= 1 && (
              <DotButton onClick={this.btnDecrementClick} />
            )}
            {renderPageNumbers}
            {totalPaginacion > this.upperPageBound && (
              <DotButton onClick={this.btnIncrementClick} />
            )}
            <ArrowButton
              direction="next"
              onClick={this.btnNextClick}
              disabled={this.isNextBtnActive === 'disabled'}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      className = '',
      restart,
      totalPaginacion,
      data,
      theme = 'classic',
    } = this.props;

    this.messagePaginacion = `Mostrando ${data.length} de ${
      totalPaginacion === 1 ? '1 Página' : `${totalPaginacion} Páginas`
    }`;

    if (restart) {
      this.upperPageBound = 3;
      this.lowerPageBound = 0;
      this.isPrevBtnActive = 'disabled';
      this.isNextBtnActive = '';
    }

    return (
      <div className={className}>
        {theme === 'modern'
          ? this.renderModernPagination()
          : this.renderClassicPagination()}
      </div>
    );
  }
}

Paginacion.propTypes = {
  className: PropTypes.string,
  totalPaginacion: PropTypes.number.isRequired,
  fillTable: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  paginacion: PropTypes.number.isRequired,
  restart: PropTypes.bool.isRequired,
  data: PropTypes.any.isRequired,
  theme: PropTypes.oneOf(['classic', 'modern']),
};

export default Paginacion;
