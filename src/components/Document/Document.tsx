import { useState } from "react";
import "./Document.css";

interface DocumentItem {
  id: string;
  title: string;
  expirationDate?: string;
  fileName: string;
  uploadDate: string;
}

export default function Document() {
  // Documentos hardcodeados iniciales
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "1",
      title: "Registro del Vehículo",
      expirationDate: "2024-12-31",
      fileName: "registro_vehiculo.pdf",
      uploadDate: "2024-01-15",
    },
    {
      id: "2",
      title: "Seguro del Vehículo",
      expirationDate: "2024-08-15",
      fileName: "seguro_auto.pdf",
      uploadDate: "2024-02-01",
    },
    {
      id: "3",
      title: "Revisión Técnica",
      expirationDate: "2024-10-20",
      fileName: "revision_tecnica.pdf",
      uploadDate: "2024-03-10",
    },
    {
      id: "4",
      title: "Manual del Usuario",
      fileName: "manual_usuario.pdf",
      uploadDate: "2024-01-01",
    },
  ]);

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(
    null
  );
  const [newTitle, setNewTitle] = useState("");
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [hasExpiration, setHasExpiration] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    // Simular descarga del archivo
    // En una aplicación real, esto haría una petición al servidor para obtener el archivo
    alert(`Descargando archivo: ${doc.fileName}`);

    // Crear un enlace temporal para simular la descarga
    const link = document.createElement("a");
    link.href = "#"; // En una app real, sería la URL del archivo
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
      if (
        window.confirm(
          `¿Está seguro de que desea eliminar el documento "${doc.title}"?`
        )
      ) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      }
    } else {
      alert(
        "Solo se pueden eliminar documentos vencidos o sin fecha de vencimiento."
      );
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newTitle.trim() || (!selectedFile && !editingDocument)) {
      alert("Por favor, complete el título y seleccione un archivo");
      return;
    }

    if (editingDocument) {
      // Editar documento existente
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
    } else {
      // Crear nuevo documento
      const newDocument: DocumentItem = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        expirationDate: hasExpiration ? newExpirationDate : undefined,
        fileName: selectedFile!.name,
        uploadDate: new Date().toISOString().split("T")[0],
      };

      setDocuments((prev) => [...prev, newDocument]);
    }

    // Iniciar animación de cierre
    handleCloseForm();
  };

  const handleCancel = () => {
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setIsClosing(true);
    setTimeout(() => {
      // Limpiar formulario
      setNewTitle("");
      setNewExpirationDate("");
      setHasExpiration(false);
      setSelectedFile(null);
      setEditingDocument(null);
      setShowForm(false);
      setIsClosing(false);

      // Reset file input
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }, 195); // Duración de la animación de salida
  };
  return (
    <div className="document">
      <div className="document-header">
        <h2>Documentos del Vehículo</h2>
        <button className="add-document-btn" onClick={() => setShowForm(true)}>
          + Agregar Documento
        </button>
      </div>
      {/* Lista de documentos existentes */}
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

            {/* Botones de acción */}
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
      {/* Formulario para agregar documento */}
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
              <div className="form-group">
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

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasExpiration}
                    onChange={(e) => setHasExpiration(e.target.checked)}
                  />
                  Este documento tiene fecha de vencimiento
                </label>
              </div>

              {hasExpiration && (
                <div className="form-group">
                  <label htmlFor="expiration">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    id="expiration"
                    value={newExpirationDate}
                    onChange={(e) => setNewExpirationDate(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
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

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  Confirmar y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
