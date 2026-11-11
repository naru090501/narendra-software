import {
  Code2,
  FileText,
  Image as ImageIcon,
  Monitor,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ProductCategory } from "@narendra/types";

interface CategoryIconProps {
  category: ProductCategory;
  iconUrl?: string | null;
  productName?: string;
  className?: string;
}

export function CategoryIcon({
  category,
  iconUrl,
  productName,
  className = "h-5 w-5",
}: CategoryIconProps) {
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={productName ? `${productName} icon` : "Product icon"}
        className={`${className} rounded object-contain`}
      />
    );
  }

  switch (category) {
    case "developer-toolbox":
      return <Code2 className={className} aria-hidden="true" />;
    case "document-tools":
      return <FileText className={className} aria-hidden="true" />;
    case "image-tools":
      return <ImageIcon className={className} aria-hidden="true" />;
    case "security-tools":
      return <ShieldCheck className={className} aria-hidden="true" />;
    case "ai-tools":
      return <Sparkles className={className} aria-hidden="true" />;
    case "windows-utilities":
      return <Monitor className={className} aria-hidden="true" />;
  }
}
