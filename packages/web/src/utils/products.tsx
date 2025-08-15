import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
};

export const fetchProduct = createServerFn()
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    return fetchProducts().then((products) => {
      const product = products.find((p) => p.id === productId);
      if (!product) {
        notFound();
      }
      return product;
    });
  });

export const fetchProducts = createServerFn().handler(async () => {
  console.info("Fetching products...");
  // const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  // if (!res.ok) {
  //   throw new Error("Failed to fetch products");
  // }

  // const posts = (await res.json()) as Array<Product>;

  // return posts.slice(0, 10);

  const products: Array<Product> = Array.from({ length: 10 }, (_, i) => ({
    id: `product-${i + 1}`,
    title: `Product ${i + 1}`,
    description: `Description for Product ${i + 1}`,
    price: (i + 1) * 10,
    imageUrl: `https://placehold.co/150x150/EEE/31343C?text=Product+${i + 1}`,
  }));

  return products;
});
