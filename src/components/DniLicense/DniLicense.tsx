import "./DniLicense.css";

export default function DniLicense() {
  return (
    <div className="dni-license-container">
      <div className="dni-license-unified-block">
        {/* Sección DNI */}
        <div className="document-section">
          <h3 className="section-title">
            Documento Nacional de Identidad (DNI)
          </h3>
          <div className="images-container">
            <img
              className="image"
              src="https://upload.wikimedia.org/wikipedia/commons/1/1e/DNI_Argentina_2020_Frente.jpg"
              alt="DNI frente"
            />
            <img
              className="image"
              src="https://upload.wikimedia.org/wikipedia/commons/1/1e/DNI_Argentina_2020_Frente.jpg"
              alt="DNI dorso"
            />
          </div>
        </div>

        {/* Separador visual */}
        <div className="section-divider"></div>

        {/* Sección Registro */}
        <div className="document-section">
          <h3 className="section-title">Registro de Conducir</h3>
          <div className="images-container">
            <img
              className="image"
              src="https://upload.wikimedia.org/wikipedia/commons/1/1e/DNI_Argentina_2020_Frente.jpg"
              alt="Registro frente"
            />
            <img
              className="image"
              src="https://upload.wikimedia.org/wikipedia/commons/1/1e/DNI_Argentina_2020_Frente.jpg"
              alt="Registro dorso"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
