import { Card, Heading, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { css } from "styled-system/css";
import type { Product } from "~/utils/products";

export const ProductGridItem: FC<{ item: Product }> = ({ item }) => {
	return (
		<Link
			className={css({})}
			to={`/item/$productId`}
			params={{ productId: item.id }}
		>
			<Card variant="surface" size="1">
				<Heading>{item.title}</Heading>
				<Text>{item.description}</Text>
				<Text>${item.price}</Text>
				<img src="https://placehold.co/150x150/EEE/31343C" alt="Product" />
			</Card>
		</Link>
	);
};
