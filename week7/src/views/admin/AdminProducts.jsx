import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductModal from "../../component/ProductModal";
import Pagination from "../../component/Pagination";
import { useDispatch } from "react-redux";
import { createAsyncMessage } from "../../slice/messageReducer";
import * as bootstrap from "bootstrap";
import axios from "axios";
import "../../assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Product() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const productModalRef = useRef(null);
  const [modalType, setModalType] = useState("");
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [templateData, setTemplateData] = useState({
    id: "",
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    originPrice: "",
    price: 0,
    description: "",
    content: "",
    isEnabled: false,
    imagesUrl: [],
  });

  useEffect(() => {}, [templateData]);

  const openModal = (product, type) => {
    setTemplateData({
      id: product.id || "",
      imageUrl: product.imageUrl || "",
      title: product.title || "",
      category: product.category || "",
      unit: product.unit || "",
      originPrice: product.originPrice || "",
      price: Number(product.price) || 0,
      description: product.description || "",
      content: product.content || "",
      isEnabled: product.isEnabled || false,
      imagesUrl: product.imagesUrl || [],
    });
    productModalRef.current.show();
    setModalType(type);
  };

  const closeModal = () => {
    productModalRef.current.hide();
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setTemplateData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (index, value) => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages[index] = value;

      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }

      if (newImages.length > 1 && newImages[newImages.length - 1] === "") {
        newImages.pop();
      }

      return { ...prevData, imagesUrl: newImages };
    });
  };

  const handleAddImage = () => {
    setTemplateData((prevData) => ({
      ...prevData,
      imagesUrl: [...prevData.imagesUrl, ""],
    }));
  };

  const handleRemoveImage = () => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.pop();
      return { ...prevData, imagesUrl: newImages };
    });
  };

  const getProductData = useCallback(async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      dispatch(createAsyncMessage(err.response.data));
    }
  }, [dispatch]);

  const updateProductData = async (id) => {
    const product = modalType === "edit" ? `product/${id}` : `product`;
    const url = `${API_BASE}/api/${API_PATH}/admin/${product}`;

    const productData = {
      data: {
        ...templateData,
        origin_price: Number(templateData.originPrice),
        price: Number(templateData.price),
        is_enabled: templateData.isEnabled ? 1 : 0,
        imagesUrl: templateData.imagesUrl,
      },
    };

    try {
      let response;

      if (modalType === "edit") {
        response = await axios.put(url, productData);
        console.log("更新成功", response.data);
        dispatch(createAsyncMessage(response.data));
      } else {
        response = await axios.post(url, productData);
        console.log("新增成功", response.data);
      }
      closeModal();
      getProductData();
    } catch (err) {
      if (modalType === "edit") {
        console.error("更新失敗", err.response.data.message);
      } else {
        console.error("新增失敗", err.response.data.message);
      }

      dispatch(createAsyncMessage(err.response.data));
    }
  };

  const delProductData = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      console.log("刪除成功", response.data);
      dispatch(createAsyncMessage(response.data));
      await productModalRef.current.hide();
      getProductData();
    } catch (err) {
      dispatch(createAsyncMessage(err.response.data));
    }
  };

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common.Authorization = token;
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });

    const checkAdmin = async () => {
      try {
        await axios.post(`${API_BASE}/api/user/check`);
        getProductData();
      } catch (err) {
        navigate("/");
        console.log(err.response.data.message);
      }
    };
    checkAdmin();
  }, [getProductData, navigate]);


  return (
    <>
      <div className="container">
        <div className="text-end mt-4">
          <button
            type="button"
            className="btn btn-primary mt-5"
            onClick={() => openModal("", "new")}
          >
            建立新的產品
          </button>
        </div>
        <table className="table mt-4">
          <thead>
            <tr>
              <th width="120">分類</th>
              <th>產品名稱</th>
              <th width="120">原價</th>
              <th width="120">售價</th>
              <th width="100">是否啟用</th>
              <th width="120">編輯</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.category}</td>
                <td>{product.title}</td>
                <td className="text-end">{product.origin_price}</td>
                <td className="text-end">{product.price}</td>
                <td>
                  {product.is_enabled ? (
                    <span className="text-success">啟用</span>
                  ) : (
                    <span>未啟用</span>
                  )}
                </td>
                <td>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openModal(product, "edit")}
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => openModal(product, "delete")}
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={pagination} changePage={getProductData} />
      </div>

      <ProductModal
        modalType={modalType}
        templateData={templateData}
        onCloseModal={closeModal}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        onUpdateProduct={updateProductData}
        onDeleteProduct={delProductData}
      />
    </>
  );
}

export default Product;
