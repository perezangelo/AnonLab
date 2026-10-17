
var klaroConfig = {
  elementID: "klaro",
  storageMethod: "cookie",
  storageName: "anonlab-consent",
  cookieDomain: "anonlab.it",
  cookieExpiresAfterDays: 180,

  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  noticeAsModal: false,

  lang: "it",

  translations: {
    it: {
      consentNotice: {
        description:
          "AnonLab utilizza servizi tecnici e, con il tuo consenso, servizi di statistica e pubblicità. Puoi accettare, rifiutare o personalizzare le tue preferenze."
      },
      consentModal: {
        title: "Preferenze sulla privacy",
        description:
          "Scegli quali servizi autorizzare. Puoi modificare la tua scelta in qualsiasi momento."
      },
      acceptAll: "Accetta tutti",
      acceptSelected: "Salva le preferenze",
      decline: "Rifiuta",
      close: "Chiudi",
      privacyPolicy: {
        name: "informativa sulla privacy",
        text: "Consulta la nostra {privacyPolicy}."
      },
      purposes: {
        necessary: {
          title: "Tecnici necessari",
          description:
            "Servizi indispensabili per il funzionamento del sito."
        },
        analytics: {
          title: "Statistiche",
          description:
            "Misurazione delle visite e analisi dell'utilizzo del sito."
        },
        marketing: {
          title: "Pubblicità",
          description:
            "Servizi pubblicitari e tecnologie di marketing."
        },
        external: {
          title: "Contenuti esterni",
          description:
            "Contenuti incorporati forniti da servizi esterni."
        }
      }
    }
  },

  services: [
    {
      name: "necessary",
      title: "Servizi tecnici necessari",
      purposes: ["necessary"],
      required: true,
      default: true,
      optOut: false,
      onlyOnce: true
    },
    {
      name: "clarity",
      title: "Microsoft Clarity",
      purposes: ["analytics"],
      required: false,
      default: false
    },
    {
      name: "adsense",
      title: "Google AdSense",
      purposes: ["marketing"],
      required: false,
      default: false
    },
    {
      name: "youtube",
      title: "Video YouTube",
      purposes: ["external"],
      required: false,
      default: false,
      contextualConsentOnly: true
    }
  ]
};
