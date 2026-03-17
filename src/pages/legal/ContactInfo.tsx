import type { ContactInfo as ContactInfoType } from "./data";
import "./ContactInfo.css";

interface ContactInfoProps {
  contact: ContactInfoType;
  title?: string;
}

export function ContactInfo({ contact, title }: ContactInfoProps) {
  return (
    <div className="contact-info-card">
      {title && <p className="contact-info-title">{title}</p>}
      {contact.name && <p className="contact-info-name">{contact.name}</p>}
      {contact.attention && (
        <p className="contact-info-item">
          <span>Atención:</span> {contact.attention}
        </p>
      )}
      <p className="contact-info-item">
        <span>Dirección:</span> {contact.address}
      </p>
      <p className="contact-info-item">
        <span>Teléfono:</span> {contact.phone}
      </p>
      <p className="contact-info-item">
        <span>Correo:</span>{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>
      {contact.web && (
        <p className="contact-info-item">
          <span>Web:</span>{" "}
          <a href={contact.web} target="_blank" rel="noopener noreferrer">
            {contact.web}
          </a>
        </p>
      )}
    </div>
  );
}
