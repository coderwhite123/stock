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
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-300/70 bg-[#f5f3ef]/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#172033] text-xs font-bold text-orange-300 shadow-sm">ST</span>
            StockTrendTracker
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <a href="#how-it-works" className="transition-colors hover:text-emerald-600">How it works</a>
            <a href="#why-us" className="transition-colors hover:text-emerald-600">Why us</a>
            <a href="#faq" className="transition-colors hover:text-emerald-600">FAQ</a>
          </nav>
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
        <section className="relative overflow-hidden border-b border-slate-800 bg-[#172033] px-4 py-16 dark:border-slate-800 dark:bg-[#111827] sm:px-6 md:py-24 lg:py-28">
          <div className="absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-orange-200/50 blur-3xl dark:bg-orange-950/30" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-orange-300">
                <span className="h-2 w-2 rounded-full bg-orange-400" /> Financial recovery platform
              </p>
              <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Know where your recovery stands.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
                A clear, secure workspace for tracking recovered funds, completing verification, and staying connected with your refund manager.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 font-medium shadow-lg shadow-emerald-600/15">
                    Create free account <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-slate-600 bg-transparent font-medium text-white hover:bg-white/10">Sign in</Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-300" /> Secure account</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-300" /> Human support</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl rounded-[1.5rem] border border-slate-200/90 bg-white p-3 shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Recovery workspace</span></div>
                  <span className="text-[10px] font-medium text-slate-400">ACCOUNT ACTIVE</span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-xl bg-[#172033] p-5 text-white dark:bg-slate-800">
                    <p className="text-xs text-slate-400">Current recovered balance</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">$24,680.00</p>
                    <div className="mt-7 flex items-end gap-1.5" aria-hidden="true">
                      {[28, 38, 31, 48, 43, 58, 52, 75, 68, 86].map((height, index) => <span key={index} className="flex-1 rounded-t bg-emerald-400/80" style={{ height: `${height}px` }} />)}
                    </div>
                    <p className="mt-3 text-xs text-orange-300">+12.4% this month</p>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500">Verification</p><p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Complete</p><div className="mt-3 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950"><div className="h-1.5 w-full rounded-full bg-emerald-500" /></div></div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500">Next step</p><p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Review withdrawal</p><p className="mt-1 text-xs text-amber-600">Pending approval</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-slate-300 bg-[#e9e4db] px-4 py-10 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6 md:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-0">
              <div className="flex flex-col items-center text-center sm:border-r sm:border-slate-300 sm:pr-10">
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
              <div className="flex flex-col items-center text-center sm:pl-10">
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
        <section id="how-it-works" className="px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700 dark:text-orange-400">A clear path forward</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              How it works
              </h2>
            </div>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              Three simple steps to start your recovery
            </p>
            <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              <div className="relative border-t-2 border-orange-400 pt-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <FileCheck className="h-7 w-7" />
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Step 1</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Sign up & verify</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  Create your account and verify your email. Your dashboard is ready in minutes.
                </p>
              </div>
              <div className="relative border-t-2 border-orange-400 pt-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <Wallet className="h-7 w-7" />
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Step 2</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Get your BTC address</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  Receive a unique Bitcoin deposit address. We track deposits and credit your balance automatically.
                </p>
              </div>
              <div className="relative border-t-2 border-orange-400 pt-5">
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
        <section className="border-y border-slate-300 bg-[#e9e4db] px-4 py-16 dark:border-slate-800 dark:bg-slate-900 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-left text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Supported loss types
            </h2>
            <p className="mt-3 max-w-2xl text-left text-slate-600 dark:text-slate-400">
              We support recovery across a range of financial losses
            </p>
            <div className="mt-10 flex max-w-4xl flex-wrap gap-3">
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
        <section id="why-us" className="px-4 py-16 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-left text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Why StockTrendTracker
            </h2>
            <p className="mt-3 max-w-2xl text-left text-slate-600 dark:text-slate-400">
              Built for people in recovery—simple, transparent, and supported
            </p>
            <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-t-2 border-orange-400 pt-5">
                <Shield className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Secure & verified</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  KYC verification, encrypted data, and no sharing of your banking details beyond what’s needed for payouts.
                </p>
              </div>
              <div className="border-t-2 border-orange-400 pt-5">
                <Globe className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Global reach</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  We serve Canada, Australia, New Zealand, the UK, and Europe. Add your local bank details and request withdrawals in your currency.
                </p>
              </div>
              <div className="border-t-2 border-orange-400 pt-5">
                <Mail className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Real support</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Dedicated refund manager and support tickets answered by people—no bots. Email notifications at every step.
                </p>
              </div>
              <div className="border-t-2 border-orange-400 pt-5">
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
        <section className="border-t border-slate-800 bg-[#172033] px-4 py-16 dark:border-slate-800 dark:bg-[#111827] sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What people in recovery say
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-300">
              Real experiences from people who used the platform
            </p>
            <div className="mt-10">
              <TestimonialSlideshow />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-slate-200 bg-white px-4 py-16 dark:border-slate-800 dark:bg-slate-950 sm:px-6 md:py-24">
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
        <section className="border-t border-slate-800 bg-orange-500 px-4 py-16 dark:border-slate-800 dark:bg-orange-600 sm:px-6 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#172033] text-orange-300">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-3 text-orange-50">
              Create your account and get access to your recovery dashboard in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="font-medium">Create free account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/50 bg-transparent font-medium text-white hover:bg-white/10">Log in</Button>
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
