import "./DniLicense.css";

export default function DniLicense() {
  return (
    <div className="dni-license-container">
      {/* Sección DNI */}
      <div className="dni-section-block">
        <h2 className="title">Documento Nacional de Identidad (DNI)</h2>
        <div className="dni-section">
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
      {/* Sección Registro */}
      <div className="license-section-block">
        <h2 className="title">Registro de Conducir</h2>
        <div className="license-section">
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
  );
}
