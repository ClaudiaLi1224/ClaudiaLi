import PropTypes from "prop-types";
import { useEffect } from "react";

function SkeletonRow() {
  return (
    <tr>
      <td colSpan={8}>
        <div className="d-flex flex-column gap-2 py-2">
          <div
            className="bg-body-secondary rounded"
            style={{ height: 14, width: "90%" }}
          />
          <div
            className="bg-body-secondary rounded"
            style={{ height: 14, width: "70%" }}
          />
        </div>
      </td>
    </tr>
  );
}

function ProductTable({
  products = [],
  isLoading = false,
  isSaving = false,
  startIndex = 0,
  highlightId = "",
  onEdit,
  onDelete,
}) {

  useEffect(() => {
    if (!highlightId) return;
    if (isLoading) return;

    const el = document.querySelector(`[data-product-id="${highlightId}"]`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.01)" },
        { transform: "scale(1)" },
      ],
      { duration: 350 }
    );
  }, [highlightId, isLoading, products]);

  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{ width: 80 }}>序號</th>
          <th>分類</th>
          <th>產品名稱</th>
          <th>原價</th>
          <th>售價</th>
          <th style={{ width: 120 }}>星級</th>
          <th style={{ width: 110 }}>是否啟用</th>
          <th style={{ width: 160 }}>編輯</th>
        </tr>
      </thead>

      <tbody>
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : products.length ? (
          products.map((product, index) => {
            const displayNo = startIndex + index + 1;
            const ratingNum = Math.min(
              5,
              Math.max(0, Number(product?.rating || 0))
            );

            const isHighlight = highlightId && product?.id === highlightId;

            return (
              <tr
                key={product.id}
                data-product-id={product.id}
                className={isHighlight ? "table-warning" : ""}
              >
                <td>{displayNo}</td>
                <td>{product.category}</td>
                <td>{product.title}</td>
                <td>{product.origin_price}</td>
                <td>{product.price}</td>
                <td>
                  {ratingNum > 0 ? (
                    <span className="text-warning">
                      {"★".repeat(ratingNum)}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td
                  className={`${product.is_enabled ? "text-success" : "text-secondary"
                    }`}
                >
                  {product.is_enabled ? "啟用" : "未啟用"}
                </td>

                <td>
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="product actions"
                  >
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => onEdit?.(product)}
                      disabled={isSaving}
                    >
                      編輯
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onDelete?.(product, displayNo)}
                      disabled={isSaving}
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={8} className="text-muted">
              目前沒有產品資料
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

ProductTable.propTypes = {
  products: PropTypes.array,
  isLoading: PropTypes.bool,
  isSaving: PropTypes.bool,
  startIndex: PropTypes.number,
  highlightId: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

ProductTable.defaultProps = {
  products: [],
  isLoading: false,
  isSaving: false,
  startIndex: 0,
  highlightId: "",
  onEdit: undefined,
  onDelete: undefined,
};

export default ProductTable;


