import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string }>;
}) {
  const { flow } = await searchParams;
  const initialFlow = flow === "signUp" ? "signUp" : "signIn";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-8 text-2xl tracking-tight">
        Inkwell
      </Link>
      <Card className="w-full max-w-md p-8">
        <AuthForm initialFlow={initialFlow} />
      </Card>
    </div>
  );
}
