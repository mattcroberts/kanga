import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { fetchProduct } from "~/utils/products";

export const Route = createFileRoute("/item/$productId")({
	component: RouteComponent,
	loader: async ({ params }) => {
		return fetchProduct({ data: params });
	},
	errorComponent: () => <div>Error loading product details</div>,
});

type BuyProductInput = {
	productId: string;
};

const buyProductFn = createServerFn({
	method: "POST",
})
	.inputValidator((data: any) => {
		if (typeof data?.productId !== "string" || data?.productId.length === 0) {
			throw new Error("Invalid productId");
		}
		return data as BuyProductInput;
	})
	.handler(({ data }) => {
		console.log(`Purchasing product with ID: ${data.productId}`);
		return { success: true };
	});

function RouteComponent() {
	const item = Route.useLoaderData();

	const buyProduct = useMutation({
		mutationFn: buyProductFn,
	});

	if (!item) {
		return <div>Product not found</div>;
	}

	return (
		<Flex direction="column" gap="1" align="center">
			<Flex direction="column" gap="1" align="start">
				<Heading>{item.title}</Heading>
				<Text>{item.description}</Text>
				<Text>${item.price}</Text>
				<Flex>
					<img src="https://placehold.co/300x300/EEE/31343C" alt="Product" />
				</Flex>

				<Button
					loading={buyProduct.isPending}
					onClick={() => {
						buyProduct.mutate({
							data: {
								productId: item.id,
							},
						});
					}}
				>
					Add to Cart
				</Button>
			</Flex>
		</Flex>
	);
}
