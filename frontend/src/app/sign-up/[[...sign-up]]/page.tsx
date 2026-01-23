import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

const SignUpPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create an account
          </h1>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6 backdrop-blur-sm">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/"
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?
          <Link
            href="/sign-in"
            className="font-medium text-foreground hover:text-primary/90 ml-0.5"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
