import { Link } from "wouter";
import { AlertTriangle, Shield, Activity, Camera, Bell, Zap, ChevronRight, Radio } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Multi-Camera Management",
    desc: "Register and monitor unlimited RTSP/ONVIF cameras from a single command center.",
  },
  {
    icon: Zap,
    title: "Real-Time AI Detection",
    desc: "YOLO-powered threat detection pushes events instantly — intrusion, loitering, tamper, and more.",
  },
  {
    icon: Bell,
    title: "Multi-Channel Alerts",
    desc: "Instant alerts via in-app, email, SMS, and WhatsApp with configurable risk thresholds.",
  },
  {
    icon: Shield,
    title: "Incident Management",
    desc: "Aggregate events into incidents with AI-generated summaries and severity tracking.",
  },
  {
    icon: Activity,
    title: "Live Analytics",
    desc: "24-hour event timelines, risk scoring, camera health matrix — all updating in real time.",
  },
  {
    icon: AlertTriangle,
    title: "Rules Engine",
    desc: "Define alert rules by event type, risk score, delay, and channel — no code required.",
  },
];

const stats = [
  { value: "< 2s", label: "Detection latency" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "7", label: "Alert channels" },
  { value: "∞", label: "Cameras supported" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm">
            <AlertTriangle className="h-5 w-5" />
            AI-SOC Cloud
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-3 py-1.5">
                Sign In
              </span>
            </Link>
            <Link href="/sign-up">
              <span className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded cursor-pointer hover:bg-primary/90 transition-colors">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(hsl(217 91% 60%) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="max-w-6xl mx-auto px-6 py-28 text-center relative">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary text-xs px-3 py-1.5 rounded mb-8 tracking-widest">
            <Radio className="h-3 w-3 animate-pulse" />
            LIVE THREAT DETECTION — ENTERPRISE GRADE
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Your CCTV System,<br />
            <span className="text-primary">AI-Powered.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-SOC Cloud turns any existing camera system into an intelligent Security Operations Center —
            with real-time threat detection, automated multi-channel alerts, and AI-generated incident reports.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/sign-up">
              <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded font-bold tracking-wider cursor-pointer hover:bg-primary/90 transition-colors">
                Start Free Trial
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/sign-in">
              <span className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded font-bold tracking-wider cursor-pointer hover:bg-muted/30 transition-colors">
                Sign In to Dashboard
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-primary mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Everything a SOC team needs</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Designed for security companies, SME owners, and enterprise teams who need intelligent monitoring without the complexity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="border border-border/60 bg-card/50 rounded p-6 hover:border-primary/40 hover:bg-card/80 transition-all group">
              <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold tracking-wide mb-2 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to secure your operations?</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Connect your cameras, configure your alert rules, and go live in minutes. No hardware changes required.
          </p>
          <Link href="/sign-up">
            <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded font-bold tracking-wider cursor-pointer hover:bg-primary/90 transition-colors text-base">
              Create Free Account
              <ChevronRight className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
            <AlertTriangle className="h-4 w-4" />
            AI-SOC Cloud
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 AI-SOC Cloud. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
