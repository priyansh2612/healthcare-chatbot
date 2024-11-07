"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Sun, Moon, ChevronRight, Heart, Mail, Lock, User, Check, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { LoadingButton } from "@/components/LoadingButton";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";
import Link from "next/link";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const passwordStrength = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong) {
      toast.error("Please ensure your password meets all the requirements.", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://10.145.11.133:5001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        dispatch(setUser({ username, email, token: data.access_token, isAuthenticated: true }));
        toast.success("Signup successful! Welcome to Sanjeevani.", {
          position: "top-center",
          autoClose: 3000,
        });
        setTimeout(() => {
          router.push("/getstarted");
        }, 1500);
      } else {
        throw new Error(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred. Please try again later.", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validateUsername = (username: string) => {
    const re = /^[a-zA-Z0-9_]{8,20}$/;
    return re.test(username);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground transition-colors duration-300">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="lg:w-1/2 relative bg-primary p-8 lg:p-12 slide-in-left">
        <div className="h-full flex flex-col justify-between">
          <div className="text-primary-foreground">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 flex items-center">
              <Heart className="mr-4 h-10 w-10 lg:h-16 lg:w-16" />
              Sanjeevani
            </h1>
            <p className="text-xl lg:text-3xl mb-8 fade-in">
              Your AI-powered medical assistant
            </p>
          </div>
          <div className="hidden md:block space-y-4 text-lg lg:text-xl text-primary-foreground fade-in">
            <p>
              Join Sanjeevani today and get personalized health recommendations,
              connect with healthcare professionals, and take control of your
              well-being.
            </p>
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 slide-in-right">
        <div className="w-full max-w-md">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary">
              Sign Up
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </header>
          <Card className="border-2 border-primary/20 shadow-xl transition-all duration-300">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Create an account
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Enter your details to sign up for Sanjeevani
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                      aria-invalid={!validateUsername(username)}
                      aria-describedby="username-error"
                    />
                  </div>
                  {username && !validateUsername(username) && (
                    <p id="username-error" className="text-sm text-red-500">
                      Username must be 8-20 characters long and can only contain letters, numbers, and underscores.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                      aria-invalid={!validateEmail(email)}
                      aria-describedby="email-error"
                    />
                  </div>
                  {email && !validateEmail(email) && (
                    <p id="email-error" className="text-sm text-red-500">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                      aria-describedby="password-requirements"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Password must contain:</p>
                  <ul className="space-y-1" id="password-requirements">
                    {Object.entries(passwordStrength).map(([key, value]) => (
                      <li key={key} className="flex items-center">
                        {value ? (
                          <Check className="text-green-500 mr-2" size={16} />
                        ) : (
                          <X className="text-red-500 mr-2" size={16} />
                        )}
                        {key === 'minLength' ? '8+ characters' :
                         key === 'hasUppercase' ? 'Uppercase letter' :
                         key === 'hasLowercase' ? 'Lowercase letter' :
                         key === 'hasNumber' ? 'Number' :
                         'Special character'}
                      </li>
                    ))}
                  </ul>
                </div>
                <LoadingButton
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
                  isLoading={isLoading}
                  disabled={!isPasswordStrong || !validateEmail(email) || !validateUsername(username)}
                >
                  {isLoading ? "Signing up..." : "Sign up"}
                  {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
                </LoadingButton>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium transition-colors duration-200"
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
        <footer className="mt-8 text-center text-muted-foreground">
          <p className="text-sm">© 2023 Sanjeevani. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}