import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { Button, Flex, Theme } from "@radix-ui/themes";
import { Link, Outlet } from "@tanstack/react-router";
import { css } from "styled-system/css";

export const GlobalLayout = () => {
	return (
		<Theme appearance="dark">
			<main>
				<Flex justify="between">
					<Link to="/">
						<h1 className={css({ fontSize: "6xl" })}>Kanga Store</h1>
					</Link>
					<Flex direction="column" align="end">
						<SignedIn>
							<p>You are signed in</p>
							<UserButton />
						</SignedIn>
						<SignedOut>
							<p>You are signed out</p>
							<SignInButton>
								<Button>Sign In</Button>
							</SignInButton>
						</SignedOut>
					</Flex>
				</Flex>
				<Outlet />
			</main>
		</Theme>
	);
};
