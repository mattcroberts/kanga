import { getSecret } from "@aws-lambda-powertools/parameters/secrets";
// import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createStart } from "@tanstack/react-start";

const secretArn = process.env.CLERK_SECRET_ARN;
const clerkSecretKeyFromEnv = process.env.CLERK_SECRET_KEY;
let clerkSecretKey: string | undefined = clerkSecretKeyFromEnv;

if (secretArn && !clerkSecretKey) {
	const secretFromAws = await getSecret<{
		CLERK_SECRET_KEY: string;
		VITE_CLERK_PUBLISHABLE_KEY: string;
	}>(secretArn, {
		maxAge: 60,
		transform: "json",
	});

	clerkSecretKey = secretFromAws!.CLERK_SECRET_KEY;
}

export const startInstance = createStart(async () => {
	return {
		requestMiddleware: [
			// clerkMiddleware({
			// 	secretKey: clerkSecretKey,
			// 	publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
			// }),
		],
	};
});
