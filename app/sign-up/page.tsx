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

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Container className="bg-primary">
        <UnauthCard
          title="Check Your Email"
          subtitle="We've sent a confirmation link to your inbox. Please verify your account to continue."
        >
          <div className="space-y-6 mt-8 text-center">
            <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <span className="text-emerald-600 font-bold">
                Email Sent Successfully
              </span>
            </div>
            <Button
              href="/login"
              variant="primary"
              className="w-full"
              size="lg"
            >
              Return to Login
            </Button>
          </div>
        </UnauthCard>
      </Container>
    );
  }

  return (
    <Container className="bg-primary">
      <UnauthCard
        title="Create Account"
        subtitle="Join Limit and start mastering your personal finances today."
      >
        <form onSubmit={handleSignUp} className="space-y-4">
          <InputField
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <InputField
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error && (
            <p className="text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}

          <div className="space-y-6 mt-8">
            <p className="text-center text-[10px] sm:text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to our{" "}
              <HyperLink
                size="sm"
                href="/terms"
                className="inline decoration-gray-300"
              >
                Terms of Use
              </HyperLink>{" "}
              and{" "}
              <HyperLink
                size="sm"
                href="/privacy"
                className="inline decoration-gray-300"
              >
                Privacy Policy
              </HyperLink>
              .
            </p>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full"
              isLoading={loading}
            >
              Create Account
            </Button>

            <div className="flex justify-center text-sm">
              <span className="text-gray-600">
                Already have an account?{" "}
                <HyperLink href="/login" className="font-bold">
                  Log In
                </HyperLink>
              </span>
            </div>
          </div>
        </form>
      </UnauthCard>
    </Container>
  );
}
