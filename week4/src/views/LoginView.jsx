import PropTypes from "prop-types";

function LoginView({ formData, onChange, onSubmit, isSubmitting, pageErrorMsg }) {
  return (
    <div className="container login">
      <h1>請先登入</h1>
      {pageErrorMsg ? (
        <div className="alert alert-danger" role="alert">
          {pageErrorMsg}
        </div>
      ) : null}

      <form className="form-floating" autoComplete="off" onSubmit={onSubmit}>
        <div className="form-floating mb-3">
          <input
            id="username"
            type="email"
            className="form-control"
            name="username"
            placeholder="name@example.com"
            value={formData.username}
            onChange={onChange}
            autoComplete="username"
            disabled={isSubmitting}
          />
          <label htmlFor="username">Email address</label>
        </div>

        <div className="form-floating">
          <input
            id="password"
            type="password"
            className="form-control"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={onChange}
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          <label htmlFor="password">Password</label>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "登入中..." : "登入"}
        </button>
      </form>
    </div>
  );
}

LoginView.propTypes = {
  formData: PropTypes.shape({
    username: PropTypes.string,
    password: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  pageErrorMsg: PropTypes.string,
};

LoginView.defaultProps = {
  onChange: undefined,
  onSubmit: undefined,
  isSubmitting: false,
  pageErrorMsg: "",
};

export default LoginView;