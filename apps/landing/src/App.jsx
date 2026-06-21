import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Flag,
  Menu,
  MessageSquareText,
  QrCode,
  ScanLine,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#access' },
];

const appUrl = import.meta.env.VITE_GUESTLY_APP_URL || 'https://app.getguestly.com';
const demoRequestEmail = import.meta.env.VITE_DEMO_REQUEST_EMAIL || 'hello@getguestly.com';

const capturePoints = ['Room card', 'Table tent', 'Receipt'];

const signalStages = [
  { label: 'Capture', detail: 'Context attached' },
  { label: 'Normalize', detail: 'Text structured' },
  { label: 'Score', detail: 'Risk ranked' },
  { label: 'Route', detail: 'Owner assigned' },
];

const workflowSteps = [
  {
    title: 'Place Guestly QR codes',
    text: 'Deploy scan points across rooms, tables, receipts, and guest messages.',
    icon: QrCode,
  },
  {
    title: 'Capture structured signals',
    text: 'Capture source, location, issue type, and sentiment.',
    icon: ScanLine,
  },
  {
    title: 'Classify operational risk',
    text: 'Score urgency, recurrence, department, and exposure.',
    icon: Sparkles,
  },
  {
    title: 'Route what matters',
    text: 'Route priority items before they become public reviews.',
    icon: Zap,
  },
];

const features = [
  {
    title: 'Signal intake infrastructure',
    text: 'QR feedback collection with source and service-moment context.',
    icon: QrCode,
  },
  {
    title: 'Context normalization',
    text: 'Short comments become structured operational metadata.',
    icon: MessageSquareText,
  },
  {
    title: 'Risk classification',
    text: 'Separate routine friction from safety, legal, PR, and reputation exposure.',
    icon: ShieldAlert,
  },
  {
    title: 'Pattern intelligence',
    text: 'Detect recurring failures before they trend publicly.',
    icon: TrendingUp,
  },
];

const intelligenceLayers = [
  { label: 'Language normalization', value: 'short comments, complaints, mixed tone' },
  { label: 'Risk scoring', value: 'severity, exposure, recurrence' },
  { label: 'Operator routing', value: 'owner, action state, weekly rollup' },
];

const riskDots = [
  { label: 'Allergen', x: 78, y: 24, size: 'h-3.5 w-3.5' },
  { label: 'Noise', x: 48, y: 38, size: 'h-3 w-3' },
  { label: 'Queue', x: 38, y: 62, size: 'h-2.5 w-2.5' },
  { label: 'Cleanliness', x: 62, y: 52, size: 'h-3 w-3' },
  { label: 'Staff praise', x: 22, y: 76, size: 'h-2 w-2' },
];

const dashboardMetrics = [
  { label: 'Signals processed', value: '1,284', detail: '30-day volume', tone: 'ink' },
  { label: 'Escalation queue', value: '23', detail: 'Needs owner review', tone: 'ink' },
  { label: 'Risk exposures', value: '4', detail: 'Safety, legal, PR', tone: 'ink' },
];

const sentimentData = [
  { label: 'Positive', value: 58, color: 'bg-zinc-900' },
  { label: 'Neutral', value: 24, color: 'bg-zinc-400' },
  { label: 'Negative', value: 18, color: 'bg-zinc-600' },
];

const recentFeedback = [
  {
    source: 'Room 307',
    text: 'Noise and humidity signal mapped to room experience risk.',
    department: 'Rooms',
    priority: 'High',
  },
  {
    source: 'Cafe counter',
    text: 'Positive staff mention with queue-time friction.',
    department: 'Service',
    priority: 'Medium',
  },
  {
    source: 'Table 18',
    text: 'Possible allergen handling issue routed as exposure risk.',
    department: 'Kitchen',
    priority: 'Critical',
  },
];

const pricingPlans = [
  {
    name: 'Core Plan',
    price: '$29',
    unit: '/month',
    description: 'For teams building a structured feedback layer across key guest touchpoints.',
    features: ['QR signal capture', 'Issue taxonomy', 'Action queue'],
  },
  {
    name: 'Pro Plan',
    price: '$99',
    unit: '/month',
    description: 'For operators that need risk scoring, recurrence detection, and leadership reporting.',
    features: ['Risk classification', 'Pattern detection', 'Executive summaries'],
    featured: true,
  },
];

