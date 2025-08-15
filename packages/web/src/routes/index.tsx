import { createFileRoute } from "@tanstack/react-router";
import { css } from "styled-system/css";
import { GlobalLayout } from "~/components/GlobalLayout";
import { ProductGrid } from "~/components/ProductGrid";
import { fetchProducts } from "~/utils/products";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => fetchProducts(),
  errorComponent: () => <div>Error loading products</div>,
});

function Home() {
  const products = Route.useLoaderData();
  return (
    <div>
      <ProductGrid items={products} />
    </div>
  );
}
