"use client";
import { Button, Container } from "@/components";
import { Landmark, ArrowRight, ShieldCheck, Zap, PieChart } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        redirect("/dashboard");
      }
      setLoading(false);
    }
    checkUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <Container className="bg-snow">
      <div className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-24 flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="flex-1 space-y-10 text-center lg:text-left animate-in fade-in slide-in-from-left duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-sm tracking-wide uppercase">
            <Zap size={16} fill="currentColor" />
            Join 10,000+ users saving more
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9]">
              Master <br />
              <span className="text-primary italic">Every Penny.</span>
            </h1>
            <p className="text-gray-500 text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              The simplest, fastest way to track your expenses and build a
              future of financial freedom.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              variant="primary"
              size="lg"
              href="/login"
              className="px-10 py-5 text-xl group shadow-2xl shadow-primary/30"
            >
              Log In Now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="default"
              size="lg"
              href="/sign-up"
              className="px-10 py-5 text-xl bg-gray-50 border border-gray-200"
            >
              Sign Up Free
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100 max-w-md mx-auto lg:mx-0">
            <div className="flex flex-col items-center lg:items-start gap-1">
              <ShieldCheck className="text-primary mb-1" size={24} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Secure
              </span>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-1">
              <PieChart className="text-primary mb-1" size={24} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Visual
              </span>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-1 text-primary italic font-serif text-xl">
              Limitless.
            </div>
          </div>
        </div>
        <div className="flex-1 relative w-full max-w-125 lg:max-w-none flex justify-center items-center animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="relative">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 size-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 size-48 bg-primary/10 rounded-full blur-2xl animate-pulse delay-500" />

            {/* Main Branding Card */}
            <div className="relative bg-snow p-12 lg:p-20 rounded-[3rem] shadow-[-20px_20px_60px_rgba(0,0,0,0.05),20px_-20px_60px_rgba(255,255,255,0.8)] border border-gray-50 flex flex-col items-center gap-8 transform rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default">
              <div className="p-8 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/40">
                <Landmark className="size-24 text-white" />
              </div>
              <div className="text-center">
                <span className="block font-black text-6xl text-primary tracking-tighter">
                  LIMIT
                </span>
                <span className="block text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
                  Personal Finance
                </span>
              </div>
            </div>

            {/* Floating mini cards for desktop feel */}
            <div className="absolute -right-12 top-10 bg-snow p-4 rounded-2xl shadow-xl border border-gray-50 hidden md:flex items-center gap-3 animate-bounce-subtle">
              <div className="size-10 bg-green-100 rounded-full grid place-content-center text-green-600">
                <Zap size={20} />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">
                  Saving
                </div>
                <div className="font-bold text-sm">+$1,240.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
