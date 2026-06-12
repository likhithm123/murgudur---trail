import CommerceApp from "@/components/commerce-app";
import { products } from "@/lib/store";

export const revalidate = 300;

export default function Page() {
  return <CommerceApp initialProducts={products} />;
}
