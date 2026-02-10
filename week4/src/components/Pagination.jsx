import PropTypes from "prop-types";

function Pagination({ pagination = {}, onChangePage }) {
  const totalPages = Number(pagination?.total_pages) || 0;
  const hasPrev = Boolean(pagination?.has_pre);
  const hasNext = Boolean(pagination?.has_next);
  const currentPage = Number(pagination?.current_page) || 1;
  if (!totalPages) return null;
  const handleClick = (e, page) => {
    e.preventDefault();
    if (!onChangePage) return;
    onChangePage(page);
  };

  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${!hasPrev ? "disabled" : ""}`}>
          <a
            className="page-link"
            href="#"
            aria-label="Previous"
            onClick={(e) => {
              if (!hasPrev) return e.preventDefault();
              handleClick(e, currentPage - 1);
            }}
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>

        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          return (
            <li
              className={`page-item ${page === currentPage ? "active" : ""}`}
              key={`${page}_page`}
            >
              <a
                className="page-link"
                href="#"
                onClick={(e) => handleClick(e, page)}
              >
                {page}
              </a>
            </li>
          );
        })}

        <li className={`page-item ${!hasNext ? "disabled" : ""}`}>
          <a
            className="page-link"
            href="#"
            aria-label="Next"
            onClick={(e) => {
              if (!hasNext) return e.preventDefault();
              handleClick(e, currentPage + 1);
            }}
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}

Pagination.propTypes = {
  pagination: PropTypes.shape({
    total_pages: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    current_page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    has_pre: PropTypes.bool,
    has_next: PropTypes.bool,
  }),
  onChangePage: PropTypes.func,
};

Pagination.defaultProps = {
  pagination: {},
  onChangePage: undefined,
};

export default Pagination;

