import { useState, useEffect } from "react";
import axios from"axios"; 
import "./assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const defaultProducts = [
  {
    category: "甜甜圈",
    content: "尺寸：14x14cm",
    description:
      "濃郁的草莓風味，中心填入滑順不膩口的卡士達內餡，帶來滿滿幸福感！",
    id: "-L9tH8jxVb2Ka_DYPwng",
    is_enabled: 1,
    origin_price: 150,
    price: 99,
    title: "草莓莓果夾心圈",
    unit: "元",
    num: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1583182332473-b31ba08929c8",
    imagesUrl: [
      "https://images.unsplash.com/photo-1626094309830-abbb0c99da4a",
      "https://images.unsplash.com/photo-1559656914-a30970c1affd",
    ],
  },
  {
    category: "蛋糕",
    content: "尺寸：6寸",
    description:
      "蜜蜂蜜蛋糕，夾層夾上酸酸甜甜的檸檬餡，清爽可口的滋味讓人口水直流！",
    id: "-McJ-VvcwfN1_Ye_NtVA",
    is_enabled: 1,
    origin_price: 1000,
    price: 900,
    title: "蜂蜜檸檬蛋糕",
    unit: "個",
    num: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?auto=format&fit=crop&w=1001&q=80",
    imagesUrl: [
      "https://images.unsplash.com/photo-1618888007540-2bdead974bbb?auto=format&fit=crop&w=987&q=80",
    ],
  },
  {
    category: "蛋糕",
    content: "尺寸：6寸",
    description: "法式煎薄餅加上濃郁可可醬，呈現經典的美味及口感。",
    id: "-McJ-VyqaFlLzUMmpPpm",
    is_enabled: 1,
    origin_price: 700,
    price: 600,
    title: "暗黑千層",
    unit: "個",
    num: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1505253149613-112d21d9f6a9?auto=format&fit=crop&w=700&q=60",
    imagesUrl: [
      "https://images.unsplash.com/flagged/photo-1557234985-425e10c9d7f1?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1540337706094-da10342c93d8?auto=format&fit=crop&w=700&q=60",
    ],
  },
];

const getTokenFromCookie = () => 
  document.cookie
    .split("; ")
    .find((row) => row.startsWith("hexToken="))
    ?.split("=")[1];

function App() {

const[formData, setFormData]=useState({
  username:'claudiali1224@gmail.com',  
  password:'', 
});
const [isAuth, setIsAuth]=useState(false); 
const [products, setProducts] = useState(defaultProducts);
const [tempProduct, setTempProduct] = useState(null);


const handleInputChange=(e)=>{
  const{name, value}=e.target; 
  setFormData((preData)=>({...preData,[name]:value  }))
}; 


const getProducts=async()=>{
    try{
    const response= await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`)
    const apiProducts = Array.isArray(response.data.products)
      ? response.data.products
      : Object.values(response.data.products || {});

    setProducts((prev)=>{
    const merged=[...prev, ...apiProducts]; 
    const map=new Map(merged.map((p)=>[p.id, p])); 
    return Array.from(map.values());
  }); 
}catch(error){
    console.log(error?.response); 
  }
  };


const checkLogin=async()=>{
  try {
    const token = getTokenFromCookie();
    if (!token) {
      setIsAuth(false);
      return false;
    }

axios.defaults.headers.common["Authorization"] = token;
await axios.post(`${API_BASE}/api/user/check`)
setIsAuth(true);
    return true;
  } catch (error) {
    setIsAuth(false);
    return false;
  }
}; 


const onSubmit=async(e)=>{
    e.preventDefault(); 
    try{
    const response= await axios.post(`${API_BASE}/admin/signin`, formData)
    const{token, expired}=response.data; 
    
    document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
axios.defaults.headers.common["Authorization"] = token;

setIsAuth(true); 
sessionStorage.setItem("hasLogin", "true");
setProducts(defaultProducts);              
await getProducts(); 
}catch(error){
  setIsAuth(false); 
    console.log(error?.response); 
  }
  };


const logout = () => {
  document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  delete axios.defaults.headers.common["Authorization"];
  sessionStorage.removeItem("hasLogin"); 
  setIsAuth(false);
  setProducts(defaultProducts);  
  setTempProduct(null);
};


return (
    <>
    {!isAuth?(
  <div className="container login">
          <h1>請先登入</h1>
              <form 
              className="form-floating" 
              method="post"
              onSubmit={(e)=>onSubmit(e)}>
                <div className="form-floating mb-3">
  <input 
  type="email" 
  className="form-control" 
  name="username" 
  placeholder="name@example.com"
  value={formData.username}
  onChange={(e)=>handleInputChange(e)}/>

  <label htmlFor="username">Email address</label>
</div>
<div className="form-floating">
  <input 
  type="password" 
  className="form-control" 
  name="password" 
  placeholder="Password"
  value={formData.password}
  onChange={(e)=>handleInputChange(e)}/>

  <label htmlFor="password">Password</label>
</div>         
<button type="submit" className="btn btn-primary w-200 mt-2">
登入
</button>
</form>
</div>
):(
<div className="container">

      <div className="row mt-5">
        <div className="col-md-6">

<button
  className="btn btn-danger mb-5 me-2"
  type="button"
  onClick={async()=>{
    console.log("click 確認是否登入");
  const ok =await checkLogin(); 
  console.log("checkLogin result =", ok);
  if(ok){
    await getProducts(); 
    console.log("getProducts done");
    }
}}
  >
    確認是否登入
    </button>
    

    <button className="btn btn-outline-secondary mb-5" onClick={logout}>
  登出
</button>
          <h2>產品列表</h2>
          <table className="table">
            <thead>
              <tr>
                <th>產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>查看細節</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.origin_price}</td>
                  <td>{item.price}</td>
                  <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => setTempProduct(item)}>
                      查看細節
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <h2>單一產品細節</h2>
          {tempProduct ? (
            <div className="card mb-3">
              <img src={tempProduct.imageUrl} className="card-img-top primary-image" alt="主圖" />
              <div className="card-body">
                <h5 className="card-title">
                  {tempProduct.title}
                  <span className="badge bg-primary ms-2">{tempProduct.category}</span>
                </h5>
                <p className="card-text">商品描述：{tempProduct.description}</p>
                <p className="card-text">商品內容：{tempProduct.content}</p>
                <div className="d-flex">
                  <p className="card-text text-secondary">
                    <del>{tempProduct.origin_price}</del>
                  </p>
                  元 / {tempProduct.price} 元
                </div>
                <h5 className="mt-3">更多圖片：</h5>
                <div className="d-flex flex-wrap">
                  {(tempProduct.imagesUrl||[]).map((url, index) => (
                    <img key={index} src={url} className="images" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-secondary">請選擇一個商品查看</p>
          )}
        </div>
      </div>
  </div>
)}
</>
); 

}

export default App;
