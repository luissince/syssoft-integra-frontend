const Paginacion = (props) => {
  const pageNumbers = [];
  for (let i = 1; i <= props.totalPaginacion; i++) {
    pageNumbers.push(i);
  }

  const renderPageNumbers = pageNumbers.map((number, index) => {
    if (number === 1 && props.paginacion === 1) {
      return (
        <li key={index} className="page-item active" aria-current="page">
          <span className="page-link">{number}</span>
        </li>
      );
    } else if (
      number < props.upperPageBound + 1 &&
      number > props.lowerPageBound
    ) {
      return (
        <li
          key={index}
          className={`page-item ${number === props.paginacion ? "active" : ""}`}
        >
          {number === props.paginacion ? (
            <span id={number} className="page-link">
              {number}
            </span>
          ) : (
            <button
              id={number}
              className="page-link"
              onClick={props.handleClick}
            >
              {number}
            </button>
          )}
        </li>
      );
    }
  });

  let pageIncrementBtn = null;
  if (pageNumbers.length > props.upperPageBound) {
    pageIncrementBtn = (
      <li className="page-item">
        <button className="page-link" onClick={props.btnIncrementClick}>
          {" "}
          &hellip;{" "}
        </button>
      </li>
    );
  }

  let pageDecrementBtn = null;
  if (props.lowerPageBound >= 1) {
    pageDecrementBtn = (
      <li className="page-item">
        <button className="page-link" onClick={props.btnDecrementClick}>
          {" "}
          &hellip;{" "}
        </button>
      </li>
    );
  }

  let renderPrevBtn = null;
  if (props.isPrevBtnActive === "disabled") {
    renderPrevBtn = (
      <li className="page-item disabled">
        <span className="page-link"> Ante. </span>
      </li>
    );
  } else {
    renderPrevBtn = (
      <li className="page-item">
        <button className="page-link" onClick={props.btnPrevClick}>
          {" "}
          Ante.{" "}
        </button>
      </li>
    );
  }

  let renderNextBtn = null;
  if (props.isNextBtnActive === "disabled" || props.totalPaginacion <= 1) {
    renderNextBtn = (
      <li className="page-item disabled">
        <span className="page-link"> Sigui. </span>
      </li>
    );
  } else {
    renderNextBtn = (
      <li className="page-item">
        <button className="page-link" onClick={props.btnNextClick}>
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
};

export default Paginacion;
