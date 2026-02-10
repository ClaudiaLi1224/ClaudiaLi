import PropTypes from "prop-types";

function ProductModal({
  productModalRef,
  modalType,
  templateProduct,
  subImageUrl,
  setSubImageUrl,
  fieldErrors,
  modalErrorMsg,
  isSaving,
  onChange,
  onAddSubImage,
  onRemoveLastSubImage,
  onRemoveSubImageAt,
  onClose,
  onConfirm,
  uploadImage,
  uploadSubImages,
}) {

  const safe = {
    title: templateProduct?.title ?? "",
    category: templateProduct?.category ?? "",
    unit: templateProduct?.unit ?? "",
    description: templateProduct?.description ?? "",
    content: templateProduct?.content ?? "",
    imageUrl: templateProduct?.imageUrl ?? "",
    origin_price: templateProduct?.origin_price ?? 0,
    price: templateProduct?.price ?? 0,
    is_enabled: !!templateProduct?.is_enabled,
    imagesUrl: Array.isArray(templateProduct?.imagesUrl)
      ? templateProduct.imagesUrl
      : [],
    rating: templateProduct?.rating ?? 0,
  };

  const displayRating = Math.min(5, Math.max(0, Number(safe.rating || 0)));
  const ratingText = displayRating > 0 ? "★".repeat(displayRating) : "";

  return (
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
                {modalType === "create" ? "新增產品" : `編輯：${safe.title}`}
              </span>
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={isSaving}
            />
          </div>

          <div className="modal-body">
            <div className="row">
              {/* ==================== 左側：圖片區 ==================== */}
              <div className="col-sm-4">
                {/* 主圖 */}
                <div className="mb-2">
                  <div className="mb-3">
                    <label htmlFor="fileUpload" className="form-label">
                      上傳主圖
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      name="fileUpload"
                      id="fileUpload"
                      accept=".jpg, .jpeg, .png, .gif"
                      onChange={(e) => uploadImage?.(e)}
                      disabled={isSaving}
                    />
                  </div>

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
                      value={safe.imageUrl}
                      onChange={onChange}
                      disabled={isSaving}
                    />
                  </div>

                  {safe.imageUrl ? (
                    <img className="img-fluid" src={safe.imageUrl} alt="主圖" />
                  ) : (
                    <p className="text-muted">尚未輸入主圖網址</p>
                  )}
                </div>

                <hr />

                {/* 副圖：貼網址 */}
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
                      value={subImageUrl ?? ""}
                      onChange={(e) => setSubImageUrl?.(e.target.value)}
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={onAddSubImage}
                      disabled={isSaving || !(subImageUrl ?? "").trim()}
                    >
                      新增
                    </button>
                  </div>

                  {safe.imagesUrl.length ? (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {safe.imagesUrl.map((url, idx) => (
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
                            onClick={() => onRemoveSubImageAt?.(idx)}
                            aria-label={`刪除副圖${idx + 1}`}
                            disabled={isSaving}
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

                {/* 副圖：檔案上傳（多張） */}
                <div className="mb-3">
                  <label htmlFor="subFilesUpload" className="form-label">
                    上傳副圖（可多張）
                  </label>
                  <input
                    className="form-control"
                    type="file"
                    id="subFilesUpload"
                    accept=".jpg, .jpeg, .png, .gif"
                    multiple
                    onChange={(e) => uploadSubImages?.(e)}
                    disabled={isSaving}
                  />
                  <div className="form-text">
                    你可以一次選多張，會自動加入到副圖列表
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-block w-100"
                  onClick={onRemoveLastSubImage}
                  disabled={isSaving || !safe.imagesUrl.length}
                >
                  刪除最後一張副圖
                </button>
              </div>

              {/* ==================== 右側：表單區 ==================== */}
              <div className="col-sm-8">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    標題 <span className="text-danger">*</span>
                  </label>

                  <input
                    name="title"
                    id="title"
                    type="text"
                    className={`form-control ${fieldErrors?.title ? "is-invalid" : ""
                      }`}
                    placeholder="請輸入標題"
                    value={safe.title}
                    onChange={onChange}
                    disabled={isSaving}
                  />
                  {fieldErrors?.title ? (
                    <div className="invalid-feedback">{fieldErrors.title}</div>
                  ) : null}
                </div>

                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="category" className="form-label">
                      分類 <span className="text-danger">*</span>
                    </label>

                    <input
                      name="category"
                      id="category"
                      type="text"
                      className={`form-control ${fieldErrors?.category ? "is-invalid" : ""
                        }`}
                      placeholder="請輸入分類"
                      value={safe.category}
                      onChange={onChange}
                      disabled={isSaving}
                    />
                    {fieldErrors?.category ? (
                      <div className="invalid-feedback">
                        {fieldErrors.category}
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-3 col-md-6">
                    <label htmlFor="unit" className="form-label">
                      單位 <span className="text-danger">*</span>
                    </label>

                    <input
                      name="unit"
                      id="unit"
                      type="text"
                      className={`form-control ${fieldErrors?.unit ? "is-invalid" : ""
                        }`}
                      placeholder="請輸入單位"
                      value={safe.unit}
                      onChange={onChange}
                      disabled={isSaving}
                    />
                    {fieldErrors?.unit ? (
                      <div className="invalid-feedback">{fieldErrors.unit}</div>
                    ) : null}
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
                      value={safe.origin_price}
                      onChange={onChange}
                      disabled={isSaving}
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
                      value={safe.price}
                      onChange={onChange}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="rating" className="form-label">
                    商品評價星級（0～5）
                  </label>
                  <input
                    name="rating"
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="1"
                    className="form-control"
                    placeholder="0~5"
                    value={safe.rating}
                    onChange={onChange}
                    disabled={isSaving}
                  />


                  <div className="form-text">
                    目前：
                    {displayRating > 0 ? (
                      <span className="text-warning ms-1">{ratingText}</span>
                    ) : (
                      <span className="ms-1">未評分</span>
                    )}
                    <span className="ms-2 text-muted">
                      （顯示會自動限制 0～5）
                    </span>
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
                    value={safe.description}
                    onChange={onChange}
                    disabled={isSaving}
                  />
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
                    value={safe.content}
                    onChange={onChange}
                    disabled={isSaving}
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      name="is_enabled"
                      id="is_enabled"
                      className="form-check-input"
                      type="checkbox"
                      checked={safe.is_enabled}
                      onChange={onChange}
                      disabled={isSaving}
                    />
                    <label className="form-check-label" htmlFor="is_enabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="modal-footer">
            {modalErrorMsg ? (
              <div
                className="alert alert-danger py-2 px-3 mb-0 me-auto"
                role="alert"
              >
                {modalErrorMsg}
              </div>
            ) : null}

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              取消
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
              disabled={isSaving}
            >
              {isSaving ? "儲存中..." : "確認"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductModal.propTypes = {
  productModalRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]).isRequired,

  modalType: PropTypes.oneOf(["create", "edit", "view", "delete"]),
  templateProduct: PropTypes.object,
  subImageUrl: PropTypes.string,
  setSubImageUrl: PropTypes.func,

  fieldErrors: PropTypes.object,
  modalErrorMsg: PropTypes.string,

  isSaving: PropTypes.bool,

  onChange: PropTypes.func,
  onAddSubImage: PropTypes.func,
  onRemoveLastSubImage: PropTypes.func,
  onRemoveSubImageAt: PropTypes.func,

  onClose: PropTypes.func,
  onConfirm: PropTypes.func,

  uploadImage: PropTypes.func,
  uploadSubImages: PropTypes.func,
};

ProductModal.defaultProps = {
  modalType: "create",
  templateProduct: {},
  subImageUrl: "",
  setSubImageUrl: undefined,
  fieldErrors: {},
  modalErrorMsg: "",
  isSaving: false,
  onChange: undefined,
  onAddSubImage: undefined,
  onRemoveLastSubImage: undefined,
  onRemoveSubImageAt: undefined,
  onClose: undefined,
  onConfirm: undefined,
  uploadImage: undefined,
  uploadSubImages: undefined,
};

export default ProductModal;
