import { createFileRoute } from "@tanstack/react-router";
import { fetchProduct } from "~/utils/products";

export const Route = createFileRoute("/item/$productId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    return fetchProduct({ data: params.productId });
  },
  errorComponent: () => <div>Error loading product details</div>,
});

function RouteComponent() {
  const product = Route.useLoaderData();
  return <div>{product?.title}</div>;
}
