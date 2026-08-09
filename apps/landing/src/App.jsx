import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Download,
  Flag,
  MapPin,
  Mail,
  Menu,
  MessageSquareText,
  QrCode,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Webhook,
  X,
  Zap,
} from 'lucide-react';

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#access' },
];

const appUrl = import.meta.env.VITE_GUESTLY_APP_URL || 'https://app.getguestly.com';
const demoRequestEmail = import.meta.env.VITE_DEMO_REQUEST_EMAIL || 'hello@getguestly.com';

const productLoginUrl = `${appUrl.replace(/\/$/, '')}/login`;

const capturePoints = [
  { label: 'Room card', location: 'Room 307', signal: 'Noise and humidity signal mapped to room experience risk.' },
  { label: 'Table tent', location: 'Table 18', signal: 'Possible allergen handling issue routed as exposure risk.' },
  { label: 'Receipt', location: 'Receipt QR', signal: 'Billing correction request routed to management.' },
];

const signalStages = [
  { label: 'Capture', detail: 'Context attached' },
  { label: 'Normalize', detail: 'Text structured' },
  { label: 'Score', detail: 'Risk ranked' },
  { label: 'Route', detail: 'Owner assigned' },
];

const workflowSteps = [
  {
    title: 'Capture feedback in the moment',
    text: 'Guests scan a Guestly QR touchpoint and privately share their experience in seconds, with no app or account required.',
    meta: 'Private QR touchpoint',
    icon: QrCode,
  },
  {
    title: 'Understand what needs attention',
    text: 'Guestly automatically organizes incoming feedback by category, urgency, and sentiment so teams can quickly understand what matters.',
    meta: 'Category · urgency · sentiment',
    icon: Sparkles,
  },
  {
    title: 'Surface the right issues',
    text: 'Higher-priority feedback is surfaced clearly so managers can focus on issues that may require immediate operational attention.',
    meta: 'Priority review queue',
    icon: ShieldAlert,
  },
  {
    title: 'Spot patterns over time',
    text: 'Guestly brings feedback together so operators can identify recurring issues, monitor trends, and understand the guest experience across their operation.',
    meta: 'Cross-location trend view',
    icon: TrendingUp,
  },
];

const features = [
  {
    title: 'Guest feedback capture',
    text: 'Guests can share private feedback from Guestly touchpoints without downloading an app, with the context your team needs to follow up.',
    icon: QrCode,
  },
  {
    title: 'AI-powered triage',
    text: 'Guestly organizes incoming feedback into clear operational fields, so teams can work from a focused queue instead of manually sorting every response.',
    icon: Sparkles,
  },
  {
    title: 'Urgency & sentiment detection',
    text: 'See sentiment alongside priority signals to separate routine comments from guest concerns that need attention sooner.',
    icon: ShieldAlert,
  },
  {
    title: 'Issue routing',
    text: 'Surface important feedback to the relevant operational owner and track it from review through resolution.',
    icon: Zap,
  },
  {
    title: 'Trend analytics',
    text: 'Spot recurring complaints, common issue categories, and shifts in guest sentiment over time.',
    icon: TrendingUp,
  },
  {
    title: 'Multi-location visibility',
    text: 'Review feedback across properties, locations, and Guestly touchpoints from one operational workspace.',
    icon: MapPin,
  },
];

const integrations = [
  {
    title: 'Email notifications',
    text: 'Configurable delivery rules for the guest feedback events your team needs to see.',
    status: 'Configuration required',
    icon: Mail,
  },
  {
    title: 'Slack',
    text: 'A secure channel connection flow is ready for teams that use Slack in their operating workflow.',
    status: 'Coming soon',
    icon: MessageSquareText,
  },
  {
    title: 'CSV export',
    text: 'Export the feedback currently visible in the inbox, including its active filters.',
    status: 'Available',
    icon: Download,
  },
  {
    title: 'Webhooks / API',
    text: 'Signed feedback events and delivery logging are ready when secure integration storage is configured.',
    status: 'Configuration required',
    icon: Webhook,
  },
];

