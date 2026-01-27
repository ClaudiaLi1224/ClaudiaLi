import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";

// ✅ GitHub Pages 常見拿不到 env，所以要給保底值
const API_BASE =
  import.meta.env.VITE_API_BASE || "https://ec-course-api.hexschool.io/v2";

// ✅ API Path 如果也會 undefined，就給一個保底（換成自己的）
const API_PATH = import.meta.env.VITE_API_PATH || "claudia1121";


// 用途：modal 表單的「空白預設值」，新增產品時會先用這份把欄位清空cdcd
const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: 0,
  price: 0,
  unit: "",
  description: "",
  content: "",
  is_enabled: 0,
  num: 0,
  imageUrl: "",
  imagesUrl: [],
  _ts: 0, // 排序用：本地時間戳
};

// 用途：畫面預設產品資料，避免一開始畫面空白，也可和 API 資料合併顯示
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
    imageUrl: "https://images.unsplash.com/photo-1583182332473-b31ba08929c8",
    imagesUrl: [
      "https://images.unsplash.com/photo-1626094309830-abbb0c99da4a",
      "https://images.unsplash.com/photo-1559656914-a30970c1affd",
    ],
    _ts: 1,
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
    _ts: 2,
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
    _ts: 3,
  },
];

// 用 defaultProducts 的 id 當「展示資料」判斷依據：不能編輯/刪除
const DEFAULT_IDS = new Set(defaultProducts.map((p) => p.id));
const isDefaultProduct = (p) => DEFAULT_IDS.has(p?.id);

// 用途：從 cookie 取出 token（沒有 token 就代表目前不是登入狀態）
const getTokenFromCookie = () =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith("hexToken="))
    ?.split("=")[1];

