import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/* ------------------------------------------------------------------
   Very small bootstrap so the app boots without errors.
   Replace `resources` with real translations later.
------------------------------------------------------------------- */
i18n
  .use(initReactI18next)
  .init({
    lng: "en",               // default language
    fallbackLng: "en",
    resources: {
      en: {
        translation: {
          askPlaceholder : "Ask a clinical question…",
          ageAny         : "Any age",
          ageOver        : "Age over",
          ageUnder       : "Age under",
          run            : "Run",
          noMatches      : "No matching patients.",
          name           : "Name",
          age            : "Age",
          condition      : "Condition",
        },
      },
      es: {
        translation: {
          askPlaceholder : "Pregunta clínica…",
          ageAny         : "Cualquier edad",
          ageOver        : "Mayor que",
          ageUnder       : "Menor que",
          run            : "Ejecutar",
          noMatches      : "Sin pacientes coincidentes.",
          name           : "Nombre",
          age            : "Edad",
          condition      : "Condición",
        },
      },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
