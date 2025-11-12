import { AuthForm } from "@/components/auth/auth-form";
import { Tagline } from "@/components/auth/tagline";

export default function AuthPage() {
  return (
    <main className="min-h-svh w-full bg-[#111418] flex items-center justify-center overflow-hidden">
      <div className="flex min-h-140">
        <AuthForm />
        <Tagline />
      </div>
    </main>
  );
}