const dashboardMetrics = [
  { label: 'Open signals', value: '18', detail: 'Current workspace queue', tone: 'ink' },
  { label: 'Needs attention', value: '4', detail: 'Critical or high priority', tone: 'ink' },
  { label: 'Median triage', value: '11m', detail: 'From intake to owner', tone: 'ink' },
];

const sentimentData = [
  { label: 'Positive', value: 58, color: 'bg-zinc-900' },
  { label: 'Neutral', value: 24, color: 'bg-zinc-400' },
  { label: 'Negative', value: 18, color: 'bg-zinc-600' },
];

const locationPerformance = [
  { name: 'Downtown', signals: '248', positive: '82%', urgent: '6' },
  { name: 'Airport', signals: '193', positive: '76%', urgent: '11' },
  { name: 'Waterfront', signals: '164', positive: '88%', urgent: '3' },
  { name: 'Northside', signals: '121', positive: '80%', urgent: '5' },
];

const locationSentiment = [
  { label: 'Positive', value: 81, color: 'bg-zinc-900' },
  { label: 'Neutral', value: 13, color: 'bg-zinc-400' },
  { label: 'Negative', value: 6, color: 'bg-zinc-600' },
];

const locationCategories = [
  { label: 'Wait time', count: '18 signals' },
  { label: 'Room comfort', count: '14 signals' },
  { label: 'Cleanliness', count: '9 signals' },
];

const locationActivity = [
  { location: 'Airport', text: 'Breakfast queue flagged for review', priority: 'High', time: '9 min ago' },
  { location: 'Waterfront', text: 'Room comfort pattern added to trend view', priority: 'Medium', time: '27 min ago' },
];

const locationCapabilities = [
  {
    title: 'Compare locations',
    text: 'Quickly see where guest experience patterns differ across your operation.',
    icon: MapPin,
  },
  {
    title: 'Spot recurring issues',
    text: 'Identify problems appearing repeatedly across properties, departments, or touchpoints.',
    icon: TrendingUp,
  },
  {
    title: 'Centralize visibility',
    text: 'Give operators one place to understand guest feedback without manually combining data from separate locations.',
    icon: ScanLine,
  },
];

const recentFeedback = [
  {
    source: 'Room 307',
    summary: 'Climate and noise',
    text: 'Guest reported humidity and intermittent mechanical noise overnight.',
    department: 'Rooms',
    category: 'Room environment',
    priority: 'High',
    sentiment: 'Negative',
    timestamp: '12 min ago',
  },
  {
    source: 'Cafe counter',
    summary: 'Breakfast queue delay',
    text: 'Coffee line moved slowly during the breakfast rush.',
    department: 'Service',
    category: 'Wait time',
    priority: 'Medium',
    sentiment: 'Neutral',
    timestamp: '19 min ago',
  },
  {
    source: 'Table 18',
    summary: 'Allergen handling',
    text: 'Guest requested a follow-up after a possible ingredient mix-up.',
    department: 'Kitchen',
    category: 'Food safety',
    priority: 'Critical',
    sentiment: 'Negative',
    timestamp: '31 min ago',
  },
];

const decisionQueue = [
  { title: 'Review allergen handling signal', detail: 'Table 18 · Kitchen', status: 'Assigned' },
  { title: 'Inspect room climate pattern', detail: 'Rooms · Maintenance', status: 'In progress' },
  { title: 'Staff breakfast queue coverage', detail: 'Cafe counter · Service', status: 'Scheduled' },
];

