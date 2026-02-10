import PropTypes from "prop-types";

function AdminToolbar({
  onLogout,    
  onCreate,    
  isSaving,    
  pageErrorMsg 
}) {
  return (
    <>
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
    </>
  );
}

AdminToolbar.propTypes = {
  onLogout: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  pageErrorMsg: PropTypes.string,
};

AdminToolbar.defaultProps = {
  isSaving: false,
  pageErrorMsg: "",
};

export default AdminToolbar;
