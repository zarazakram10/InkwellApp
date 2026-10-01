import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-8 text-2xl tracking-tight">
        Folio
      </Link>
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl">Welcome to the desk</h1>
        <p className="mt-2 text-muted">
          Sign in or create an account to keep your documents and notes.
        </p>
        <div className="mt-6">
          <AuthForm />
        </div>
      </Card>
    </div>
  );
}
