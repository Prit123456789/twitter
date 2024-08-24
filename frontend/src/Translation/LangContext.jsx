import React from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import "../App";

const I18nContext = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <App />
      {children}
    </I18nextProvider>
  );
};

export default I18nContext;
