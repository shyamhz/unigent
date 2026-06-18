import { SignUp } from "@clerk/nextjs";
import { clerkAuthUrls } from "@/lib/clerk-env";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path={clerkAuthUrls.signUp}
        signInUrl={clerkAuthUrls.signIn}
        fallbackRedirectUrl={clerkAuthUrls.signUpFallbackRedirect}
      />
    </div>
  );
}
