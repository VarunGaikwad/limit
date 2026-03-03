"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Container,
  HyperLink,
  InputField,
  UnauthCard,
} from "@/components";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Container className="bg-primary">
      <UnauthCard
        title="Welcome Back"
        subtitle="Log in to manage your budget and stay on track."
      >
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <HyperLink size="sm" variant="muted" href="/forgot-password">
              Forgot Password?
            </HyperLink>
          </div>

          <div className="space-y-4 mt-8">
            <Button
              type="submit"
              className="w-full"
              variant="primary"
              size="lg"
              isLoading={loading}
            >
              Log In
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-white px-2 text-gray-400">
                  New to Limit?
                </span>
              </div>
            </div>

            <Button
              href="/sign-up"
              className="w-full"
              variant="default"
              size="lg"
            >
              Create Free Account
            </Button>
          </div>
        </form>
      </UnauthCard>
    </Container>
  );
}