const founder = {
  name: 'Bera Gumruk',
  title: 'Founder, Guestly',
  image: '/bera-gumruk-headshot.png',
};

function scrollToSection(id) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goToHref(href) {
  if (href.startsWith('#')) {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
      window.setTimeout(() => scrollToSection(href), 0);
      return;
    }

    scrollToSection(href);
    return;
  }

  window.history.pushState({}, '', href);
  window.dispatchEvent(new Event('popstate'));
}

function openProductLogin() {
  window.location.href = `${appUrl.replace(/\/$/, '')}/login`;
}

function Reveal({ children, className = '', delay = 0, as: Component = 'div' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={`reveal-motion ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}

function Logo() {
  return (
    <a href="/" className="group inline-flex items-center gap-3" aria-label="Guestly home" onClick={(event) => {
      event.preventDefault();
      goToHref('/');
      window.setTimeout(() => scrollToSection('#home'), 0);
    }}>
      <span className="grid h-9 w-9 place-items-center">
        <img src="/favicon.svg" alt="" className="h-8 w-8" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-zinc-950">Guestly</span>
    </a>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80 bg-white/84 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Logo />
        <div className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
              onClick={(event) => {
                event.preventDefault();
                goToHref(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <button className="btn-secondary" type="button" onClick={openProductLogin}>
            Try Demo
          </button>
          <button className="btn-primary" type="button" onClick={() => scrollToSection('#access')}>
            Contact for Demo
          </button>
          <button className="btn-secondary" type="button" onClick={openProductLogin}>
            Sign In
          </button>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-zinc-200 bg-white px-5 py-5 lg:hidden">
          <div className="flex flex-col gap-4">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-700"
                onClick={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  goToHref(item.href);
                }}
              >
                {item.label}
              </a>
            ))}
            <button className="btn-secondary w-full" type="button" onClick={openProductLogin}>
              Try Demo
            </button>
            <button className="btn-primary w-full" type="button" onClick={() => scrollToSection('#access')}>
              Contact for Demo
            </button>
            <button className="btn-secondary w-full" type="button" onClick={openProductLogin}>
              Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function SectionHeading({ eyebrow, title, text, align = 'left' }) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-zinc-500">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {text && <p className="mt-5 text-pretty text-base leading-8 text-zinc-600 sm:text-lg">{text}</p>}
    </Reveal>
  );
}

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-zinc-200/90 bg-white/88 shadow-panel backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-28">
      <div className="absolute inset-0 -z-10 bg-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:px-8 lg:pb-20">
        <Reveal className="flex flex-col justify-center">
          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.065em] text-zinc-950 sm:text-6xl lg:text-7xl">
            Turn Silent Guest Feedback Into Action
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-zinc-600">
            Guestly turns QR feedback into prioritized operational intelligence for hospitality teams.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary" type="button" onClick={openProductLogin}>
              Try Demo
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="btn-secondary" type="button" onClick={() => scrollToSection('#access')}>
              Contact for Demo
            </button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <HeroFlowMockup />
        </Reveal>
      </div>
    </section>
  );
}

function HeroFlowMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-2 bottom-0 top-12 -z-10 rounded-[2rem] bg-zinc-200/45 blur-3xl" />
      <GlassCard className="overflow-hidden rounded-[1.5rem]">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-600" />
            <span className="h-3 w-3 rounded-full bg-slate-600" />
            <span className="h-3 w-3 rounded-full bg-zinc-900/70" />
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-1 font-mono text-[11px] text-slate-400">
            getguestly.com
          </div>
        </div>
        <div className="bg-zinc-50 p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">QR capture network</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Guest signal intake flow</h3>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-zinc-50 shadow-panel">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">Scan point</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">Room 307</p>
                </div>
                <QrCode className="h-5 w-5 text-zinc-300" />
              </div>
              <QrPattern />
              <div className="mt-5 grid grid-cols-2 gap-2">
                {capturePoints.map((point) => (
                  <span key={point} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
                    {point}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">Guest input</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">
                      “The room felt damp and the hallway noise made it hard to sleep.”
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                    42 sec
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Rooms', 'Environment', 'Sleep disruption'].map((item) => (
                    <span key={item} className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                {signalStages.map((stage, index) => (
                  <div
                    key={stage.label}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/92 p-3 shadow-sm"
                  >
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-xl bg-zinc-950 text-xs font-semibold text-zinc-50">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">{stage.label}</p>
                      <p className="text-xs leading-5 text-zinc-500">{stage.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

const qrCells = new Set([
  0, 1, 2, 3, 5, 6, 7, 8, 10, 12, 14, 16, 18, 19, 20, 22, 24, 25, 26, 30, 31, 34, 36, 38, 40, 42, 44, 46, 48, 49, 50,
  54, 56, 58, 60, 61, 62, 64, 66, 68, 70, 72, 73, 74, 75, 77, 78, 79, 80,
]);

function QrPattern() {
  return (
    <div className="mt-5 rounded-2xl bg-zinc-50 p-3">
      <div className="grid grid-cols-9 gap-1">
        {Array.from({ length: 81 }).map((_, index) => (
          <span
            key={index}
            className={`aspect-square rounded-[3px] ${qrCells.has(index) ? 'bg-zinc-950' : 'bg-zinc-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, tone }) {
  const tones = {
    ink: 'text-zinc-950',
  };

  return (
    <GlassCard className="p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-[-0.04em] ${tones[tone]}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </GlassCard>
  );
}

function ProgressRow({ label, value, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-slate-500">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.08]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From guest signal to operational decision."
          text="Capture, classify, and route guest issues before they become public reviews."
          align="center"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map(({ title, text, icon: Icon }, index) => (
            <Reveal key={title} delay={index * 80}>
              <GlassCard className="group p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-800 transition group-hover:bg-zinc-50">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-slate-600">0{index + 1}</span>
                </div>
                <h3 className="mt-7 text-xl font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-4 leading-7 text-slate-400">{text}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Feedback intelligence"
          title="More than summaries. A feedback intelligence layer."
          text="Guestly converts unstructured guest language into severity, recurrence, and routed action."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <Reveal>
            <IntelligenceVisual />
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map(({ title, text, icon: Icon }, index) => (
              <Reveal key={title} delay={(index % 2) * 70}>
                <GlassCard className="p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:bg-white">
                  <Icon className="h-5 w-5 text-zinc-800" />
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{text}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IntelligenceVisual() {
  return (
    <GlassCard className="overflow-hidden p-5 sm:p-6 lg:sticky lg:top-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-400">Processing layer</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Signal intelligence model</h3>
        </div>
        <Sparkles className="h-5 w-5 text-zinc-500" />
      </div>
      <div className="mt-6 space-y-3">
        {intelligenceLayers.map((layer, index) => (
          <div key={layer.label} className="rounded-2xl border border-zinc-200 bg-white/92 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-950">{layer.label}</p>
              <span className="font-mono text-xs text-zinc-400">L{index + 1}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{layer.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-950">Risk routing map</p>
          <p className="font-mono text-xs text-zinc-500">impact / recurrence</p>
        </div>
        <div className="relative mt-4 h-52 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(228,228,231,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(228,228,231,0.8)_1px,transparent_1px)] bg-[size:36px_36px]" />
          <div className="absolute bottom-3 left-3 text-[11px] text-zinc-400">low signal</div>
          <div className="absolute right-3 top-3 text-[11px] text-zinc-500">operator review</div>
          {riskDots.map((dot) => (
            <div
              key={dot.label}
              className={`absolute rounded-full border border-zinc-950 bg-zinc-950 shadow-[0_0_0_6px_rgba(24,24,27,0.08)] ${dot.size}`}
              style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
              title={dot.label}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function DemoPreview() {
  return (
    <section id="demo" className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Demo preview"
          title="A sample command view for guest experience risk."
          text="Sample data only. Built to show intake, scoring, routing, and resolution states."
          align="center"
        />
        <Reveal delay={120}>
          <GlassCard className="mt-10 overflow-hidden rounded-[1.5rem]">
            <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.035] p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-400">Guestly intelligence</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Signal command view</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Hotel', 'Cafe', 'Restaurant'].map((label) => (
                  <span key={label} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-400">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {dashboardMetrics.map((metric) => (
                    <MetricCard key={metric.label} {...metric} />
                  ))}
                </div>
                <GlassCard className="p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-semibold text-white">Classified guest signals</h4>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600">
                      <Flag className="h-3.5 w-3.5" />
                      Recurrence cluster: peak-hour service latency
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {recentFeedback.slice(0, 2).map((item) => (
                      <FeedbackRow key={`${item.source}-${item.text}`} item={item} />
                    ))}
                  </div>
                </GlassCard>
              </div>
              <div className="space-y-5">
                <GlassCard className="p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">Risk model</h4>
                    <AlertTriangle className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div className="mt-6 space-y-5">
                    {sentimentData.map((item) => (
                      <ProgressRow key={item.label} {...item} />
                    ))}
                  </div>
                </GlassCard>
                <GlassCard className="p-5">
                  <h4 className="font-semibold text-white">Decision queue</h4>
                  <div className="mt-5 space-y-4">
                    {[
                      'Escalate allergen exposure signal to kitchen lead.',
                      'Inspect recurring room-environment complaints.',
                    ].map((item) => (
                      <div key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                        <Check className="mt-1 h-4 w-4 flex-none text-zinc-900" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-6 text-slate-500">
                    Future backend connection: scoring models, routing states, and closed-loop resolution data.
                  </p>
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

function FeedbackRow({ item, compact = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">{item.source}</p>
          <p className={`mt-2 leading-6 text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>{item.text}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{item.department}</span>
          <PriorityBadge priority={item.priority} />
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const classes = {
    Low: 'border-zinc-200 bg-white text-zinc-500',
    Medium: 'border-zinc-300 bg-zinc-50 text-zinc-700',
    High: 'border-zinc-400 bg-zinc-100 text-zinc-900',
    Critical: 'border-zinc-500 bg-zinc-200 text-zinc-950',
  };

  return <span className={`rounded-full border px-2.5 py-1 text-xs ${classes[priority]}`}>{priority}</span>;
}

function Pricing() {
  return (
    <section id="pricing" className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing preview"
          title="Access tiers for structured guest intelligence."
          text="Choose the tier that fits your operation. Every new team starts with a guided demo so we can map Guestly to your guest experience workflow."
          align="center"
        />
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-2">
          {pricingPlans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 100}>
              <PricingCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan }) {
  return (
    <GlassCard className={`p-7 ${plan.featured ? 'border-zinc-300 bg-zinc-50/80 shadow-cold' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-white">{plan.name}</h3>
          <p className="mt-3 leading-7 text-slate-400">{plan.description}</p>
        </div>
        {plan.featured && (
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">
            Popular
          </span>
        )}
      </div>
      <div className="mt-8 flex items-end gap-2">
        <span className="text-5xl font-semibold tracking-[-0.05em] text-white">{plan.price}</span>
        <span className="pb-2 text-slate-500">{plan.unit}</span>
      </div>
      <div className="mt-8 space-y-3">
        {plan.features.map((item) => (
          <div key={item} className="flex items-center gap-3 text-slate-300">
            <Check className="h-4 w-4 text-zinc-900" />
            {item}
          </div>
        ))}
      </div>
      <button className="btn-primary mt-8 w-full" type="button" onClick={() => scrollToSection('#access')}>
        Contact for Demo
      </button>
    </GlassCard>
  );
}

function AboutFounder() {
  const [showPhoto, setShowPhoto] = useState(true);

  return (
    <section id="about" className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-6 text-zinc-50 shadow-panel sm:p-8 lg:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent" />
            <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:items-center">
              <div>
                <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                  {showPhoto ? (
                    <img
                      src={founder.image}
                      alt={`${founder.name}, ${founder.title}`}
                      className="h-full w-full object-cover"
                      onError={() => setShowPhoto(false)}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-zinc-900 text-2xl font-semibold text-zinc-100">
                      BG
                    </div>
                  )}
                </div>
                <div className="mt-5">
                  <p className="text-xl font-semibold tracking-tight text-zinc-50">{founder.name}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{founder.title}</p>
                </div>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Why I built Guestly</p>
                <p className="mt-4 max-w-3xl text-pretty text-2xl font-semibold leading-tight tracking-[-0.035em] text-zinc-50 sm:text-3xl">
                  One of my relatives runs a boutique hotel, and I kept seeing the same problem: guests would mention issues
                  after checkout, or say nothing at all until it became a review.
                </p>
                <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                  Guestly came from that gap. I wanted to give hospitality teams a faster way to capture quiet feedback,
                  classify what is urgent, and act while the guest experience is still fixable.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  function buildMailtoUrl(payload) {
    const to = demoRequestEmail;
    const subject = `Guestly demo request from ${payload.business}`;
    const body = [
      'New Guestly demo request',
      '',
      `Name: ${payload.name}`,
      `Business: ${payload.business}`,
      `Business type: ${payload.businessType}`,
      `Email: ${payload.email}`,
      '',
      'Message:',
      payload.message,
    ].join('\n');

    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function submitToWeb3Forms(payload) {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: web3FormsAccessKey,
        subject: `Guestly demo request from ${payload.business}`,
        from_name: 'Guestly',
        name: payload.name,
        business: payload.business,
        business_type: payload.businessType,
        email: payload.email,
        message: payload.message,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(result.message || 'Unable to send request right now.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setSubmitting(true);
    setSubmitError('');
    setSubmitted(false);

    try {
      if (web3FormsAccessKey) {
        await submitToWeb3Forms(payload);
      } else {
        window.location.href = buildMailtoUrl(payload);
      }

      setSubmitted(true);
      form.reset();
    } catch (error) {
      setSubmitError(error.message || 'Unable to send request right now. Please use the contact email configured for Guestly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="access" className="section-padding">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Plan demo"
            title="Contact Guestly to start your guided product demo."
            text="After we understand your property or hospitality workflow, we set up the right workspace path and login credentials for your team."
          />
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-sm text-slate-500">Already have workspace credentials?</p>
            <p className="mt-2 text-lg leading-7 text-white">
              Sign in through the Guestly product workspace with the email and password issued to your team.
            </p>
            <button className="btn-secondary mt-5" type="button" onClick={openProductLogin}>
              Open Product Login
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <Reveal delay={120}>
          <GlassCard className="p-5 sm:p-7">
            {submitted && (
              <div className="mb-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700" role="status">
                Demo request sent. We will follow up with next steps.
              </div>
            )}
            {submitError && (
              <div className="mb-5 rounded-2xl border border-zinc-300 bg-white p-4 text-sm text-zinc-700" role="alert">
                {submitError}
              </div>
            )}
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Name" placeholder="Your name" />
                <Field id="business" label="Business name" placeholder="Property or venue name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="businessType">
                    Business type
                  </label>
                  <select id="businessType" name="businessType" className="form-input" defaultValue="" required>
                    <option value="" disabled>
                      Select type
                    </option>
                    <option>Hotel</option>
                    <option>Boutique hotel</option>
                    <option>Cafe</option>
                    <option>Restaurant</option>
                    <option>Hospitality group</option>
                    <option>Other</option>
                  </select>
                </div>
                <Field id="email" label="Email" type="email" placeholder="you@company.com" />
              </div>
              <div>
                <label className="form-label" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="form-input min-h-36 resize-none"
                  placeholder="Where should Guestly capture and route feedback?"
                  required
                />
              </div>
              <button className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
                {submitting ? 'Sending request' : 'Contact for Demo'}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ id, label, type = 'text', placeholder }) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} name={id} type={type} className="form-input" placeholder={placeholder} required />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200/90 px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
            Customer feedback intelligence for hotels, cafes, restaurants, and hospitality operators.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
          {[
            ['Home', '#home'],
            ['Demo', '#demo'],
            ['Pricing', '#pricing'],
            ['About', '#about'],
            ['Contact', '#access'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="transition hover:text-zinc-950"
              onClick={(event) => {
                event.preventDefault();
                goToHref(href);
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="light-theme min-h-screen overflow-hidden text-zinc-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(228,228,231,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(228,228,231,0.55)_1px,transparent_1px)] bg-[size:52px_52px]" />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <DemoPreview />
        <Pricing />
        <AboutFounder />
        <RequestAccess />
      </main>
      <Footer />
    </div>
  );
}
