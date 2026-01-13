import { useLocation } from "react-router-dom";

const SingleProduct = () => {
  const location = useLocation();
  const product = location.state?.productData.product;
  if (!product) {
    return <div>沒有可用的產品資料。</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card" style={{ width: "18rem" }}>
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
            <strong>分類:</strong> {product.category}
          </p>
          <p className="card-text">
            <strong>單位:</strong> {product.unit}
          </p>
          <p className="card-text">
            <strong>原價:</strong> {product.origin_price} 元
          </p>
          <p className="card-text">
            <strong>現價:</strong> {product.price} 元
          </p>
          <button className="btn btn-primary">立即購買</button>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
