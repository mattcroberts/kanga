import { getSecret } from "@aws-lambda-powertools/parameters/secrets";
import { createClerkHandler } from "@clerk/tanstack-react-start/server";
import {
	createStartHandler,
	defaultStreamHandler,
	defineHandlerCallback,
} from "@tanstack/react-start/server";
import { createRouter } from "./router";

const secretArn = process.env.CLERK_SECRET_ARN;
const clerkSecretKeyFromEnv = process.env.CLERK_SECRET_KEY;

let clerkSecretKey: string | undefined;

export default defineHandlerCallback(async (event) => {
	if (!clerkSecretKey) {
		if (clerkSecretKeyFromEnv) {
			clerkSecretKey = clerkSecretKeyFromEnv;
		} else if (secretArn) {
			const secretFromAws = await getSecret<{
				CLERK_SECRET_KEY: string;
				VITE_CLERK_PUBLISHABLE_KEY: string;
			}>(secretArn, {
				maxAge: 60,
				transform: "json",
			});

			clerkSecretKey = secretFromAws!.CLERK_SECRET_KEY;
		} else {
			throw new Error(
				"CLERK_SECRET_ARN and CLERK_SECRET_KEY environment variables are not set",
			);
		}
	}

	const handlerFactory = createClerkHandler(
		createStartHandler({
			createRouter,
		}),
		{
			secretKey: clerkSecretKey,
			publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
		},
	);
	const startHandler = await handlerFactory(defaultStreamHandler);
	return startHandler(event);
});