function App() {
  // 用途：儲存登入表單的 email / password
  const [formData, setFormData] = useState({
    username: "claudiali1224@gmail.com",
    password: "",
  });

  // 用途：決定畫面顯示登入頁或管理頁（true=已登入）
  const [isAuth, setIsAuth] = useState(false);

  // 用途：有 token 時才顯示「驗證登入中...」的過渡畫面
  const [isChecking, setIsChecking] = useState(false);

  // 用途：登入送出中，避免重複點擊登入
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 儲存/刪除中（Modal 確認按鈕 loading / 避免連點）
  const [isSaving, setIsSaving] = useState(false);

  // 用途：產品列表顯示用的資料
  const [products, setProducts] = useState(defaultProducts);

  // 用途：modal 表單正在新增/編輯的暫存資料
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);

  // 用途：記錄 modal 目前是新增(create)或編輯(edit)
  const [modalType, setModalType] = useState("");

  // 錯誤訊息拆成 page / modal（互不污染）
  const [pageErrorMsg, setPageErrorMsg] = useState("");
  const [modalErrorMsg, setModalErrorMsg] = useState("");

  // 用途：取得 modal 的 DOM 元素，讓 Bootstrap 綁定控制開關
  const productModalRef = useRef(null);

  // 用途：記住開 modal 前焦點在哪
  const lastActiveElRef = useRef(null);

  // 用途：避免舊的 API 回應覆蓋最新狀態
  const reqSeqRef = useRef(0);

  // 副圖輸入框用的暫存文字（只在按「新增副圖」時才塞進 imagesUrl）
  const [subImageUrl, setSubImageUrl] = useState("");

  // 紅色 alert + 3 秒自動消失（page / modal 各一份 timer）
  const pageTimerRef = useRef(null);
  const modalTimerRef = useRef(null);

  const showPageError = useCallback((msg) => {
    setPageErrorMsg(msg);
    if (pageTimerRef.current) clearTimeout(pageTimerRef.current);
    pageTimerRef.current = setTimeout(() => {
      setPageErrorMsg("");
      pageTimerRef.current = null;
    }, 3000);
  }, []);

  const showModalError = useCallback((msg) => {
    setModalErrorMsg(msg);
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    modalTimerRef.current = setTimeout(() => {
      setModalErrorMsg("");
      modalTimerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (pageTimerRef.current) clearTimeout(pageTimerRef.current);
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    };
  }, []);

  // 用途：取得（或建立）Bootstrap modal instance
  const getModal = useCallback(() => {
    const modalEl = productModalRef.current;
    if (!modalEl) return null;
    return bootstrap.Modal.getOrCreateInstance(modalEl, { keyboard: false });
  }, []);

  // 用途：登入表單輸入時更新 formData
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((pre) => ({ ...pre, [name]: value }));
  }, []);

  // 用途：modal 表單輸入時更新 templateProduct
  const handleTemplateChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setTemplateProduct((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : type === "number"
            ? value === ""
              ? 0
              : Number(value)
            : value,
    }));
  }, []);

  




  // 新增副圖（把 subImageUrl 推進 templateProduct.imagesUrl）
  const addSubImage = useCallback(() => {
    const url = subImageUrl.trim();
    if (!url) return;

    setTemplateProduct((prev) => ({
      ...prev,
      imagesUrl: [...(prev.imagesUrl || []), url],
    }));

    setSubImageUrl("");
  }, [subImageUrl]);

  // 刪除最後一張副圖
  const removeLastSubImage = useCallback(() => {
    setTemplateProduct((prev) => ({
      ...prev,
      imagesUrl: (prev.imagesUrl || []).slice(0, -1),
    }));
  }, []);

  // 刪除指定第 N 張副圖（idx 從 0 開始）
  const removeSubImageAt = useCallback((idx) => {
    setTemplateProduct((prev) => ({
      ...prev,
      imagesUrl: (prev.imagesUrl || []).filter((_, i) => i !== idx),
    }));
  }, []);

  // 用途：集中清理狀態
  const resetApp = useCallback(
    (options = { keepEmail: true, clearPassword: true, clearToken: false }) => {
      reqSeqRef.current += 1;

      delete axios.defaults.headers.common["Authorization"];

      if (options.clearToken) {
        document.cookie =
          "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }

      setIsAuth(false);
      setProducts(defaultProducts);
      setTemplateProduct(INITIAL_TEMPLATE_DATA);
      setModalType("");

      // reset 也清 page / modal
      setPageErrorMsg("");
      setModalErrorMsg("");

      setSubImageUrl("");

      setFormData((prev) => ({
        ...prev,
        username: options.keepEmail ? prev.username : "",
        password: options.clearPassword ? "" : prev.password,
      }));

      try {
        if (document.body.classList.contains("modal-open")) {
          getModal()?.hide();
        }
      } catch {
        // ignore
      }
    },
    [getModal]
  );

  // 401/403：自動登出 + 顯示紅色提示（3 秒會自動消失，因為用 showPageError）
  const forceLogoutWithMsg = useCallback(
    (msg = "登入已失效，請重新登入") => {
      // resetApp 會清 token / header / 關 modal / 回到預設資料
      resetApp({ keepEmail: true, clearPassword: true, clearToken: true });
      showPageError(msg);
    },
    [resetApp, showPageError]
  );

  // 只要是 401/403（沒權限/未登入），就統一處理
  const handleAuthError = useCallback(
    (err, msg) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        forceLogoutWithMsg(msg);
        return true; // 表示已處理（已登出）
      }
      return false;
    },
    [forceLogoutWithMsg]
  );


  // 用途：向後端取得產品列表並更新 products
