import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const setAuthCookiesAndHeaders = (token, expired) => {
  document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
  axios.defaults.headers.common.Authorization = `${token}`;
};

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, data);
      const { token, expired } = response.data;

      setAuthCookiesAndHeaders(token, expired);
      
      navigate("/admin/products");
    } catch (error) {
      alert("登入失敗: " + error.response.data.message);
    }
  };

  return (
    <div className="container login mt-5">
      <div className="row justify-content-center">
        <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
        <div className="col-8">
          <form id="form" className="form-signin" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className={`form-control ${errors.username ? "is-invalid" : ""}`}
                id="username"
                placeholder="name@example.com"
                {...register("username", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
              />
              <label htmlFor="username">Email address</label>
              {errors.username && (
                <div className="invalid-feedback">{errors.username.message}</div>
              )}
            </div>
            <div className="form-floating">
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                id="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <label htmlFor="password">Password</label>
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>
            <button
              className="btn btn-lg btn-primary w-100 mt-3"
              type="submit"
            >
              登入
            </button>
          </form>
        </div>
      </div>
      <p className="mt-5 mb-3 text-muted">&copy; 2025~∞ - 六角學院</p>
    </div>
  );
};

export default Login;
