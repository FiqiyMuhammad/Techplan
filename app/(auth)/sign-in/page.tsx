"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await signIn.email({
       email,
       password,
    }, {
        onSuccess: () => {
             // Successful login redirect to dashboard
             router.push("/dashboard");
        },
        onError: (ctx) => {
            setError(ctx.error.message || "Failed to sign in");
            setIsLoading(false);
        }
    });
  };

  return (
    <Card className="w-full shadow-lg border-gray-200 dark:border-gray-800">
      <CardHeader className="space-y-8 pb-8">
        <div className="flex justify-center mb-4">
          <Link href="/">
            <Image 
              src="/logoku/logo1/logo-full.svg" 
              alt="TechPlan Logo" 
              width={180} 
              height={52} 
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>
        <div className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Sign in to TechPlan</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="user@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
              className="placeholder:text-gray-400/50"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/* Add Forgot Password later */}
            </div>
            <PasswordInput 
              id="password" 
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          {error && (
              <div className="text-sm font-medium text-red-500 text-center py-2 bg-red-50 dark:bg-red-900/10 rounded-md">
                  {error}
              </div>
          )}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold" disabled={isLoading || isGoogleLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-card px-2 text-gray-500 font-semibold">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-3 font-bold border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all active:scale-[0.98]" 
          disabled={isLoading || isGoogleLoading}
          onClick={async () => {
             setIsGoogleLoading(true);
             await signIn.social({
                provider: "google",
                callbackURL: "/dashboard"
             });
          }}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600 font-bold" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.38-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
          Don&apos;t have an account? 
          <Link href="/sign-up" className="ml-1 text-blue-600 hover:underline font-semibold">
              Sign Up
          </Link>
      </CardFooter>
    </Card>
  );
}
