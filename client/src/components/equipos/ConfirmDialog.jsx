"use client"

import { AlertTriangle, X } from "lucide-react"

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <h3>
            <AlertTriangle
              size={24}
              style={{ display: "inline", marginRight: "0.5rem", color: "var(--danger-color)" }}
            />
            {title}
          </h3>
          <button onClick={onCancel} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <p style={{ color: "var(--text-color)", lineHeight: "1.5", margin: "0" }}>{message}</p>
        </div>

        <div className="form-actions" style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border-color)" }}>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn-delete" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
