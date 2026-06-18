import { SignIn } from "@clerk/nextjs";
import { clerkAuthUrls } from "@/lib/clerk-env";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectUrl =
    typeof params.redirect_url === "string"
      ? params.redirect_url
      : clerkAuthUrls.signInFallbackRedirect;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path={clerkAuthUrls.signIn}
        signUpUrl={clerkAuthUrls.signUp}
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}
