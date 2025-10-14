import { createClerkHandler } from "@clerk/tanstack-react-start/server";
import {
	createStartHandler,
	defaultStreamHandler,
	defineHandlerCallback,
} from "@tanstack/react-start/server";
import { createRouter } from "./router";

// const secretArn = process.env.CLERK_SECRET_ARN;
// const clerkSecretKey = process.env.CLERK_SECRET_KEY;

// export default defineHandlerCallback(async (event) => {
// 	let secret = clerkSecretKey;
// 	if (secretArn) {
// 		const clerkSecrets = await getSecret<{
// 			CLERK_SECRET_KEY: string;
// 			VITE_CLERK_PUBLISHABLE_KEY: string;
// 		}>(secretArn, {
// 			maxAge: 60,
// 			transform: "json",
// 		});

// 		secret = clerkSecrets!.CLERK_SECRET_KEY;
// 	} else if (!clerkSecretKey) {
// 		throw new Error(
// 			"CLERK_SECRET_ARN and CLERK_SECRET_KEY environment variables are not set",
// 		);
// 	}

// 	if (!secret) {
// 		throw new Error("Failed to retrieve Clerk secrets");
// 	}
// 	const handlerFactory = createClerkHandler(
// 		createStartHandler({
// 			createRouter,
// 		}),
// 		{
// 			secretKey: secret,
// 			publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
// 		},
// 	);
// 	const startHandler = await handlerFactory(defaultStreamHandler);
// 	return startHandler(event);
// });
