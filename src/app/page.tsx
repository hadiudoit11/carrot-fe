"use client";
import Image from "next/image";
import Link from "next/link";
import { Rocket, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-main text-text-light flex flex-col">
      <header className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Image src="/carrot_logo.png" alt="Carrot" width={40} height={40} />
          <span className="font-primary text-xl">Cosmic Carrot</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/user/login" className="text-sm hover:underline">
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link href="/user/register">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center space-y-8">
        <h1 className="font-primary text-5xl md:text-6xl gradient">
          Build Cosmic Experiences
        </h1>
        <p className="font-secondary text-text-secondary text-lg max-w-2xl">
          Explore a collection of beautifully crafted components powered by Tailwind CSS and shadcn/ui.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/user/register">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/user/login">Sign in</Link>
          </Button>
        </div>

        <div className="grid mt-16 gap-6 md:grid-cols-3 w-full max-w-4xl">
          <div className="p-6 bg-bg-card rounded-lg shadow-accent-offset text-center space-y-3 radial-blur-accent-tl">
            <Rocket className="mx-auto text-accent" />
            <h3 className="font-primary text-xl">Fast & Responsive</h3>
            <p className="text-sm text-text-secondary">
              Optimized components for a smooth user experience.
            </p>
          </div>
          <div className="p-6 bg-bg-card rounded-lg shadow-accent-offset text-center space-y-3 radial-blur-accent-tr">
            <Palette className="mx-auto text-accent" />
            <h3 className="font-primary text-xl">Customizable</h3>
            <p className="text-sm text-text-secondary">
              Theme your application with ease using Tailwind CSS.
            </p>
          </div>
          <div className="p-6 bg-bg-card rounded-lg shadow-accent-offset text-center space-y-3 radial-blur-accent-br">
            <Sparkles className="mx-auto text-accent" />
            <h3 className="font-primary text-xl">Modern Design</h3>
            <p className="text-sm text-text-secondary">
              Built with accessibility and aesthetics in mind.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
