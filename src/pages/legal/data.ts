export interface SubSection {
  id: string;
  title: string;
  content: string;
}

export interface Section {
  id: number;
  title: string;
  content?: string;
  subSections?: SubSection[];
}

export interface ContactInfo {
  name?: string;
  attention?: string;
  address: string;
  phone: string;
  email: string;
  web?: string;
}

export interface PrivacyPolicyData {
  appName: string;
  companyName: string;
  cuit: string;
  lastUpdated: string;
  sections: Section[];
  companyContact: ContactInfo;
  authorityContact: ContactInfo;
}

export const privacyPolicyData: PrivacyPolicyData = {
  appName: "ACACOOP Gestión Operativa",
  companyName: "Asociación de Cooperativas Argentinas Cooperativa Limitada",
  cuit: "30-50012088-2",
  lastUpdated: "17 de marzo de 2026",

  sections: [
    {
      id: 1,
      title: "Introducción y Alcance",
      content: `La Asociación de Cooperativas Argentinas Cooperativa Limitada (en adelante, "ACA", "nosotros", "nuestro" o "la empresa") se compromete a proteger la privacidad de sus colaboradores en el uso de la aplicación móvil ACACOOP Gestión Operativa y su sistema de backoffice asociado (en adelante, la "Plataforma").

Esta Plataforma es una herramienta corporativa de uso exclusivo para empleados y colaboradores internos de ACA, diseñada para la gestión integral de la flota vehicular. Esta Política de Privacidad describe cómo recopilamos, utilizamos, protegemos y gestionamos la información generada a través de la Plataforma en el marco de la relación laboral u operativa con la empresa.

Al iniciar sesión y utilizar la Plataforma, el colaborador acepta las prácticas descritas en este documento. Le recomendamos consultar este documento periódicamente ante posibles actualizaciones.`,
    },
    {
      id: 2,
      title: "Información que Recopilamos y Permisos del Dispositivo",
      content:
        "Recopilamos información estrictamente necesaria para la operatoria, auditoría y gestión de la flota vehicular de la empresa:",
      subSections: [
        {
          id: "2.1",
          title: "Información del Colaborador",
          content:
            "Datos de identificación corporativa para el acceso y asignación de responsabilidades, como nombre, apellido, correo electrónico corporativo, número de teléfono, legajo o número de identificación interno.",
        },
        {
          id: "2.2",
          title: "Información Operativa y de Transporte",
          content:
            "Historial de reservas de vehículos, cancelaciones o modificaciones, reportes de estado de las unidades, resultados de checklists de inspección, registro de desperfectos, daños reportados y consulta de documentación (seguros, VTV).",
        },
        {
          id: "2.3",
          title: "Información del Dispositivo",
          content:
            "Recopilamos datos técnicos básicos para el funcionamiento, seguridad y soporte de la app, como sistema operativo, modelo del dispositivo, dirección IP, fecha y hora de acceso, y registros de fallos (crash logs).",
        },
        {
          id: "2.4",
          title: "Permisos Específicos (Cámara y Almacenamiento)",
          content:
            "Para el cumplimiento de sus funciones, la Plataforma requerirá acceso a la cámara y a la galería de imágenes del dispositivo. Este acceso se utilizará exclusivamente para que el colaborador pueda adjuntar fotografías como evidencia en los reportes de daños, desperfectos, checklists de inspección o carga de documentación vehicular. La aplicación no accederá a fotos personales ni a otros archivos fuera del contexto de la Plataforma.",
        },
        {
          id: "2.5",
          title: "Geolocalización (Ausencia de rastreo)",
          content:
            "La Plataforma no requiere, no solicita y no rastrea la ubicación geográfica (GPS) del dispositivo del colaborador, ni en primer plano ni en segundo plano.",
        },
      ],
    },
    {
      id: 3,
      title: "Cómo Recopilamos la Información",
      content: "Obtenemos la información a través de los siguientes medios:",
      subSections: [
        {
          id: "3.1",
          title: "Proporcionada Directamente",
          content:
            "Cuando el colaborador inicia sesión, completa checklists de control vehicular, reporta un siniestro o desperfecto, o realiza/modifica una reserva de unidad.",
        },
        {
          id: "3.2",
          title: "Recopilada Automáticamente",
          content:
            "Mediante el uso del sistema, generando registros en nuestros servidores (logs de actividad) para auditar quién reservó qué vehículo y en qué momento, así como reportes automáticos de errores de la aplicación para soporte técnico.",
        },
      ],
    },
    {
      id: 4,
      title: "Uso de la Información",
      content:
        "Toda la información recopilada se utiliza exclusivamente para fines laborales, operativos y de seguridad del patrimonio de la empresa:",
      subSections: [
        {
          id: "4.1",
          title: "Gestión Operativa",
          content:
            "Facilitar la reserva, asignación y control de disponibilidad de los vehículos de la flota corporativa de manera eficiente.",
        },
        {
          id: "4.2",
          title: "Mantenimiento y Seguridad",
          content:
            "Gestionar el historial de mantenimientos, programar services, registrar el estado de las unidades y documentar daños para accionar con aseguradoras o talleres mecánicos.",
        },
        {
          id: "4.3",
          title: "Auditoría y Cumplimiento",
          content:
            "Mantener un registro interno auditable sobre el uso de los activos de la empresa, asegurar el cumplimiento de las normativas de tránsito exigidas (VTV, seguros vigentes) y proteger el patrimonio de ACA.",
        },
        {
          id: "4.4",
          title: "Soporte Técnico",
          content:
            "Garantizar el correcto funcionamiento de la Plataforma, implementar mejoras y asistir al colaborador ante eventuales fallas del sistema.",
        },
      ],
    },
    {
      id: 5,
      title: "Compartir Información",
      content:
        "Al ser una herramienta corporativa, la información generada es de uso interno. ACA no vende ni alquila datos a terceros. Solo compartiremos la información en las siguientes circunstancias:",
      subSections: [
        {
          id: "5.1",
          title: "Áreas Internas de ACA",
          content:
            "La información operativa fluye entre los departamentos pertinentes de la empresa (Ej: Logística, Recursos Humanos, Mantenimiento, Legales) para la correcta administración de la flota.",
        },
        {
          id: "5.2",
          title: "Proveedores de Servicios Estratégicos",
          content:
            "Podemos compartir recortes específicos de información (ej. patentes, reportes de daños, historial de services) con terceros vinculados a la operatoria, como talleres mecánicos autorizados, compañías de seguros o proveedores de hosting y bases de datos. Estos terceros están sujetos a estrictos acuerdos de confidencialidad.",
        },
        {
          id: "5.3",
          title: "Cumplimiento Legal",
          content:
            "Divulgaremos información si es requerido por una orden judicial, para cumplir con normativas de autoridades de transporte (ej. CNRT), para investigar irregularidades o siniestros, o para proteger los derechos y bienes de la empresa.",
        },
      ],
    },
    {
      id: 6,
      title: "Seguridad de la Información",
      content:
        "Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para proteger la información operativa y los datos de los colaboradores contra acceso no autorizado, alteración o destrucción. Esto incluye encriptación de datos en tránsito, controles de acceso estrictos basados en roles, firewalls y monitoreo de vulnerabilidades. Dado que ningún sistema es 100% infalible, exigimos a los colaboradores mantener la confidencialidad de sus credenciales de acceso.",
    },
    {
      id: 7,
      title: "Retención de Datos",
      content:
        "La información generada en la Plataforma (registros de uso de vehículos, reportes de daños, inspecciones) forma parte del registro histórico y operativo de la empresa. Estos datos se conservarán durante el tiempo que el colaborador mantenga su vínculo con ACA y, posteriormente, durante el período que exijan las leyes laborales, normativas de transporte, requerimientos de compañías de seguros o políticas de auditoría interna, incluso si el colaborador deja de utilizar la Plataforma o finaliza su relación laboral.",
    },
    {
      id: 8,
      title: "Derechos de los Colaboradores",
      content:
        "De acuerdo con la legislación vigente, los colaboradores tienen derecho a:",
      subSections: [
        {
          id: "8.1",
          title: "Acceso y Rectificación",
          content:
            "Solicitar acceso a sus datos personales almacenados en el sistema y requerir la corrección de información inexacta (por ejemplo, actualización de datos de contacto o número de licencia).",
        },
        {
          id: "8.2",
          title: "Limitaciones a la Eliminación",
          content:
            "Si bien el titular de los datos tiene derecho a solicitar la eliminación de su información personal, en el contexto de esta Plataforma corporativa, ciertas solicitudes de borrado podrán ser denegadas si la retención de los datos es necesaria para cumplir con obligaciones legales, auditorías internas de activos o resolución de siniestros vehiculares.",
        },
      ],
    },
    {
      id: 9,
      title: "Transferencias Internacionales de Datos",
      content:
        "Los servidores que alojan la Plataforma pueden encontrarse, o requerir procesamiento de datos, en países fuera de Argentina. Al utilizar la aplicación, los colaboradores consienten esta transferencia. ACA garantiza que cualquier transferencia internacional se realizará bajo salvaguardas adecuadas, como acuerdos basados en cláusulas contractuales estándar o certificaciones internacionales de seguridad aplicables.",
    },
    {
      id: 10,
      title: "Cambios a esta Política",
      content:
        "Nos reservamos el derecho de modificar esta Política de Privacidad corporativa. Las actualizaciones serán notificadas a los colaboradores mediante un aviso en la Plataforma, por correo electrónico corporativo o a través de los canales de comunicación interna de ACA. El uso continuado de la aplicación constituirá la aceptación de dichas modificaciones.",
    },
    {
      id: 11,
      title: "Cumplimiento Normativo",
      content:
        "ACA se compromete a cumplir con todas las leyes aplicables en materia de protección de datos, incluyendo la Ley de Protección de los Datos Personales (Ley 25.326) de la República Argentina y sus normativas complementarias.",
    },
    {
      id: 12,
      title: "Contacto y Autoridad de Control",
      content:
        "Para consultas, inquietudes o solicitudes sobre el tratamiento de sus datos en la Plataforma, el colaborador puede contactarse con:",
    },
  ],

  companyContact: {
    name: "Asociación de Cooperativas Argentinas Cooperativa Limitada",
    attention: "Oficial de Privacidad / Área de Logística",
    address: "Av. Eduardo Madero 942, 7º Piso",
    phone: "+54 11 4310-1300",
    email: "info@girologistica.com.ar",
  },

  authorityContact: {
    address: "Av. Pte. Julio A. Roca 710, Piso 2°, Ciudad de Buenos Aires",
    phone: "(5411) 2821-0047",
    email: "info@aaip.gob.ar",
    web: "https://www.argentina.gob.ar/aaip",
  },
};
