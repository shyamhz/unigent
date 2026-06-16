import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
          <span className="text-2xl font-bold text-muted-foreground">404</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Page not found
        </h2>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
