"use client";

import Image from "next/image";
import { hasProductImage, productImageSrc } from "@/lib/product-image";

type Props = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, fill = true, className = "object-cover", sizes, priority }: Props) {
  const url = productImageSrc(src);
  if (!hasProductImage(url)) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-pearl via-mist to-clay/20 text-xs uppercase tracking-[.2em] text-ink/40 ${fill ? "absolute inset-0" : "h-full w-full"} ${className}`}>
        No image
      </div>
    );
  }
  return <Image src={url} alt={alt} fill={fill} className={className} sizes={sizes} priority={priority} unoptimized={url.startsWith("blob:") || url.startsWith("data:")} />;
}
