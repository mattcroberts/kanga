import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export type Product = {
	productId: string;
	title: string;
	description: string;
	price: number;
	imageUrl: string;
};

export const fetchProduct = createServerFn()
	.inputValidator((data: { productId: string }) => {
		if (typeof data?.productId !== "string" || data?.productId.length === 0) {
			throw new Error("Invalid productId");
		}
		return data.productId;
	})
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
