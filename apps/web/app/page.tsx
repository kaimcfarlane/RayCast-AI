"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600 dark:border-zinc-600 dark:border-t-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          RayCast AI
        </h1>
        <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
          Intelligent video analysis powered by AI
        </p>

        {user ? (
          <div className="mt-10 space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {(user.displayName?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {user.displayName ?? "User"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 sm:w-auto"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex h-12 w-full items-center justify-center rounded-lg border border-zinc-300 px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:w-auto"
            >
              Create account
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
