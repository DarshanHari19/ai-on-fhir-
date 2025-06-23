"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";               // ⬅️ your i18n setup (see notes)
import { ThemeProvider } from "next-themes"; // optional dark-mode toggle

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  );
}