const customerOutcomes = [
  {
    type: 'Independent Hotel',
    title: 'Private guest feedback captured and organized in one place',
    metric: '200+',
    metricLabel: 'guest feedback signals captured',
    detail:
      'Guestly helped the property surface recurring service and operational issues before they were limited to public review channels.',
    supportingMetric: 'Private QR feedback in active use',
  },
  {
    type: 'Multi-Location Operator',
    title: 'Feedback visibility across multiple locations',
    metric: '6',
    metricLabel: 'locations connected',
    detail:
      'Management could review guest experience patterns across locations from a centralized Guestly workspace.',
    supportingMetric: 'One shared operations view',
  },
  {
    type: 'Restaurant Operator',
    title: 'Urgent feedback separated from routine comments',
    metric: '250+',
    metricLabel: 'feedback signals processed',
    detail:
      'Guestly’s classification workflow helped management understand which incoming concerns required attention.',
    supportingMetric: 'Priority and sentiment reviewed in one queue',
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
  window.dispatchEvent(new CustomEvent('guestly:product-redirect'));
  window.setTimeout(() => {
    window.location.href = productLoginUrl;
  }, 540);
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
          <button className="btn-primary" type="button" onClick={() => scrollToSection('#access')}>
            Contact for Demo
          </button>
          <button className="btn-secondary" type="button" onClick={openProductLogin}>
            Product Login
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
            <button className="btn-primary w-full" type="button" onClick={() => scrollToSection('#access')}>
              Contact for Demo
            </button>
            <button className="btn-secondary w-full" type="button" onClick={openProductLogin}>
              Product Login
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
          <div className="mt-5 flex items-center gap-2 text-sm font-medium text-zinc-500">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            <span>Trusted by 100+ hospitality teams</span>
          </div>
          <a href="/trust" className="mt-4 inline-flex w-fit items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-950">
            <ShieldCheck className="h-4 w-4" />
            Built with guest privacy and operational security in mind.
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary" type="button" onClick={() => scrollToSection('#access')}>
              Contact for Demo
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="btn-secondary" type="button" onClick={openProductLogin}>
              Product Login
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
  const [activePoint, setActivePoint] = useState(capturePoints[0]);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [overlayVisible, setOverlayVisible] = useState(true);
  const flowStageRef = useRef(null);
  const overlayRef = useRef(null);
  const overlayPositionRef = useRef(overlayPosition);
  const dragState = useRef(null);
  const activeTags =
    activePoint.label === 'Table tent'
      ? ['Kitchen', 'Allergy', 'Critical']
      : activePoint.label === 'Receipt'
        ? ['Billing', 'Management', 'Recovery']
        : ['Rooms', 'Environment', 'Sleep disruption'];

  useEffect(() => {
    overlayPositionRef.current = overlayPosition;
    if (overlayRef.current) {
      overlayRef.current.style.transform = `translate3d(${overlayPosition.x}px, ${overlayPosition.y}px, 0)`;
    }
  }, [overlayPosition, overlayVisible]);

  function clampOverlayPosition(x, y) {
    if (!flowStageRef.current || !overlayRef.current) {
      return {
        x: Math.max(-150, Math.min(0, x)),
        y: Math.max(-90, Math.min(145, y)),
      };
    }

    const inset = 8;
    const stageRect = flowStageRef.current.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const currentPosition = overlayPositionRef.current;
    const baseLeft = overlayRect.left - currentPosition.x - stageRect.left;
    const baseTop = overlayRect.top - currentPosition.y - stageRect.top;
    const minX = -baseLeft + inset;
    const maxX = stageRect.width - baseLeft - overlayRect.width - inset;
    const minY = -baseTop + inset;
    const maxY = stageRect.height - baseTop - overlayRect.height - inset;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }

  function beginDrag(event) {
    if (event.button !== undefined && event.button !== 0) return;
    const currentPosition = overlayPositionRef.current;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: currentPosition.x,
      originY: currentPosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveDrag(event) {
    if (!dragState.current) return;
    const nextX = dragState.current.originX + event.clientX - dragState.current.startX;
    const nextY = dragState.current.originY + event.clientY - dragState.current.startY;
    const nextPosition = clampOverlayPosition(nextX, nextY);
    overlayPositionRef.current = nextPosition;
    if (overlayRef.current) {
      overlayRef.current.style.transform = `translate3d(${nextPosition.x}px, ${nextPosition.y}px, 0)`;
    }
  }

  function endDrag(event) {
    if (dragState.current) {
      setOverlayPosition(overlayPositionRef.current);
      event.currentTarget.releasePointerCapture?.(dragState.current.pointerId);
    }
    dragState.current = null;
  }

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
            app.getguestly.com
          </div>
        </div>
        <div className="bg-zinc-50 p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">QR capture network</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Guest signal intake flow</h3>
            </div>
            <button
              type="button"
              className={`group inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-zinc-950/15 ${
                overlayVisible
                  ? 'border-zinc-950 bg-zinc-950 text-zinc-50 hover:bg-zinc-800'
                  : 'border-zinc-300 bg-white text-zinc-950 hover:border-zinc-950'
              }`}
              onClick={() => setOverlayVisible((value) => !value)}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  overlayVisible ? 'bg-zinc-50' : 'bg-zinc-950'
                }`}
              />
              {overlayVisible ? 'Hide overlay' : 'Show overlay'}
            </button>
          </div>
          <div
            ref={flowStageRef}
            data-guestly-flow-stage
            className="relative grid min-h-[33rem] gap-4 lg:grid-cols-[0.82fr_1.18fr]"
          >
            <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-zinc-50 shadow-panel">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">Scan point</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">{activePoint.location}</p>
                </div>
                <QrCode className="h-5 w-5 text-zinc-300" />
              </div>
              <QrPattern />
              <div className="mt-5 grid grid-cols-2 gap-2">
                {capturePoints.map((point) => (
                  <button
                    key={point.label}
                    type="button"
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition duration-300 hover:-translate-y-0.5 ${
                      activePoint.label === point.label
                        ? 'border-zinc-500 bg-zinc-50 text-zinc-950'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                    }`}
                    onClick={() => setActivePoint(point)}
                  >
                    {point.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="min-h-[12.5rem] rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">Guest input</p>
                    <p className="mt-2 min-h-[3rem] text-sm leading-6 text-zinc-700">
                      “{activePoint.signal}”
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                    42 sec
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeTags.map((item) => (
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
            {overlayVisible && (
              <div
                ref={overlayRef}
                data-guestly-overlay
                className="overlay-fade-in absolute right-3 top-24 hidden w-60 cursor-grab touch-none rounded-2xl border border-zinc-200 bg-white/95 p-3 text-zinc-950 shadow-[0_28px_70px_-42px_rgba(24,24,27,0.55)] backdrop-blur-xl transition-[box-shadow,border-color,background-color,opacity] duration-200 hover:shadow-[0_32px_80px_-40px_rgba(24,24,27,0.7)] active:cursor-grabbing lg:block"
                style={{
                  transform: `translate3d(${overlayPosition.x}px, ${overlayPosition.y}px, 0)`,
                  willChange: 'transform',
                }}
                onPointerDown={beginDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Operations overlay</span>
                  <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-400">drag</span>
                </div>
                <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3">
                  <p className="text-sm font-semibold text-zinc-950">{activePoint.location}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{activePoint.signal}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-600">
                  {['Inbox', 'Route', 'Trend'].map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5"
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
          title="From guest feedback to operational insight."
          text="Guestly turns individual guest experiences into organized information your team can actually use."
          align="center"
        />
        <div className="relative mt-10">
          <div className="absolute left-[12.5%] right-[12.5%] top-[2rem] hidden h-px bg-zinc-200 xl:block" aria-hidden="true" />
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
            {workflowSteps.map(({ title, text, meta, icon: Icon }, index) => (
              <Reveal key={title} delay={index * 70} className="relative h-full">
                <GlassCard className="group relative flex h-full min-h-[19rem] flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-800 transition duration-300 group-hover:bg-zinc-50">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs tracking-[0.18em] text-slate-500">0{index + 1}</span>
                  </div>
                  <div className="mt-7 border-t border-zinc-200 pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{meta}</p>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">{title}</h3>
                    <p className="mt-4 leading-7 text-slate-400">{text}</p>
                  </div>
                </GlassCard>
                {index < workflowSteps.length - 1 && (
                  <>
                    <span className="absolute -bottom-[0.85rem] left-1/2 z-20 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 xl:hidden" aria-hidden="true">
                      <ArrowRight className="h-3 w-3 rotate-90" />
                    </span>
                    <span className="absolute -right-[1.1rem] top-[1.55rem] z-20 hidden h-4 w-4 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 xl:flex" aria-hidden="true">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </>
                )}
              </Reveal>
            ))}
          </div>
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
          eyebrow="Platform capabilities"
          title="Everything you need to turn feedback into action."
          text="Capture what guests are experiencing, understand what matters, and give your team the visibility to respond."
        />
        <div className="mt-10 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ title, text, icon: Icon }, index) => (
            <Reveal key={title} delay={(index % 3) * 60} className="h-full">
              <GlassCard className="group flex h-full min-h-[15.5rem] flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:bg-white">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 transition duration-300 group-hover:bg-zinc-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs tracking-[0.18em] text-zinc-400">0{index + 1}</span>
                </div>
                <div className="mt-auto pt-8">
                  <div className="h-px w-full bg-zinc-100" />
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{text}</p>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MultiLocationVisibility() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Multi-location operations"
          title="Visibility across every location."
          text="See what guests are experiencing across your operation, from individual touchpoints to multiple properties, in one place."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:items-start">
          <Reveal>
            <GlassCard className="overflow-hidden rounded-[1.5rem]">
              <div className="flex flex-col gap-4 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">Guestly workspace</p>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                      Demo workspace
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Location performance</h3>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700">
                  <MapPin className="h-4 w-4" />
                  All locations
                  <span className="ml-1 text-zinc-400">⌄</span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="overflow-hidden rounded-2xl border border-zinc-200">
                  <div className="grid grid-cols-[1.25fr_.75fr_.75fr_.55fr] gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500 sm:text-[10px]">
                    <span>Location</span>
                    <span>Signals</span>
                    <span>Positive</span>
                    <span>Urgent</span>
                  </div>
                  {locationPerformance.map((location, index) => (
                    <div key={location.name} className={`grid grid-cols-[1.25fr_.75fr_.75fr_.55fr] items-center gap-2 px-4 py-4 ${index < locationPerformance.length - 1 ? 'border-b border-zinc-200' : ''}`}>
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-zinc-900" />
                        <span className="truncate text-sm font-semibold text-zinc-950">{location.name}</span>
                      </div>
                      <span className="text-sm text-zinc-700">{location.signals}</span>
                      <span className="text-sm text-zinc-700">{location.positive}</span>
                      <span className="text-sm font-semibold text-zinc-950">{location.urgent}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid overflow-hidden rounded-2xl border border-zinc-200 md:grid-cols-[0.82fr_1.18fr]">
                  <div className="border-b border-zinc-200 p-5 md:border-b-0 md:border-r">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Sentiment overview</p>
                        <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">81% positive</p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {locationSentiment.map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-600">{item.label}</span>
                            <span className="font-mono text-zinc-500">{item.value}%</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Recurring categories</p>
                      <Flag className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div className="mt-4 space-y-3">
                      {locationCategories.map((category) => (
                        <div key={category.label} className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                          <span className="text-sm font-medium text-zinc-800">{category.label}</span>
                          <span className="whitespace-nowrap font-mono text-[11px] text-zinc-500">{category.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-200 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Recent activity</p>
                    <span className="text-xs text-zinc-500">Location-aware feed</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {locationActivity.map((activity) => (
                      <div key={`${activity.location}-${activity.text}`} className="flex flex-col gap-2 border-b border-zinc-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900">{activity.text}</p>
                          <p className="mt-1 text-xs text-zinc-500">{activity.location} · {activity.time}</p>
                        </div>
                        <PriorityBadge priority={activity.priority} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <div className="border-t border-zinc-200 lg:mt-1">
            {locationCapabilities.map(({ title, text, icon: Icon }, index) => (
              <Reveal key={title} delay={index * 70}>
                <div className={`flex gap-4 py-6 ${index < locationCapabilities.length - 1 ? 'border-b border-zinc-200' : ''}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-800">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Integrations() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="border-y border-zinc-200 py-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Integrations</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-4xl">Fits into the way your team already works.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-zinc-600">Bring Guestly feedback into the right workflow with export, notification, and event-delivery options that remain under your team’s control.</p>
          </div>

          <div className="mt-8 grid divide-y divide-zinc-200 border-t border-zinc-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
            {integrations.map(({ title, text, status, icon: Icon }, index) => (
              <div key={title} className={`py-6 md:px-6 md:py-0 ${index === 0 ? 'md:pl-0' : ''} ${index === integrations.length - 1 ? 'md:pr-0' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <Icon className="h-4 w-4 text-zinc-700" />
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] ${status === 'Available' ? 'border-zinc-300 bg-zinc-950 text-zinc-50' : 'border-zinc-200 bg-zinc-50 text-zinc-500'}`}>{status}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-zinc-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomerOutcomes() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Customer outcomes"
          title="Guestly in day-to-day hospitality operations."
          text="Anonymous operators use Guestly to capture private feedback, organize incoming signals, and review what needs attention."
        />
        <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
          {customerOutcomes.map((outcome, index) => (
            <Reveal key={outcome.type} delay={index * 80} className="h-full">
              <GlassCard className="flex h-full min-h-[23rem] flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-zinc-950">{outcome.type}</p>
                  <span className="font-mono text-xs text-zinc-400">0{index + 1}</span>
                </div>
                <div className="mt-9 border-y border-zinc-200 py-6">
                  <p className="mb-8 max-w-[16rem] text-lg font-semibold leading-6 tracking-[-0.025em] text-zinc-800">
                    {outcome.title}
                  </p>
                  <p className="text-5xl font-semibold tracking-[-0.06em] text-zinc-950">{outcome.metric}</p>
                  <p className="mt-2 max-w-[16rem] text-sm font-medium leading-6 text-zinc-600">
                    {outcome.metricLabel}
                  </p>
                </div>
                <p className="mt-6 text-sm leading-7 text-zinc-600">{outcome.detail}</p>
                <div className="mt-auto pt-6">
                  <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium leading-6 text-zinc-700">
                    {outcome.supportingMetric}
                  </p>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-zinc-500">Customer identities withheld for privacy.</p>
      </div>
    </section>
  );
}

function DemoPreview() {
  return (
    <section id="demo" className="section-padding">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Product preview"
          title="One workspace for every guest signal."
          text="An illustrative view of Guestly’s intake, triage, and resolution workflow."
          align="center"
        />
        <Reveal delay={120}>
          <GlassCard className="mt-10 overflow-hidden rounded-[1.5rem]">
            <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.035] p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-400">Guestly workspace</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Operations overview</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                  Demo workspace
                </span>
                {['All locations', 'Today'].map((label) => (
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
                      Pattern flagged: breakfast queue delays
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {recentFeedback.map((item) => (
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
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-white">Decision queue</h4>
                    <span className="text-xs text-zinc-500">3 active</span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {decisionQueue.map((item) => (
                      <div key={item.title} className="rounded-xl border border-zinc-200 bg-white/92 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-zinc-950">{item.title}</p>
                            <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
                          </div>
                          <span className="whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-medium text-slate-200">{item.summary}</p>
            <span className="text-xs text-zinc-500">{item.source}</span>
            <span className="text-xs text-zinc-400">{item.timestamp}</span>
          </div>
          <p className={`mt-2 leading-6 text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>{item.text}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{item.department}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{item.category}</span>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600">{item.sentiment}</span>
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

function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [businessType, setBusinessType] = useState('');
  const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  function normalizePayload(payload) {
    const otherBusinessType = String(payload.businessTypeOther || '').trim();
    return {
      ...payload,
      businessType: payload.businessType === 'Other' && otherBusinessType ? `Other: ${otherBusinessType}` : payload.businessType,
    };
  }

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
        business_type_detail: payload.businessTypeOther || '',
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
    const payload = normalizePayload(Object.fromEntries(formData.entries()));

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
      setBusinessType('');
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
              Product Login
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
                  <select
                    id="businessType"
                    name="businessType"
                    className="form-input"
                    value={businessType}
                    onChange={(event) => setBusinessType(event.target.value)}
                    required
                  >
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
              {businessType === 'Other' && (
                <div className="animate-soft-enter">
                  <Field id="businessTypeOther" label="Business type details" placeholder="Tell us what kind of business you operate" />
                </div>
              )}
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

function RedirectOverlay({ active }) {
  return (
    <div
      className={`fixed inset-0 z-[80] grid place-items-center bg-white/82 px-5 backdrop-blur-xl transition duration-500 ${
        active ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!active}
    >
      <div className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-cold transition duration-500 ${active ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'}`}>
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-950">
            <img src="/favicon.svg" alt="" className="h-7 w-7 invert" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold tracking-tight text-zinc-950">Opening Guestly workspace</p>
            <p className="mt-1 text-sm text-zinc-500">Taking you to the product login.</p>
          </div>
        </div>
      </div>
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
            ['Contact', '#access'],
            ['Trust', '/trust'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="transition hover:text-zinc-950"
              onClick={(event) => {
                if (href === '/trust') return;
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

function TrustPage() {
  const areas = [
    {
      title: 'Authentication',
      text: 'Guestly uses signed, time-limited dashboard sessions. Session cookies are HTTP-only and same-site, with the secure flag enabled in production.',
    },
    {
      title: 'Access controls',
      text: 'Organization roles are checked on the server for sensitive actions. Owners, Admins, Managers, and Viewers receive deliberately different access scopes.',
    },
    {
      title: 'Organization isolation',
      text: 'Administrative and feedback operations resolve the organization from the signed server session, rather than trusting an organization identifier supplied by the browser.',
    },
    {
      title: 'Data handling',
      text: 'Guestly stores submitted feedback, optional guest contact details, feedback context, and the operational fields needed to triage and analyze a signal. Authorized administrators can export data and use confirmation-protected deletion controls.',
    },
    {
      title: 'Integration credentials',
      text: 'Integration credentials and signing material are kept server-side. Guestly does not expose provider secrets, webhook signing secrets, or private environment variables to the browser.',
    },
    {
      title: 'Privacy choices',
      text: 'Organizations can document a feedback retention preference. To avoid unattended loss of operational records, retention purges require an Owner to explicitly confirm the action.',
    },
  ];

  return (
    <div className="light-theme min-h-screen overflow-hidden text-zinc-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(228,228,231,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(228,228,231,0.55)_1px,transparent_1px)] bg-[size:52px_52px]" />
      <Navbar />
      <main className="px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-500">Trust & security</p>
            <h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-zinc-950 sm:text-6xl">Security built for guest feedback operations.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">Guestly is designed to help hospitality teams handle operational feedback with clear access boundaries, privacy controls, and accountable administration.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <GlassCard key={area.title} className="p-6">
                <ShieldCheck className="h-5 w-5 text-zinc-500" />
                <h2 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950">{area.title}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{area.text}</p>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="mt-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold text-zinc-950">Security question or concern?</p><p className="mt-1 text-sm text-zinc-600">Contact Guestly at {demoRequestEmail}. We do not represent unverified certifications or compliance designations.</p></div>
            <a className="btn-secondary shrink-0" href={`mailto:${demoRequestEmail}`}>Contact Guestly <ArrowRight className="h-4 w-4" /></a>
          </GlassCard>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const handleRedirect = () => setRedirecting(true);
    window.addEventListener('guestly:product-redirect', handleRedirect);
    return () => window.removeEventListener('guestly:product-redirect', handleRedirect);
  }, []);

  if (typeof window !== 'undefined' && window.location.pathname === '/trust') {
    return <TrustPage />;
  }

  return (
    <div className="light-theme min-h-screen overflow-hidden text-zinc-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(228,228,231,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(228,228,231,0.55)_1px,transparent_1px)] bg-[size:52px_52px]" />
      <RedirectOverlay active={redirecting} />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <MultiLocationVisibility />
        <Integrations />
        <CustomerOutcomes />
        <DemoPreview />
        <Pricing />
        <RequestAccess />
      </main>
      <Footer />
    </div>
  );
}
