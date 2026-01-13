import { Link, Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div>
      <nav>
        <Link className="h4 mt-5 mx-2" to="/admin/products">
          後台產品頁面
        </Link>
        <Link className="h4 mt-5 mx-2" to="/admin/orders">
          訂單頁面
        </Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
