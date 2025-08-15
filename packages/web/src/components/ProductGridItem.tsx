import { Link } from "@tanstack/react-router";
import { FC } from "react";
import { css } from "styled-system/css";
import { Product } from "~/utils/products";

export const ProductGridItem: FC<{ item: Product }> = ({ item }) => {
  return (
    <Link
      className={css({})}
      to={`/item/$productId`}
      params={{ productId: item.id }}
    >
      <h2>{item.title}</h2>
      <p>{item.description}</p>
      <span>{item.price}</span>
      <img src="https://placehold.co/150x150/EEE/31343C" alt="Product Image" />
    </Link>
  );
};
