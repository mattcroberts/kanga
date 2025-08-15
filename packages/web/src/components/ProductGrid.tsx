import { FC } from "react";
import { css } from "styled-system/css";
import { ProductGridItem } from "./ProductGridItem";
import { Product } from "~/utils/products";

export const ProductGrid: FC<{ items: Product[] }> = ({ items }) => {
  return (
    <div
      className={css({
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
      })}
    >
      {items.map((item) => (
        <ProductGridItem key={item.id} item={item} />
      ))}
    </div>
  );
};
