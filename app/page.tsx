import Link from 'next/link';
import {
  Shield,
  FileCheck,
  Wallet,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Banknote,
  Lock,
  Globe,
  Mail,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHomepageStats, formatDisbursed } from '@/app/lib/homepage-stats';
import { TestimonialSlideshow } from '@/components/home/testimonial-slideshow';
import { FAQ } from '@/components/home/faq';
import { faqItems } from '@/app/data/faq';

export default async function HomePage() {
  const stats = await getHomepageStats();
  const disbursedLabel = formatDisbursed(stats.disbursedUsd);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            StockTrendTracker
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="font-medium">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-16 dark:border-slate-800 dark:bg-slate-900 sm:px-6 md:py-24 lg:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Financial recovery platform
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              One dashboard for your recovery journey
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Track and recover funds lost in forex, crypto, or financial markets. Secure balance tracking, dedicated Bitcoin deposits, and a personal refund manager—all in one place.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 font-medium">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="font-medium">Sign in</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-slate-200 bg-slate-100/80 px-4 py-10 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6 md:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <Banknote className="h-6 w-6" />
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-4xl">
                  {disbursedLabel}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                  Disbursed to people in recovery
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <Lock className="h-6 w-6" />
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-4xl">
                  Secure & verified
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                  KYC and dedicated support
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              Three simple steps to start your recovery
            </p>
            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <FileCheck className="h-7 w-7" />
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Step 1</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Sign up & verify</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  Create your account and verify your email. Your dashboard is ready in minutes.
                </p>
              </div>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <Wallet className="h-7 w-7" />
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Step 2</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Get your BTC address</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  Receive a unique Bitcoin deposit address. We track deposits and credit your balance automatically.
                </p>
              </div>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Step 3</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Refund manager</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  A dedicated refund manager is assigned to guide you through withdrawals and recovery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported loss types */}
        <section className="border-y border-slate-200 bg-white px-4 py-16 dark:border-slate-800 dark:bg-slate-900 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Supported loss types
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              We support recovery across a range of financial losses
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {['Forex', 'Crypto', 'Stocks', 'CFDs', 'Binary options', 'Investment scams'].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Why us + Regions */}
        <section className="px-4 py-16 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Why StockTrendTracker
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              Built for people in recovery—simple, transparent, and supported
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <Shield className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Secure & verified</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  KYC verification, encrypted data, and no sharing of your banking details beyond what’s needed for payouts.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <Globe className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Global reach</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  We serve Canada, Australia, New Zealand, the UK, and Europe. Add your local bank details and request withdrawals in your currency.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <Mail className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Real support</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Dedicated refund manager and support tickets answered by people—no bots. Email notifications at every step.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <Clock className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Clear timeline</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  See your balance, deposits, and withdrawal status in one dashboard. No guessing—you’re always in the loop.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials — 3 rows, auto-scrolling */}
        <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              What people in recovery say
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              Real experiences from people who used the platform
            </p>
            <div className="mt-10">
              <TestimonialSlideshow />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-200 bg-white px-4 py-16 dark:border-slate-800 dark:bg-slate-950 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              Common questions about signup, verification, banking, and support
            </p>
            <div className="mt-10">
              <FAQ items={faqItems} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-200 bg-slate-100 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Create your account and get access to your recovery dashboard in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="font-medium">Create free account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="font-medium">Log in</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} StockTrendTracker. Financial recovery platform.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                Log in
              </Link>
              <Link href="/signup" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
