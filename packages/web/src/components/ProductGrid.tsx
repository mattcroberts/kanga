import { Grid } from "@radix-ui/themes";
import { FC } from "react";
import { Product } from "~/utils/products";
import { ProductGridItem } from "./ProductGridItem";

export const ProductGrid: FC<{ items: Product[] }> = ({ items }) => {
  return (
    <Grid
      columns={"repeat(auto-fill, minmax(300px, 1fr))"}
      gap="3"
      width="auto"
    >
      {items.map((item) => (
        <ProductGridItem key={item.id} item={item} />
      ))}
    </Grid>
  );
};
