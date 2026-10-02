import { ProfileForm } from "@/components/ProfileForm";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-12">
        <p className="font-sans text-xs uppercase tracking-[0.24em] text-muted">
          Account
        </p>
        <h1 className="mt-2 text-4xl">Profile</h1>
        <p className="mt-3 font-sans text-sm leading-6 text-muted">
          Change the name and email saved on your account.
        </p>
        <Card className="mt-8 p-6">
          <ProfileForm />
        </Card>
      </main>
    </div>
  );
}
