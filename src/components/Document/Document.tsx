import { useState } from "react";
import NotificationToast from "../NotificationToast/NotificationToast";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import { useNotification, useConfirmDialog } from "../../hooks";
import "./Document.css";

interface DocumentItem {
  id: string;
  title: string;
  expirationDate?: string;
  fileName: string;
  uploadDate: string;
}

interface DocumentProps {
  title?: string;
  initialDocuments?: DocumentItem[];
}

export default function Document({
  title = "Documentos",
  initialDocuments = [],
}: DocumentProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);

  const [showForm, setShowForm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(
    null
  );
  const [newTitle, setNewTitle] = useState("");
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [hasExpiration, setHasExpiration] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { notification, showSuccess, showError, showInfo, closeNotification } =
    useNotification();
  const {
    isOpen: confirmDialogOpen,
    message: confirmDialogMessage,
    showConfirm,
    handleConfirm: confirmDialogConfirm,
    handleCancel: confirmDialogCancel,
  } = useConfirmDialog();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today;
  };

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysDiff = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );
    return daysDiff > 0 && daysDiff <= 30;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    showInfo(`Descargando archivo: ${doc.fileName}`);

    const link = document.createElement("a");
    link.href = "#";
    link.download = doc.fileName;
    link.click();
  };

  const handleEdit = (doc: DocumentItem) => {
    setEditingDocument(doc);
    setNewTitle(doc.title);
    setNewExpirationDate(doc.expirationDate || "");
    setHasExpiration(!!doc.expirationDate);
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleDelete = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc && (isExpired(doc.expirationDate) || !doc.expirationDate)) {
      showConfirm(
        `¿Está seguro de que desea eliminar el documento "${doc.title}"?`,
        () => {
          setDocuments((prev) => prev.filter((d) => d.id !== docId));
          showSuccess("Documento eliminado exitosamente");
        }
      );
    } else {
      showError(
        "Solo se pueden eliminar documentos vencidos o sin fecha de vencimiento."
      );
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newTitle.trim() || (!selectedFile && !editingDocument)) {
      showError("Por favor, complete el título y seleccione un archivo");
      return;
    }

    if (editingDocument) {
      const updatedDocument: DocumentItem = {
        ...editingDocument,
        title: newTitle.trim(),
        expirationDate: hasExpiration ? newExpirationDate : undefined,
        fileName: selectedFile ? selectedFile.name : editingDocument.fileName,
      };

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === editingDocument.id ? updatedDocument : doc
        )
      );
      showSuccess("Documento actualizado exitosamente");
    } else {
      const newDocument: DocumentItem = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        expirationDate: hasExpiration ? newExpirationDate : undefined,
        fileName: selectedFile!.name,
        uploadDate: new Date().toISOString().split("T")[0],
      };

      setDocuments((prev) => [...prev, newDocument]);
      showSuccess("Documento agregado exitosamente");
    }

    handleCloseForm();
  };

  const handleCancel = () => {
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setIsClosing(true);
    setTimeout(() => {
      setNewTitle("");
      setNewExpirationDate("");
      setHasExpiration(false);
      setSelectedFile(null);
      setEditingDocument(null);
      setShowForm(false);
      setIsClosing(false);

      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }, 195);
  };
  return (
    <div className="document">
      <div className="document-header">
        <h2>{title}</h2>
        <button className="add-document-btn" onClick={() => setShowForm(true)}>
          + Agregar Documento
        </button>
      </div>
      {}
      <div className="documents-list">
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <div className="document-content">
              <h3 className="document-title">{doc.title}</h3>
              <p className="document-filename">Archivo: {doc.fileName}</p>
              <p className="document-upload-date">
                Subido: {formatDate(doc.uploadDate)}
              </p>

              <div className="document-expiration-container">
                {doc.expirationDate && (
                  <p
                    className={`document-expiration ${
                      isExpired(doc.expirationDate)
                        ? "expired"
                        : isExpiringSoon(doc.expirationDate)
                        ? "expiring-soon"
                        : "valid"
                    }`}
                  >
                    Vencimiento: {formatDate(doc.expirationDate)}
                    {isExpired(doc.expirationDate) && " (VENCIDO)"}
                    {isExpiringSoon(doc.expirationDate) &&
                      " (Próximo a vencer)"}
                  </p>
                )}
              </div>
            </div>

            {}
            <div className="document-actions">
              <button
                className="action-btn download-btn"
                onClick={() => handleDownload(doc)}
                title="Descargar archivo"
              >
                📥 Descargar
              </button>

              <button
                className="action-btn edit-btn"
                onClick={() => handleEdit(doc)}
                title="Editar documento"
              >
                ✏️ Editar
              </button>

              <button
                className="action-btn delete-btn"
                onClick={() => handleDelete(doc.id)}
                disabled={
                  !isExpired(doc.expirationDate) && !!doc.expirationDate
                }
                title={
                  isExpired(doc.expirationDate) || !doc.expirationDate
                    ? "Eliminar documento"
                    : "Solo se pueden eliminar documentos vencidos"
                }
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>{" "}
      {}
      {showForm && (
        <div
          className={`document-form-overlay ${isClosing ? "closing" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseForm();
            }
          }}
        >
          <div className="document-form">
            <h3>
              {editingDocument ? "Editar Documento" : "Agregar Nuevo Documento"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="document-form-group">
                <label htmlFor="title">Título del Documento *</label>
                <input
                  type="text"
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ingrese el título del documento"
                  required
                />
              </div>

              <div className="document-form-group">
                <label className="document-checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasExpiration}
                    onChange={(e) => setHasExpiration(e.target.checked)}
                  />
                  Este documento tiene fecha de vencimiento
                </label>
              </div>

              {hasExpiration && (
                <div className="document-form-group">
                  <label htmlFor="expiration">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    id="expiration"
                    value={newExpirationDate}
                    onChange={(e) => setNewExpirationDate(e.target.value)}
                  />
                </div>
              )}

              <div className="document-form-group">
                <label htmlFor="file-input">
                  Archivo del Documento {editingDocument ? "" : "*"}
                </label>
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required={!editingDocument}
                />
                {editingDocument && !selectedFile && (
                  <p className="current-file">
                    Archivo actual: {editingDocument.fileName}
                  </p>
                )}
                {selectedFile && (
                  <p className="selected-file">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="document-form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="document-cancel-btn"
                >
                  Cancelar
                </button>
                <button type="submit" className="document-submit-btn">
                  Confirmar y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
      {}
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirmar eliminación"
        message={confirmDialogMessage}
        onConfirm={confirmDialogConfirm}
        onCancel={confirmDialogCancel}
      />
    </div>
  );
}
