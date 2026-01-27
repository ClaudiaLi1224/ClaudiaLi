import axios from "axios";
import { useState, useEffect } from "react";

import { currency } from "../../utils/filter";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const Cart = () => {
  const [cart, setCart] = useState([]);

  // 取得購物車列表
  const getCart = async () => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart`;
      const response = await axios.get(url);
      setCart(response.data.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 清除單一筆購物車
  const deleteCart = async (id) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart/${id}`;
      await axios.delete(url);
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 清空購物車
  const deleteCartAll = async () => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/carts`;
      await axios.delete(url);
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 更新商品數量
  const updateCart = async (id, qty = 1) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart/${id}`;

      const data = {
        product_id: id,
        qty,
      };
      await axios.put(url, { data });
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getCart();
    }, 0);

    return () => {
      clearTimeout(timer); 
    };
  }, []);

  return (
    <div className="container mt-4">
      <div className="text-end">
        <button className="btn btn-outline-danger" type="button" onClick={deleteCartAll}>
          清空購物車
        </button>
      </div>
      <table className="table align-middle">
        <thead>
          <tr>
            <th></th>
            <th>品名</th>
            <th>數量/單位</th>
            <th>單價</th>
          </tr>
        </thead>
        <tbody>
          {cart?.carts &&
            cart?.carts.map((item) => (
              <tr key={item.id}>
                <td>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => deleteCart(item.id)}>
                    <i className="bi bi-x" /> 刪除
                  </button>
                </td>
                <td>{item.product.title}</td>
                <td>
                  <div className="input-group input-group-sm">
                    <input type="number" className="form-control" min="1" defaultValue={item.qty} key={item.qty} onChange={(e) => updateCart(item.id, Number(e.target.value))} />
                    <div className="input-group-text">/{item.product.unit}</div>
                  </div>
                </td>
                <td className="text-end">
                  {item.final_total !== item.total && <small className="text-success">折扣價：</small>}
                  {currency(item.final_total)}
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="text-end">
              總計
            </td>
            <td className="text-end">{currency(cart?.total)}</td>
          </tr>
          {cart?.final_total !== cart?.total ? (
            <tr>
              <td colSpan="3" className="text-end text-success">
                折扣價
              </td>
              <td className="text-end text-success">{currency(cart?.final_total)}</td>
            </tr>
          ) : (
            ""
          )}
        </tfoot>
      </table>
    </div>
  );
};

export default Cart;
