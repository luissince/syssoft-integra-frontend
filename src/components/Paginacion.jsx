import React from 'react';
import PropTypes from 'prop-types';
import Row from './Row';
import Column from './Column';
import Button from './Button';

/**
 * Componente que representa una funcionalidad específica.
 * @class
 * @extends React.Component
 */
class Paginacion extends React.Component {
  constructor(props) {
    super(props);
    this.upperPageBound = 3;
    this.lowerPageBound = 0;
    this.isPrevBtnActive = 'disabled';
    this.isNextBtnActive = '';
    this.pageBound = 3;
    this.messagePaginacion = 'Mostranto 0 de 0 Páginas';
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

    let listid = parseInt(event.target.id);
    this.setPrevAndNextBtnClass(listid);
  };

  btnPrevClick = async () => {
    if (this.props.loading) return;

    if ((this.props.paginacion - 1) % this.pageBound === 0) {
      this.upperPageBound = this.upperPageBound - this.pageBound;
      this.lowerPageBound = this.lowerPageBound - this.pageBound;
    }
    let listid = this.props.paginacion - 1;
    this.setPrevAndNextBtnClass(listid);
  };

  btnNextClick = async () => {
    if (this.props.loading) return;

    if (this.props.paginacion + 1 > this.upperPageBound) {
      this.upperPageBound = this.upperPageBound + this.pageBound;
      this.lowerPageBound = this.lowerPageBound + this.pageBound;
    }
    let listid = this.props.paginacion + 1;
    this.setPrevAndNextBtnClass(listid);
  };

  btnDecrementClick = async () => {
    if (this.props.loading) return;

    this.upperPageBound = this.upperPageBound - this.pageBound;
    this.lowerPageBound = this.lowerPageBound - this.pageBound;
    let listid = this.upperPageBound;
    this.setPrevAndNextBtnClass(listid);
  };

  btnIncrementClick = async () => {
    if (this.props.loading) return;

    this.upperPageBound = this.upperPageBound + this.pageBound;
    this.lowerPageBound = this.lowerPageBound + this.pageBound;

    let listid = this.lowerPageBound + 1;
    this.setPrevAndNextBtnClass(listid);
  };

