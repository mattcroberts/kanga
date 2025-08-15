import { Link, Outlet } from "@tanstack/react-router";
import { css } from "styled-system/css";

export const GlobalLayout = () => {
  return (
    <main>
      <Link to="/">
        <h1 className={css({ fontSize: "6xl" })}>Kanga Store</h1>
      </Link>
      <Outlet />
    </main>
  );
};
