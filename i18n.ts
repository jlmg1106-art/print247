import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      landing: {
        // HOME (index.tsx)
        title: 'Printing24/7',
        subtitle: 'The Uber of Printing',
        available247: 'Available 24/7',
        expressService: 'Express Service',

        globalLocations: 'Global Locations',
        globalLocationsDesc: 'Find printing near you anywhere.',
        qualityGuaranteed: 'Quality Guaranteed',
        qualityGuaranteedDesc: 'Verified receptors and standards.',
        immediateDelivery: 'Immediate Delivery',
        immediateDeliveryDesc: 'Same-day options when available.',

        getStarted: 'Get Started',
        startPrinting: 'Start Printing',
        startPrintingDesc: 'Upload files and choose service.',
        becomeReceptor: 'Become a Receptor',
        becomeReceptorDesc: 'Join the network and earn.',

        acceptedFormats: 'Accepted formats',
        formats: 'PDF • DOC • DOCX • JPG • PNG • TIFF • PSD',
        maxFiles: 'Max 5 files per order',

        myOrders: 'My Orders',
        myOrdersDesc: 'View saved',
        trackOrder: 'Track',
        trackOrderDesc: 'Search by ID',

        // SELECT-ORDER-TYPE (select-order-type.tsx)
        whatToPrint: 'What do you want to print?',
        selectServiceType: 'Choose the service you need',
        documents: 'Documents',
        documentsDesc: 'PDF, Word, Excel and more',
        photos: 'Photos',
        photosDesc: 'JPG, PNG, TIFF and more',
        posters: 'Large Format',
        postersDesc: 'Banners, posters, and architectural blueprints.',
      },

      userInfo: {
        title: 'User Information',
        subtitle: 'We need your details to process your order',
        fullName: 'Full Name',
        fullNamePlaceholder: 'Enter your full name',
        phone: 'Phone',
        phonePlaceholder: '+1 (555) 123-4567',
        email: 'Email',
        emailPlaceholder: 'example@email.com',
        continue: 'Continue',
      },

      location: {
        title: 'Select a location',
        subtitle: 'Choose the receptor / branch where you will print',
        searchPlaceholder: 'Search city, address, or country',
        nearMe: 'Near me',
        open247: 'Open 24/7',
        openNow: 'Open now',
        closed: 'Closed',
        eta: 'ETA',
        minutes: 'min',
        select: 'Select',
        continue: 'Continue',
        noResults: 'No locations found',
      },
    },
  },

  es: {
    translation: {
      landing: {
        // HOME (index.tsx)
        title: 'Printing24/7',
        subtitle: 'El Uber de la Impresión',
        available247: 'Disponible 24/7',
        expressService: 'Servicio Express',

        globalLocations: 'Ubicaciones Globales',
        globalLocationsDesc: 'Encuentra impresión cerca de ti.',
        qualityGuaranteed: 'Calidad Garantizada',
        qualityGuaranteedDesc: 'Receptores verificados y estándares.',
        immediateDelivery: 'Entrega Inmediata',
        immediateDeliveryDesc: 'Opciones el mismo día si aplica.',

        getStarted: 'Empezar',
        startPrinting: 'Imprimir Ahora',
        startPrintingDesc: 'Sube archivos y elige servicio.',
        becomeReceptor: 'Conviértete en Receptor',
        becomeReceptorDesc: 'Únete a la red y gana.',

        acceptedFormats: 'Formatos aceptados',
        formats: 'PDF • DOC • DOCX • JPG • PNG • TIFF • PSD',
        maxFiles: 'Máximo 5 archivos por pedido',

        myOrders: 'Mis pedidos',
        myOrdersDesc: 'Ver guardados',
        trackOrder: 'Rastrear',
        trackOrderDesc: 'Buscar por ID',

        // SELECT-ORDER-TYPE (select-order-type.tsx)
        whatToPrint: '¿Qué deseas imprimir?',
        selectServiceType: 'Elige el servicio que necesitas',
        documents: 'Documentos',
        documentsDesc: 'PDF, Word, Excel y más',
        photos: 'Fotografías',
        photosDesc: 'JPG, PNG, TIFF y más',
        posters: 'Gran Formato',
        postersDesc: 'Banners, pósters y planos arquitectónicos',
      },

      userInfo: {
        title: 'Información de Usuario',
        subtitle: 'Necesitamos tus datos para procesar tu pedido',
        fullName: 'Nombre Completo',
        fullNamePlaceholder: 'Ingrese su nombre completo',
        phone: 'Teléfono',
        phonePlaceholder: '+1 (555) 123-4567',
        email: 'Correo Electrónico',
        emailPlaceholder: 'ejemplo@correo.com',
        continue: 'Continuar',
      },

      location: {
        title: 'Seleccionar sede',
        subtitle: 'Elige el receptor / sucursal donde imprimirás',
        searchPlaceholder: 'Buscar ciudad, dirección o país',
        nearMe: 'Cerca de mí',
        open247: 'Abierto 24/7',
        openNow: 'Abierto ahora',
        closed: 'Cerrado',
        eta: 'Tiempo',
        minutes: 'min',
        select: 'Seleccionar',
        continue: 'Continuar',
        noResults: 'No se encontraron sedes',
      },
    },
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'es',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
      returnNull: false,
      returnEmptyString: false,
    });
}

export default i18n;
