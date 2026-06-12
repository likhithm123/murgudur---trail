export function productImageSrc(image?: string | null) {
  return image?.trim() || "";
}

export function hasProductImage(image?: string | null) {
  return Boolean(productImageSrc(image));
}
