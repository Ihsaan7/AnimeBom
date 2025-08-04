"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);

  // Shared form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignIn(false);
    } else {
      setIsSignIn(true);
    }
    setError("");
    setSuccess("");
    setLoading(false);
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
  }, [searchParams]);

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setError("");
    setSuccess("");
    setLoading(false);
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
  };

  // Handle sign up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Check your email to confirm your account!");
      setName("");
      setEmail("");
      setPassword("");
      setConfirm("");
    }
  };

  // Handle sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Signed in successfully!");
      // Redirect to home/dashboard after sign in
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 p-4">
      <div className="flex w-full max-w-6xl h-[760px] rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Image Section - Slides left/right based on mode */}
        <div 
          className={`hidden md:flex w-1/2 items-center justify-center relative bg-neutral-900 transition-transform duration-700 ease-in-out ${
            isSignIn ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
            alt="Community"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
            style={{ filter: 'blur(2px)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent flex flex-col items-center justify-center p-8 z-10">
            <h2 className="text-4xl font-extrabold text-white mb-2 text-center drop-shadow transition-opacity duration-500">
              {isSignIn ? "Welcome Back!" : "Join Our Community"}
            </h2>
            <p className="text-lg text-violet-200 text-center font-medium drop-shadow transition-opacity duration-500">
              {isSignIn 
                ? "Sign in to access your account and continue your journey with us."
                : "Create an account to get started and explore all our features."
              }
            </p>
          </div>
        </div>

        {/* Form Section - Slides right/left based on mode (desktop only) */}
        <div 
          className={`flex flex-col w-full md:w-1/2 bg-neutral-900 md:transition-transform md:duration-700 md:ease-in-out ${
            isSignIn ? 'md:translate-x-0' : 'md:-translate-x-full'
          }`}
        >
          <div className="flex-1 flex flex-col justify-center px-8 md:px-10 py-8 md:py-5">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 transition-all duration-500">
              {isSignIn ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-zinc-300 mb-6 md:mb-8 text-sm md:text-base transition-all duration-500">
              {isSignIn 
                ? "Enter your credentials to access your account"
                : "Sign up to get started with your new account"
              }
            </p>
            {/* Show error or success */}
            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
            {success && <div className="mb-4 text-green-500 text-sm">{success}</div>}
            <form className="space-y-4" onSubmit={isSignIn ? handleSignIn : handleSignUp}>
              {!isSignIn && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="name" className="text-zinc-200 text-sm">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="mt-1 h-11 md:h-12 text-sm md:text-base bg-neutral-800 border border-neutral-700 placeholder-zinc-400 text-white" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email" className="text-zinc-200 text-sm">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  className="mt-1 h-11 md:h-12 text-sm md:text-base bg-neutral-800 border border-neutral-700 placeholder-zinc-400 text-white" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-200 text-sm">Password</Label>
                  {isSignIn && (
                    <a href="#" className="text-violet-400 text-xs md:text-sm font-medium hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="********" 
                  className="mt-1 h-11 md:h-12 text-sm md:text-base bg-neutral-800 border border-neutral-700 placeholder-zinc-400 text-white" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {!isSignIn && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="confirm" className="text-zinc-200 text-sm">Confirm Password</Label>
                  <Input 
                    id="confirm" 
                    type="password" 
                    placeholder="********" 
                    className="mt-1 h-11 md:h-12 text-sm md:text-base bg-neutral-800 border border-neutral-700 placeholder-zinc-400 text-white" 
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              <div className="flex items-start space-x-2">
                <Checkbox 
                  className="bg-neutral-800 border border-neutral-700 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 mt-1" 
                  id={isSignIn ? "remember" : "terms"} 
                  disabled={loading}
                />
                <label htmlFor={isSignIn ? "remember" : "terms"} className="text-zinc-300 text-xs md:text-sm leading-relaxed">
                  {isSignIn ? "Remember me" : (
                    <>
                      I agree to the <a href="#" className="text-violet-400 underline">Terms of Service</a> and <a href="#" className="text-violet-400 underline">Privacy Policy</a>
                    </>
                  )}
                </label>
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold mt-2 h-11 md:h-12 text-sm md:text-base" disabled={loading}>
                {loading ? (isSignIn ? "Signing In..." : "Creating Account...") : (isSignIn ? "Sign In" : "Create Account")}
              </Button>
            </form>
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-neutral-700" />
              <span className="mx-2 text-zinc-400 text-xs md:text-sm">
                Or continue with
              </span>
              <div className="flex-grow h-px bg-neutral-700" />
            </div>
            <div className="flex gap-3 md:gap-4">
              <Button variant="outline" className="flex-1 border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 text-xs md:text-sm h-10 md:h-11">
                Google
              </Button>
              <Button variant="outline" className="flex-1 border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 text-xs md:text-sm h-10 md:h-11">
                Facebook
              </Button>
            </div>
            <p className="mt-6 text-zinc-400 text-center text-xs md:text-sm">
              {isSignIn ? (
                <>
                  Don't have an account?{" "}
                  <button 
                    onClick={toggleMode}
                    className="text-violet-400 underline font-medium hover:text-violet-300 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button 
                    onClick={toggleMode}
                    className="text-violet-400 underline font-medium hover:text-violet-300 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div></div>}>
      <AuthForm />
    </Suspense>
  );
}
