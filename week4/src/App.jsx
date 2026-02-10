import ProductModal from "./components/ProductModal";
import LoginView from "./views/LoginView";
import AdminView from "./views/AdminView";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://ec-course-api.hexschool.io/v2";
const API_PATH = import.meta.env.VITE_API_PATH || "claudia1121";

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
  rating: 0,
  _ts: 0,
};

const getTokenFromCookie = () =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith("hexToken="))
    ?.split("=")[1];

function App() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");

  const [pagination, setPagination] = useState({});

  const [pageErrorMsg, setPageErrorMsg] = useState("");
  const [modalErrorMsg, setModalErrorMsg] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [subImageUrl, setSubImageUrl] = useState("");

  const [highlightId, setHighlightId] = useState("");

  const productModalRef = useRef(null);
  const lastActiveElRef = useRef(null);
  const reqSeqRef = useRef(0);

  const pageTimerRef = useRef(null);
  const modalTimerRef = useRef(null);

  const highlightTimerRef = useRef(null);

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

  const flashHighlight = useCallback((id, ms = 2500) => {
    setHighlightId(id);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightId("");
      highlightTimerRef.current = null;
    }, ms);
  }, []);

  useEffect(() => {
    return () => {
      if (pageTimerRef.current) clearTimeout(pageTimerRef.current);
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const getModal = useCallback(() => {
    const modalEl = productModalRef.current;
    if (!modalEl) return null;
    return bootstrap.Modal.getOrCreateInstance(modalEl, { keyboard: false });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((pre) => ({ ...pre, [name]: value }));
  }, []);

  const handleTemplateChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    setFieldErrors((prev) => {
      if (!prev?.[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

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

  const uploadFileToServer = useCallback(async (file) => {
    const fd = new FormData();
    fd.append("file-to-upload", file);
    const res = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, fd);
    return res.data.imageUrl;
  }, []);

  const uploadImage = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const url = await uploadFileToServer(file);
        setTemplateProduct((prev) => ({ ...prev, imageUrl: url }));
      } catch (error) {
        console.log(error?.response || error);
        showModalError("主圖上傳失敗，請稍後再試");
      } finally {
        e.target.value = "";
      }
    },
    [uploadFileToServer, showModalError]
  );

  const uploadSubImages = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      try {
        const urls = [];
        for (const file of files) {
          const url = await uploadFileToServer(file);
          urls.push(url);
        }

        setTemplateProduct((prev) => ({
          ...prev,
          imagesUrl: [...(prev.imagesUrl || []), ...urls],
        }));
      } catch (error) {
        console.log(error?.response || error);
        showModalError("副圖上傳失敗，請稍後再試");
      } finally {
        e.target.value = "";
      }
    },
    [uploadFileToServer, showModalError]
  );

  const addSubImage = useCallback(() => {
    const url = subImageUrl.trim();
    if (!url) return;

    setTemplateProduct((prev) => ({
      ...prev,
      imagesUrl: [...(prev.imagesUrl || []), url],
    }));
    setSubImageUrl("");
  }, [subImageUrl]);

  const removeLastSubImage = useCallback(() => {
    setTemplateProduct((prev) => ({
      ...prev,
      imagesUrl: (prev.imagesUrl || []).slice(0, -1),
    }));
  }, []);

  const removeSubImageAt = useCallback((idx) => {
    setTemplateProduct((prev) => ({
      ...prev,
      imagesUrl: (prev.imagesUrl || []).filter((_, i) => i !== idx),
    }));
  }, []);

  const resetApp = useCallback(
    (options = { keepEmail: true, clearPassword: true, clearToken: false }) => {
      reqSeqRef.current += 1;

      delete axios.defaults.headers.common["Authorization"];

      if (options.clearToken) {
        document.cookie =
          "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }

      setIsAuth(false);
      setProducts([]);
      setPagination({});
      setIsLoadingProducts(false);

      setTemplateProduct(INITIAL_TEMPLATE_DATA);
      setModalType("");

      setPageErrorMsg("");
      setModalErrorMsg("");
      setFieldErrors({});
      setSubImageUrl("");

      setHighlightId("");
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }

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

  const forceLogoutWithMsg = useCallback(
    (msg = "登入已失效，請重新登入") => {
      resetApp({ keepEmail: true, clearPassword: true, clearToken: true });
      showPageError(msg);
    },
    [resetApp, showPageError]
  );

  const handleAuthError = useCallback(
    (err, msg) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        forceLogoutWithMsg(msg);
        return true;
      }
      return false;
    },
    [forceLogoutWithMsg]
  );

  const getProducts = useCallback(
    async (page = 1) => {
      const mySeq = reqSeqRef.current;
      setIsLoadingProducts(true);

      try {
        const res = await axios.get(
          `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
        );
        if (mySeq !== reqSeqRef.current) return;

        const apiProducts = Array.isArray(res.data.products)
          ? res.data.products
          : Object.values(res.data.products || {});

        setProducts(apiProducts);
        setPagination(res.data.pagination || {});
        setPageErrorMsg("");
      } catch (err) {
        if (mySeq !== reqSeqRef.current) return;
        if (handleAuthError(err, "登入已失效（401/403），請重新登入")) return;
        showPageError("取得產品失敗，請稍後再試");
      } finally {
        if (mySeq === reqSeqRef.current) setIsLoadingProducts(false);
      }
    },
    [showPageError, handleAuthError]
  );

  const checkAdmin = useCallback(async () => {
    const mySeq = reqSeqRef.current;

    try {
      await axios.post(`${API_BASE}/api/user/check`);
      if (mySeq !== reqSeqRef.current) return false;

      setIsAuth(true);
      await getProducts(1);
      return true;
    } catch (err) {
      if (mySeq !== reqSeqRef.current) return false;
      if (handleAuthError(err, "登入已失效（401/403），請重新登入")) return false;
      setIsAuth(false);
      return false;
    }
  }, [getProducts, handleAuthError]);

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
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      setModalErrorMsg("");
      setFieldErrors({});
      lastActiveElRef.current?.focus?.();
    };

    modalEl.addEventListener("hide.bs.modal", handleHide);
    modalEl.addEventListener("hidden.bs.modal", handleHidden);

    return () => {
      modalEl.removeEventListener("hide.bs.modal", handleHide);
      modalEl.removeEventListener("hidden.bs.modal", handleHidden);
    };
  }, []);

  useEffect(() => {
    const token = getTokenFromCookie();
    const hasLogin = sessionStorage.getItem("hasLogin");

    resetApp({ keepEmail: true, clearPassword: false, clearToken: false });

    if (!token || !hasLogin) return;

    const init = async () => {
      const mySeq = reqSeqRef.current;
      setIsChecking(true);

      try {
        axios.defaults.headers.common["Authorization"] = token;

        const ok = await checkAdmin();
        if (!ok && mySeq === reqSeqRef.current) {
          resetApp({ keepEmail: true, clearPassword: false, clearToken: true });
          sessionStorage.removeItem("hasLogin");
        }
      } finally {
        if (mySeq === reqSeqRef.current) setIsChecking(false);
      }
    };

    init();
  }, [checkAdmin, resetApp]);

  const closeModal = useCallback(() => {
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    setModalErrorMsg("");
    setFieldErrors({});

    const modalEl = productModalRef.current;
    const active = document.activeElement;
    if (modalEl && active && modalEl.contains(active)) {
      active.blur?.();
    }
    getModal()?.hide();
  }, [getModal]);

  const openModal = useCallback(
    (type, product) => {
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      setModalErrorMsg("");
      setFieldErrors({});

      lastActiveElRef.current = document.activeElement;

      setModalType(type);
      setSubImageUrl("");

      if (type === "create") {
        setTemplateProduct({ ...INITIAL_TEMPLATE_DATA, _ts: Date.now() });
      } else {
        setTemplateProduct({ ...INITIAL_TEMPLATE_DATA, ...product });
      }

      setTimeout(() => {
        getModal()?.show();
      }, 0);
    },
    [getModal]
  );

  const handleConfirm = useCallback(async () => {
    if (isSaving) return;

    const required = [
      { key: "title", label: "標題" },
      { key: "category", label: "分類" },
      { key: "unit", label: "單位" },
    ];

    const errors = {};
    required.forEach(({ key, label }) => {
      if (!String(templateProduct[key] ?? "").trim()) {
        errors[key] = `${label}為必填`;
      }
    });

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      showModalError("無法存檔：請檢查標記為紅框的必填欄位");
      return;
    }

    setIsSaving(true);
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    setModalErrorMsg("");

    try {
      const now = Date.now();

      const safeRating = Math.min(
        5,
        Math.max(0, Number(templateProduct.rating || 0))
      );

      const payload = {
        data: {
          ...templateProduct,
          rating: safeRating,
          _ts: now,
        },
      };

      if (modalType === "create") {
        await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, payload);
        await getProducts(1);
      } else if (modalType === "edit") {
        await axios.put(
          `${API_BASE}/api/${API_PATH}/admin/product/${templateProduct.id}`,
          payload
        );

        const currentPage = Number(pagination?.current_page) || 1;
        await getProducts(currentPage);
        flashHighlight(templateProduct.id);
      } else {
        showModalError("modalType 不正確，請重新操作。");
        return;
      }

      closeModal();
    } catch (err) {
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
    pagination,
    flashHighlight,
  ]);

  const handleDelete = useCallback(
    async (product, displayNo) => {
      if (isSaving) return;

      const title = product?.title || "(未命名)";
      const category = product?.category || "-";
      const price = product?.price ?? "-";
      const id = product?.id || "";

      const ok = window.confirm(
        `確定要刪除這筆商品嗎？\n\n` +
        `序號：${displayNo}\n` +
        `名稱：${title}\n` +
        `分類：${category}\n` +
        `售價：${price}\n` +
        `ID：${id}`
      );
      if (!ok) return;

      setIsSaving(true);
      setPageErrorMsg("");

      try {
        await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);

        const currentPage = Number(pagination?.current_page) || 1;
        await getProducts(currentPage);
      } catch (err) {
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
    [isSaving, pagination, getProducts, showPageError, handleAuthError]
  );

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
        sessionStorage.setItem("hasLogin", "true");
      } catch (err) {
        if (mySeq !== reqSeqRef.current) return;

        const status = err?.response?.status;
        const data = err?.response?.data;
        const serverMsg = data?.message;
        const errorCode = data?.error?.code;

        setIsAuth(false);

        if (
          status === 400 &&
          typeof errorCode === "string" &&
          errorCode.startsWith("auth/")
        ) {
          showPageError("登入失敗：帳號或密碼錯誤");
          return;
        }

        if (status === 401) {
          showPageError("登入失敗：帳號或密碼錯誤");
          return;
        }

        if (status === 400) {
          const msg = Array.isArray(serverMsg) ? serverMsg.join("、") : serverMsg;
          showPageError(`登入失敗（400）：${msg || "請確認輸入格式"}`);
          return;
        }

        const msg = Array.isArray(serverMsg) ? serverMsg.join("、") : serverMsg;
        showPageError(`登入失敗：${status || "no status"} ${msg || ""}`);
      } finally {
        if (mySeq === reqSeqRef.current) setIsSubmitting(false);
      }
    },
    [formData, checkAdmin, isSubmitting, showPageError]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem("hasLogin");
    resetApp({ keepEmail: false, clearPassword: true, clearToken: true });
  }, [resetApp]);

  if (isChecking) {
    return (
      <div className="container login">
        <h1>驗證登入中...</h1>
      </div>
    );
  }

  const currentPage = Number(pagination?.current_page) || 1;
  const perPage = Number(pagination?.per_page) || 10;
  const startIndex = (currentPage - 1) * perPage;

  return (
    <>
      {!isAuth ? (
        <LoginView
          formData={formData}
          onChange={handleInputChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          pageErrorMsg={pageErrorMsg}
        />
      ) : (
        <AdminView
          pageErrorMsg={pageErrorMsg}
          products={products}
          isLoadingProducts={isLoadingProducts}
          isSaving={isSaving}
          pagination={pagination}
          startIndex={startIndex}
          highlightId={highlightId} 
          onLogout={logout}
          onCreate={() => openModal("create", INITIAL_TEMPLATE_DATA)}
          onEdit={(p) => openModal("edit", p)}
          onDelete={handleDelete}
          onChangePage={getProducts}
        />
      )}

      <ProductModal
        productModalRef={productModalRef}
        modalType={modalType}
        templateProduct={templateProduct}
        subImageUrl={subImageUrl}
        setSubImageUrl={setSubImageUrl}
        fieldErrors={fieldErrors}
        modalErrorMsg={modalErrorMsg}
        isSaving={isSaving}
        onChange={handleTemplateChange}
        onAddSubImage={addSubImage}
        onRemoveLastSubImage={removeLastSubImage}
        onRemoveSubImageAt={removeSubImageAt}
        onClose={closeModal}
        onConfirm={handleConfirm}
        uploadImage={uploadImage}
        uploadSubImages={uploadSubImages}
      />
    </>
  );
}

export default App;
