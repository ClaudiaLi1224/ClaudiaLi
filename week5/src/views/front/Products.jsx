import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const Product = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const handleViewMore = async(id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
      navigate(`/product/${id}`, { state: { productData: res.data } });
      console.log(res.data);
    } catch (error) {
      console.error("取得產品資料失敗", error);
    }
  };

  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/${API_PATH}/products`);
        console.log(res.data.products);
        setProducts(res.data.products);
      } catch (error) {
        console.error("取得產品資料失敗", error);
      }
    };
  
    getProduct();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        {products.map((product) => (
          <div className="col-md-4 mb-3" key={product.id}>
            <div className="card">
              <img
                src={product.imageUrl}
                className="card-img-top"
                alt={product.title}
              />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">
                  {product.description}
                </p>
                <p className="card-text">
                  <strong>價格:</strong> {product.price} 元
                </p>
                <p className="card-text">
                  <small className="text-muted">單位: {product.unit}</small>
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleViewMore(product.id)}
                >
                  查看更多
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;
