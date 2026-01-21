import { Grid } from "@radix-ui/themes";
import type { FC } from "react";
import type { Product } from "~/utils/products";
import { ProductGridItem } from "./ProductGridItem";

export const ProductGrid: FC<{ items: Product[] }> = ({ items }) => {
	return (
		<Grid
			columns={"repeat(auto-fill, minmax(300px, 1fr))"}
			gap="3"
			width="auto"
			mx="6"
		>
			{items.map((item) => (
				<ProductGridItem key={item.productId} item={item} />
			))}
		</Grid>
	);
};