const getProducts = useCallback(async () => {
  const mySeq = reqSeqRef.current;

  try {
    // 先把 API 所有頁撈完
    let page = 1;
    let allApiProducts = [];
    let totalPages = 1;

    do {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
      );
      if (mySeq !== reqSeqRef.current) return;

      const apiProducts = Array.isArray(res.data.products)
        ? res.data.products
        : Object.values(res.data.products || {});

      allApiProducts = allApiProducts.concat(apiProducts);

      totalPages = res.data.pagination?.total_pages || 1;
      page += 1;
    } while (page <= totalPages);

      const merged = [...defaultProducts, ...allApiProducts];

      const map = new Map(merged.map((p) => [p.id, p]));
      const uniqueList = Array.from(map.values());

      const withSortTs = uniqueList.map((p) => ({
        ...p,
        _sortTs: Number(p._ts) || 0,
      }));

      // 舊 → 新（最新會在最下面）
      withSortTs.sort((a, b) => a._sortTs - b._sortTs);

      setProducts(withSortTs);
      setPageErrorMsg("");
    } catch (err) {
      if (mySeq !== reqSeqRef.current) return;
      if (handleAuthError(err, "登入已失效（401/403），請重新登入")) return;
      showPageError("取得產品失敗，請稍後再試");
    }
  }, [showPageError, handleAuthError]);

  // 用途：驗證目前 token 是否有效
  const checkAdmin = useCallback(async () => {
    const mySeq = reqSeqRef.current;

    try {
      await axios.post(`${API_BASE}/api/user/check`);
      if (mySeq !== reqSeqRef.current) return false;

      setIsAuth(true);
      await getProducts();
      return true;
    } catch (err) {
      if (mySeq !== reqSeqRef.current) return false;
      // 驗證時遇到 401/403：自動登出 + 提示
      if (handleAuthError(err, "登入已失效（401/403），請重新登入")) return false;
      setIsAuth(false);
      return false;
    }
  }, [getProducts, handleAuthError]);

  // 用途：modal 關閉時處理焦點 + 清掉 modal 訊息
  useEffect(() => {
    const modalEl = productModalRef.current;
    if (!modalEl) return;

    const handleHide = () => {
      const active = document.activeElement;
      if (active && modalEl.contains(active)) active.blur?.();
      document.body.setAttribute("tabindex", "-1");
      document.body.focus();
    };

    const handleHidden = () => {
      // 任何方式關掉 modal，都清掉提示 + 清 timer
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      setModalErrorMsg("");

      lastActiveElRef.current?.focus?.();
    };

    modalEl.addEventListener("hide.bs.modal", handleHide);
    modalEl.addEventListener("hidden.bs.modal", handleHidden);

    return () => {
      modalEl.removeEventListener("hide.bs.modal", handleHide);
      modalEl.removeEventListener("hidden.bs.modal", handleHidden);
    };
  }, []);

  // 用途：頁面載入時如果 cookie 有 token 就自動驗證登入
  useEffect(() => {
    const token = getTokenFromCookie();

    resetApp({ keepEmail: true, clearPassword: false, clearToken: false });

    if (!token) return;

    const init = async () => {
      const mySeq = reqSeqRef.current;
      setIsChecking(true);

      try {
        axios.defaults.headers.common["Authorization"] = token;

        const ok = await checkAdmin();
        if (!ok && mySeq === reqSeqRef.current) {
          resetApp({ keepEmail: true, clearPassword: false, clearToken: true });
        }
      } finally {
        setIsChecking(false);
      }
    };

    init();
  }, [checkAdmin, resetApp]);

  // 用途：關閉 modal
  const closeModal = useCallback(() => {
    // 關 modal 立刻清掉提示 + timer
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    setModalErrorMsg("");

    const modalEl = productModalRef.current;
    const active = document.activeElement;
    if (modalEl && active && modalEl.contains(active)) {
      active.blur?.();
    }
    getModal()?.hide();
  }, [getModal]);

  // 用途：開啟 modal
  const openModal = useCallback(
    (type, product) => {
      // 開 modal 先清 modal 提示
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      setModalErrorMsg("");

      lastActiveElRef.current = document.activeElement;

      setModalType(type);
      setSubImageUrl("");

      if (type === "create") {
        setTemplateProduct({ ...INITIAL_TEMPLATE_DATA, _ts: Date.now() });
      } else {
        setTemplateProduct({
          ...INITIAL_TEMPLATE_DATA,
          ...product,
        });
      }

      setTimeout(() => {
        getModal()?.show();
      }, 0);
    },
    [getModal]
  );

  // =========================================================
  // handleConfirm（新增/編輯）
  // =========================================================
  const handleConfirm = useCallback(async () => {
    if (isSaving) return;

    const required = [
      { key: "title", label: "標題" },
      { key: "category", label: "分類" },
      { key: "unit", label: "單位" },
    ];

    const missing = required
      .filter((f) => !String(templateProduct[f.key] ?? "").trim())
      .map((f) => f.label);

    if (missing.length) {
      showModalError(`無法存檔，請填寫：${missing.join("、")}`);
      return;
    }

    setIsSaving(true);
    // 送出前清 modal 提示
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    setModalErrorMsg("");

    try {
      const now = Date.now();

      const dataForApi = {
        ...templateProduct,
        _ts: now,
      };

      const payload = { data: dataForApi };

      if (modalType === "create") {
        await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, payload);
      } else if (modalType === "edit") {
        // 防呆：理論上不會發生（因為 openModal 已擋 default）
        if (isDefaultProduct(templateProduct)) {
          showModalError("此筆為「展示資料」，只能查看，不能存檔（不能編輯/刪除）。");
          return;
        }

        await axios.put(
          `${API_BASE}/api/${API_PATH}/admin/product/${templateProduct.id}`,
          payload
        );
      } else {
        showModalError("modalType 不正確，請重新操作。");
        return;
      }

      await getProducts();
      closeModal();
    } catch (err) {
      // 401/403：自動登出 + 提示（避免以為是「存檔失敗」）
      if (handleAuthError(err, "登入已失效（401/403），請重新登入")) return;

      const serverMsg = err?.response?.data?.message;
      const msg = Array.isArray(serverMsg)
        ? serverMsg.join("、")
        : serverMsg || "儲存失敗，請稍後再試";

      showModalError(msg);
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    templateProduct,
    modalType,
    getProducts,
    closeModal,
    showModalError,
    handleAuthError,
  ]);

  // 刪除商品：預設資料不能刪除 + 有提示
  const handleDelete = useCallback(
    async (product) => {
      if (isSaving) return;

      if (isDefaultProduct(product)) {
        showPageError("預設資料僅供展示，不能刪除。");
        return;
      }

      const ok = window.confirm(`確定要刪除：${product.title}？`);
      if (!ok) return;

      setIsSaving(true);
      setPageErrorMsg("");

      try {
        await axios.delete(
          `${API_BASE}/api/${API_PATH}/admin/product/${product.id}`
        );

        await getProducts();
      } catch (err) {
        // 401/403：自動登出 + 提示
        if (handleAuthError(err, "登入已失效（401/403），請重新登入")) return;


        const serverMsg = err?.response?.data?.message;
        const msg = Array.isArray(serverMsg)
          ? serverMsg.join("、")
          : serverMsg || "刪除失敗，請稍後再試";
        showPageError(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, getProducts, showPageError, handleAuthError]
  );

  // 用途：登入送出
const onSubmit = useCallback(
  async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const mySeq = reqSeqRef.current;

    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      if (mySeq !== reqSeqRef.current) return;

      const { token, expired } = res.data;

      document.cookie = `hexToken=${token}; expires=${new Date(
        expired
      ).toUTCString()}; path=/`;

      axios.defaults.headers.common["Authorization"] = token;

      setPageErrorMsg("");
      await checkAdmin();
    } catch (err) {
      if (mySeq !== reqSeqRef.current) return;

      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      console.log("signin error:", status, err?.response?.data);

      setIsAuth(false);

      // ✅ 真的 401 才叫做帳密錯
      if (status === 401) {
        showPageError("登入失敗：帳號或密碼錯誤");
      } else {
        showPageError(
          `登入失敗：${status || "no status"} ${
            Array.isArray(msg) ? msg.join("、") : msg || ""
          }`
        );
      }
    } finally {
      if (mySeq === reqSeqRef.current) setIsSubmitting(false);
    }
  },
  [formData, checkAdmin, isSubmitting, showPageError]
);


  // 用途：登出
  const logout = useCallback(() => {
    resetApp({ keepEmail: true, clearPassword: true, clearToken: true });
  }, [resetApp]);

  // 用途：自動驗證登入時的過渡畫面
  if (isChecking) {
    return (
      <div className="container login">
        <h1>驗證登入中...</h1>
      </div>
    );
  }

  // 用途：modal 的完整 UI
  const modalJSX = (
    <div
      className="modal fade"
      id="productModal"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
      ref={productModalRef}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div className="modal-header bg-dark text-white">
            <h5 id="productModalLabel" className="modal-title">
              <span>
                {modalType === "create"
                  ? "新增產品"
                  : `編輯：${templateProduct.title}`}
              </span>
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={closeModal}
            ></button>
          </div>

          <div className="modal-body">


            <div className="row">
              <div className="col-sm-4">
                {/* 主圖 */}
                <div className="mb-2">
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">
                      輸入主圖網址
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      className="form-control"
                      placeholder="請輸入主圖連結"
                      value={templateProduct.imageUrl}
                      onChange={handleTemplateChange}
                    />
                  </div>

                  {templateProduct.imageUrl ? (
                    <img
                      className="img-fluid"
                      src={templateProduct.imageUrl}
                      alt="主圖"
                    />
                  ) : (
                    <p className="text-muted">尚未輸入主圖網址</p>
                  )}
                </div>

                <hr />

                {/* 副圖區塊 */}
                <div className="mb-3">
                  <label htmlFor="imageUrlSub" className="form-label">
                    輸入副圖網址
                  </label>

                  <div className="input-group">
                    <input
                      id="imageUrlSub"
                      type="text"
                      className="form-control"
                      placeholder="請輸入副圖連結"
                      value={subImageUrl}
                      onChange={(e) => setSubImageUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={addSubImage}
                      disabled={!subImageUrl.trim()}
                    >
                      新增
                    </button>
                  </div>

                  {templateProduct.imagesUrl?.length ? (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {templateProduct.imagesUrl.map((url, idx) => (
                        <div key={url + idx} className="position-relative">
                          <img
                            className="img-fluid"
                            style={{
                              width: 110,
                              height: 110,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                            src={url}
                            alt={`副圖${idx + 1}`}
                          />

                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            style={{ transform: "translate(30%, -30%)" }}
                            onClick={() => removeSubImageAt(idx)}
                            aria-label={`刪除副圖${idx + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mt-2">尚未輸入副圖網址</p>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-block w-100"
                  onClick={removeLastSubImage}
                  disabled={!templateProduct.imagesUrl?.length}
                >
                  刪除最後一張副圖
                </button>
              </div>

              {/* 右側表單 */}
              <div className="col-sm-8">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    標題
                  </label>
                  <input
                    name="title"
                    id="title"
                    type="text"
                    className="form-control"
                    placeholder="請輸入標題"
                    value={templateProduct.title}
                    onChange={handleTemplateChange}
                  />
                </div>

                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                      value={templateProduct.category}
                      onChange={handleTemplateChange}
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                      value={templateProduct.unit}
                      onChange={handleTemplateChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="origin_price" className="form-label">
                      原價
                    </label>
                    <input
                      name="origin_price"
                      id="origin_price"
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="請輸入原價"
                      value={templateProduct.origin_price}
                      onChange={handleTemplateChange}
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="price" className="form-label">
                      售價
                    </label>
                    <input
                      name="price"
                      id="price"
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="請輸入售價"
                      value={templateProduct.price}
                      onChange={handleTemplateChange}
                    />
                  </div>
                </div>

                <hr />

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    產品描述
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    className="form-control"
                    placeholder="請輸入產品描述"
                    value={templateProduct.description}
                    onChange={handleTemplateChange}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="content" className="form-label">
                    說明內容
                  </label>
                  <textarea
                    name="content"
                    id="content"
                    className="form-control"
                    placeholder="請輸入說明內容"
                    value={templateProduct.content}
                    onChange={handleTemplateChange}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      name="is_enabled"
                      id="is_enabled"
                      className="form-check-input"
                      type="checkbox"
                      checked={!!templateProduct.is_enabled}
                      onChange={handleTemplateChange}
                    />
                    <label className="form-check-label" htmlFor="is_enabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {/* Modal 的紅色 alert（3 秒自動消失） */}
            {modalErrorMsg ? (
              <div className="alert alert-danger py-2 px-3 mb-0 me-auto" role="alert">
                {modalErrorMsg}
              </div>
            ) : null}

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={closeModal}
              disabled={isSaving}
            >
              取消
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={isSaving}
            >
              {isSaving ? "儲存中..." : "確認"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>

          {/* 登入頁紅色 alert（3 秒自動消失） */}
          {pageErrorMsg ? (
            <div className="alert alert-danger" role="alert">
              {pageErrorMsg}
            </div>
          ) : null}

          <form className="form-floating" autoComplete="off" onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              {/* 補 id，label htmlFor 才會對到 */}
              <input
                id="username"
                type="email"
                className="form-control"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
              />
              <label htmlFor="username">Email address</label>
            </div>

            <div className="form-floating">
              {/* 補 id */}
              <input
                id="password"
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
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
      ) : (
        <div className="container">
          <button className="btn btn-outline-secondary mb-3" onClick={logout}>
            登出
          </button>

          {/* 管理頁紅色 alert（3 秒自動消失） */}
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
              onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
              disabled={isSaving}
            >
              建立新的產品
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>序號</th>
                <th>分類</th>
                <th>產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>編輯</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const isDemo = isDefaultProduct(product);

                return (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.category}</td>
                    <td>
                      {product.title}
                      {isDemo ? (
                        <span className="badge text-bg-secondary ms-2">
                          展示
                        </span>
                      ) : null}
                    </td>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td className={`${product.is_enabled ? "text-success" : "text-secondary"}`}>
                      {product.is_enabled ? "啟用" : "未啟用"}
                    </td>
                    <td>
                      <div
                        className="btn-group"
                        role="group"
                        aria-label="Basic example"
                      >
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openModal("edit", product)}
                          disabled={isSaving}   // 只擋儲存中，不擋展示資料
                        >
                          編輯
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(product)}
                          disabled={isSaving || isDemo} // 展示資料不可刪除
                          title={isDemo ? "展示資料不可刪除" : ""}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="text-muted">
            ※ 標記「展示」的是預設資料：只能看、不能編輯/刪除。
          </p>
        </div>
      )}

      {createPortal(modalJSX, document.body)}
    </>
  );
}

export default App;


