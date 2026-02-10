import PropTypes from "prop-types";
import Pagination from "../components/Pagination";
import ProductTable from "../components/ProductTable";

function AdminView({
  pageErrorMsg,
  products,
  isLoadingProducts,
  isSaving,
  pagination,
  startIndex,
  highlightId,
  onLogout,
  onCreate,
  onEdit,
  onDelete,
  onChangePage,
}) {
  return (
    <div className="container">
      <button className="btn btn-outline-secondary mb-3" onClick={onLogout}>
        登出
      </button>

      {pageErrorMsg ? (
        <div className="alert alert-danger" role="alert">
          {pageErrorMsg}
        </div>
      ) : null}

      <h2>產品列表</h2>

      <div className="text-end mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onCreate}
          disabled={isSaving}
        >
          建立新的產品
        </button>
      </div>

      <ProductTable
        products={products}
        isLoading={isLoadingProducts}
        isSaving={isSaving}
        startIndex={startIndex}
        highlightId={highlightId}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <Pagination pagination={pagination} onChangePage={onChangePage} />
    </div>
  );
}

AdminView.propTypes = {
  pageErrorMsg: PropTypes.string,
  products: PropTypes.array,
  isLoadingProducts: PropTypes.bool,
  isSaving: PropTypes.bool,
  pagination: PropTypes.object,
  startIndex: PropTypes.number,
  highlightId: PropTypes.string,

  onLogout: PropTypes.func,
  onCreate: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onChangePage: PropTypes.func,
};

AdminView.defaultProps = {
  pageErrorMsg: "",
  products: [],
  isLoadingProducts: false,
  isSaving: false,
  pagination: {},
  startIndex: 0,
  highlightId: "",

  onLogout: undefined,
  onCreate: undefined,
  onEdit: undefined,
  onDelete: undefined,
  onChangePage: undefined,
};

export default AdminView;