  renderModernPagination = () => {
    const {
      className = "",
      totalPaginacion,
      paginacion,
      theme = 'classic'
    } = this.props;

    const pageNumbers = Array.from({ length: totalPaginacion }, (_, i) => i + 1);

    const RenderPageNumbers = () => {
      return pageNumbers.map((number, index) => {
        if (number > this.lowerPageBound && number < this.upperPageBound + 1) {
          const isActive = number === paginacion;

          const commonProps = {
            key: index,
            id: number,
            className: isActive
              ? "relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md z-10 bg-blue-600 border-blue-600 text-white"
              : "relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
          };

          return isActive ? (
            <span {...commonProps}>{number}</span>
          ) : (
            <button {...commonProps} onClick={this.handleClick}>
              {number}
            </button>
          );
        }

        return null;
      });
    };

    const DotButton = ({ type, onClick }) => {
      if (type === 'decrement' && this.lowerPageBound >= 1 || type === 'increment' && pageNumbers.length > this.upperPageBound) {
        return (
          <button
            onClick={onClick}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            &hellip;
          </button>
        );
      }

      return null;
    };

    const ArrowButton = ({ direction, onClick, disabled }) => {
      const d = direction === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';
      return (
        <button
          onClick={onClick}
          disabled={disabled}
          className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${disabled
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
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex flex-col md:flex-row gap-y-2 items-center justify-between w-full">
          <div className="text-sm text-gray-700">{this.messagePaginacion}</div>
          <div className="flex items-center space-x-2">
            <ArrowButton
              direction="prev"
              onClick={this.btnPrevClick}
              disabled={this.isPrevBtnActive === 'disabled' || totalPaginacion <= 1}
            />
            <DotButton type="decrement" onClick={this.btnDecrementClick} />
            <RenderPageNumbers />
            <DotButton type="increment" onClick={this.btnIncrementClick} />
            <ArrowButton
              direction="next"
              onClick={this.btnNextClick}
              disabled={this.isNextBtnActive === 'disabled' || totalPaginacion <= 1}
            />
          </div>
        </div>
      </div>
    );
  }

  renderClassicPagination = () => {
    const {
      className = "",
      totalPaginacion,
      paginacion,
      theme = 'classic'
    } = this.props;

    const pageNumbers = [];
    for (let i = 1; i <= totalPaginacion; i++) {
      pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map((number, index) => {
      if (number === 1 && paginacion === 1) {
        return (
          <li key={index} className="page-item active" aria-current="page">
            <span className="page-link">{number}</span>
          </li>
        );
      }

      if (number < this.upperPageBound + 1 && number > this.lowerPageBound) {
        return (
          <li
            key={index}
            className={`page-item ${number === paginacion ? 'active' : ''}`}
          >
            {number === paginacion ? (
              <span id={number} className="page-link">
                {number}
              </span>
            ) : (
              <Button
                id={number}
                contentClassName="page-link"
                onClick={this.handleClick}
              >
                {number}
              </Button>
            )}
          </li>
        );
      }

      return null;
    });

    let pageDecrementBtn = null;
    if (this.lowerPageBound >= 1) {
      pageDecrementBtn = (
        <li className="page-item">
          <Button contentClassName="page-link" onClick={this.btnDecrementClick}>
            {' '}
            &hellip;{' '}
          </Button>
        </li>
      );
    }

    let pageIncrementBtn = null;
    if (pageNumbers.length > this.upperPageBound) {
      pageIncrementBtn = (
        <li className="page-item">
          <Button contentClassName="page-link" onClick={this.btnIncrementClick}>
            {' '}
            &hellip;{' '}
          </Button>
        </li>
      );
    }

    let renderPrevBtn = null;
    if (this.isPrevBtnActive === 'disabled' || totalPaginacion <= 1) {
      renderPrevBtn = (
        <li className="page-item disabled">
          <span className="page-link"> Ante. </span>
        </li>
      );
    } else {
      renderPrevBtn = (
        <li className="page-item">
          <Button contentClassName="page-link" onClick={this.btnPrevClick}>
            {' '}
            Ante.{' '}
          </Button>
        </li>
      );
    }

    let renderNextBtn = null;
    if (this.isNextBtnActive === 'disabled' || totalPaginacion <= 1) {
      renderNextBtn = (
        <li className="page-item disabled">
          <span className="page-link"> Sigui. </span>
        </li>
      );
    } else {
      renderNextBtn = (
        <li className="page-item">
          <Button contentClassName="page-link" onClick={this.btnNextClick}>
            {' '}
            Sigui.{' '}
          </Button>
        </li>
      );
    }

    return (
      <Row className={className}>
        <Column className="col-sm-12 col-md-5">
          <div className="d-flex h-100 align-items-center">
            <span className='text-sm'>{this.messagePaginacion}</span>
          </div>
        </Column>
        <Column className="col-sm-12 col-md-7">
          <div className="d-flex justify-content-end">
            <nav aria-label="Page">
              <ul className="pagination m-0">
                {renderPrevBtn}
                {pageDecrementBtn}
                {renderPageNumbers}
                {pageIncrementBtn}
                {renderNextBtn}
              </ul>
            </nav>
          </div>
        </Column>
      </Row>
    );
  }

  render() {
    const {
      restart,
      totalPaginacion,
      data,
      theme = 'classic'
    } = this.props;

    this.messagePaginacion = `Mostrando ${data.length} de ${totalPaginacion === 1 ? '1 Página' : `${totalPaginacion} Páginas`}`;

    if (restart) {
      this.upperPageBound = 3;
      this.lowerPageBound = 0;
      this.isPrevBtnActive = 'disabled';
      this.isNextBtnActive = '';
    }

    return (
      <div className="overflow-auto">
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
}

export default Paginacion;
