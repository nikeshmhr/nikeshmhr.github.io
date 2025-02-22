import { type Lang, useTranslations } from "@/utils/i18n";
import BaseTag from "./base-tag";

export default function LicenseTag({
  lang,
  license,
  link,
}: {
  lang: Lang;
  license: string;
  link: string;
}) {
  const t = useTranslations(lang);
  return (
    <a href={link} target="_blank" rel="noreferrer nofollow">
      <BaseTag hoverable>
        <span className="text-dracula-cyan">{t("post.license")}</span>{" "}
        <span>{license}</span>
      </BaseTag>
    </a>
  );
}
