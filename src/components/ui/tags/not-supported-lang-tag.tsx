import { type Lang, useTranslations } from "@/utils/i18n";
import BaseTag from "./base-tag";

export default function LicenseTag({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  return (
    <BaseTag title={t("post.notSupportedLangDescription")}>
      <span className="text-dracula-red-400">{t("post.notSupportedLang")}</span>
    </BaseTag>
  );
}
