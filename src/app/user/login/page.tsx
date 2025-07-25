"use client";
import React, { useState, useEffect } from "react";
import { signIn, getSession, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user just created an organization and is already authenticated
  useEffect(() => {
    const justCreatedOrganization = localStorage.getItem('justCreatedOrganization');
    
    console.log('Login page - Session status:', status);
    console.log('Login page - Session user:', session?.user);
    console.log('Login page - Just created organization flag:', justCreatedOrganization);
    
    if (justCreatedOrganization === 'true' && status === 'authenticated' && session?.user?.organization) {
      console.log('User just created organization and is authenticated, redirecting to home');
      localStorage.removeItem('justCreatedOrganization'); // Clean up
      router.push('/home');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log("Attempting sign in for:", email);
      
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log("SignIn result:", result);
      
      if (result?.error) {
        setError(result.error);
        console.error("Login error:", result.error);
        setIsLoading(false);
        return;
      }
      
      // Wait a moment to ensure the session is properly established
      setTimeout(async () => {
        const session = await getSession();
        console.log("Session after login:", session);
        
        if (!session || !session.accessToken) {
          setError("Failed to establish session. Please try again.");
          setIsLoading(false);
          return;
        }
        
        // Check if user has an organization
        if (session.user?.organization) {
          console.log("User has organization, redirecting to home");
          router.push("/home");
        } else {
          console.log("User authenticated but no organization, redirecting to onboarding");
          router.push("/onboarding");
        }
      }, 500);
      
    } catch (err) {
      console.error("Login exception:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 bg-white">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Image
              className="h-10 w-auto"
              src="/carrot_logo.png"
              alt="Your Company"
              width={120}
              height={120}
            />
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Not a member?{" "}
              <Link
                href="/user/register"
                className="font-semibold text-orange-600 hover:text-indigo-500"
              >
                Create a free account now
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset text-inherit ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-text-color pl-2"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-text-color pl-2"
                  />
                </div>

                {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm leading-6 text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm leading-6">
                  <a
                    href="#"
                    className="font-semibold text-orange-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/carrot_background.jpeg"
          alt=""
          width={1000}
          height={1000}
        />
      </div>
    </div>
  );
};

export default Login;
