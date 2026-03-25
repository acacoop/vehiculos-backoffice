import "./PrivacyPolicyPage.css";
import { PolicySection } from "./PolicySection";
import { ContactInfo } from "./ContactInfo";
import { privacyPolicyData } from "./data";

export default function PrivacyPolicyPage() {
  const {
    appName,
    companyName,
    cuit,
    lastUpdated,
    sections,
    companyContact,
    authorityContact,
  } = privacyPolicyData;

  // Separamos la última sección (Contacto) del resto
  const mainSections = sections.slice(0, -1);
  const contactSection = sections[sections.length - 1];

  return (
    <div className="privacy-policy-page">
      <div className="privacy-policy-content">
        <div className="privacy-header-info">
          <p>
            <strong>Aplicación:</strong> {appName}
          </p>
          <p>
            <strong>Propiedad de:</strong> {companyName}
          </p>
          <p>
            <strong>CUIT:</strong> {cuit}
          </p>
          <p>
            <strong>Fecha de última actualización:</strong> {lastUpdated}
          </p>
        </div>

        {mainSections.map((section) => (
          <PolicySection key={section.id} section={section} />
        ))}

        <PolicySection section={contactSection} />
        <ContactInfo contact={companyContact} />

        <p className="authority-notice">
          Ante cualquier reclamo no resuelto satisfactoriamente, el titular de
          los datos tiene la facultad de ejercer el derecho de acceso ante la
          Agencia de Acceso a la Información Pública (AAIP):
        </p>
        <ContactInfo contact={authorityContact} />
      </div>
    </div>
  );
}
