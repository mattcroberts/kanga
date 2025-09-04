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
	console.info("Fetching products...", process.env.API_GATEWAY);
	try {
		const res = await fetch(process.env.API_GATEWAY!);

		if (!res.ok) {
			throw new Error("Failed to fetch products");
		}

		const products = (await res.json()) as Array<Product>;
		return products;
	} catch (e) {
		console.error(e);
		throw e;
	}
});
