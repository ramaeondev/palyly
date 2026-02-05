import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Building2,
  Users,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Server,
  Code,
  FolderGit,
} from 'lucide-react';

export default function LandingAlt() {
  const features = [
    {
      icon: FileText,
      title: 'Payslips That Actually Slay',
      description: 'Pixel-perfect, compliant, and instantly shareable.',
      tone: 'from-[#00F5FF]/30 via-[#A855F7]/20 to-[#F43F5E]/20 border-white/30',
    },
    {
      icon: Building2,
      title: 'Multi-Client Mastery',
      description: 'Run every client like a playlist, not a puzzle.',
      tone: 'from-[#FDE68A]/40 via-[#F97316]/20 to-[#F43F5E]/10 border-white/20',
    },
    {
      icon: Users,
      title: 'Portals With Main-Character Energy',
      description: 'Clients and employees get their own clean space.',
      tone: 'from-[#A7F3D0]/40 via-[#00F5FF]/20 to-[#38BDF8]/20 border-white/20',
    },
    {
      icon: Shield,
      title: 'Security That Doesn’t Blink',
      description: 'RBAC, audit trails, encryption, always on.',
      tone: 'from-[#C4B5FD]/40 via-[#A855F7]/25 to-[#60A5FA]/15 border-white/20',
    },
    {
      icon: Zap,
      title: 'Instant Everything',
      description: 'Generate payslips in seconds. Literally.',
      tone: 'from-[#FCA5A5]/40 via-[#F59E0B]/20 to-[#FDE68A]/30 border-white/20',
    },
    {
      icon: Globe,
      title: 'Currency Flex',
      description: '10+ currencies with clean formatting baked in.',
      tone: 'from-[#99F6E4]/40 via-[#22D3EE]/20 to-[#A5B4FC]/20 border-white/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#05040B] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#05040B]/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00F5FF] to-[#A855F7] flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)]">
              <FileText className="h-5 w-5 text-[#05040B]" />
            </div>
            <span className="text-2xl font-bold font-display bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#F43F5E] bg-clip-text text-transparent">
              Payly
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
              Features
            </a>
            <a href="#deployment" className="text-sm text-white/70 hover:text-white transition-colors">
              Deployment
            </a>
            <Link to="/client-portal" className="text-sm text-white/70 hover:text-white transition-colors">
              Client Portal
            </Link>
            <Link to="/employee-portal" className="text-sm text-white/70 hover:text-white transition-colors">
              Employee Portal
            </Link>
          </div>
          <div className="flex items-center gap-3">
            
            <Link to="/demo">
              <Button variant="outline" size="sm" className="border-white/40 text-white bg-transparent hover:bg-white/10">
                <Sparkles className="h-4 w-4 mr-2" />
                Try Demo
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#F43F5E] text-[#05040B] hover:opacity-90">
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#00F5FF33,transparent_55%),radial-gradient(circle_at_bottom,#F43F5E33,transparent_60%),radial-gradient(circle_at_50%_40%,#A855F733,transparent_45%)]" />
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#00F5FF]/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-[#F43F5E]/20 blur-3xl" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="container relative py-20 md:py-28">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20">
                <Sparkles className="h-4 w-4 text-[#00F5FF]" />
                Always free payroll, built for modern firms.
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                  Always free payroll, built for modern firms.
                  <span className="block bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#F43F5E] bg-clip-text text-transparent">
                    Beautiful payslips, multi-client control, and portals that keep everyone in sync.
                  </span>
                </h1>
                <p className="text-xl text-white/70 max-w-2xl">
                  Payly turns payroll into a clean, confident workflow. Generate polished payslips, manage multiple
                  clients, and keep everyone in the loop with portals that feel premium and effortless.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-white/40 text-white bg-transparent hover:bg-white/10">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Try Demo - No Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#F43F5E] text-[#05040B] hover:opacity-90">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-3 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40">Always free</span>
                <span className="px-3 py-1 rounded-full bg-[#A855F7]/20 text-[#C4B5FD] border border-[#A855F7]/40">Open-source & privacy-first</span>
                <span className="px-3 py-1 rounded-full bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40">Cloud or on-prem</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#00F5FF]/20 via-transparent to-[#F43F5E]/20 blur-2xl" />
              <div className="relative rounded-[32px] border border-white/20 bg-white/5 p-4 shadow-[0_0_35px_rgba(168,85,247,0.35)]">
                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50" />
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-[92px] gap-4">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 rounded-3xl bg-gradient-to-br from-[#00F5FF] via-[#A855F7] to-[#F43F5E] text-[#05040B] p-5 flex flex-col justify-between shadow-[0_0_30px_rgba(0,245,255,0.5)]">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4" />
                        Payslip Studio
                      </div>
                      <span className="text-xs bg-black/20 px-2 py-1 rounded-full">Live</span>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">Run payroll in 7 minutes</p>
                      <p className="text-sm">Auto-calc, auto-format, auto-ready.</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 rounded-3xl border border-white/20 bg-white/10 p-4 flex flex-col justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-[#00F5FF]/20 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-[#00F5FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Multi-currency</p>
                      <p className="text-xs text-white/70">USD, GBP, EUR, NGN</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 rounded-3xl border border-white/20 bg-white/10 p-4 flex flex-col justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-[#A855F7]/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#C4B5FD]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Portals on lock</p>
                      <p className="text-xs text-white/70">Clients + employees, separate lanes.</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 rounded-3xl border border-white/20 bg-white/10 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold">
                        <Building2 className="h-4 w-4 text-[#00F5FF]" />
                        Multi-client HQ
                      </div>
                      <span className="text-xs text-white/60">500+ firms</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-[#00F5FF]/20 text-[#00F5FF]">Templates</span>
                      <span className="px-2 py-1 rounded-full bg-[#A855F7]/20 text-[#C4B5FD]">Audit trails</span>
                      <span className="px-2 py-1 rounded-full bg-[#F43F5E]/20 text-[#F43F5E]">Exports</span>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 rounded-3xl border border-white/20 bg-white/10 p-4 flex flex-col justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-[#F43F5E]/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[#F43F5E]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Compliance-ready</p>
                      <p className="text-xs text-white/70">RBAC, encryption, audit logs.</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 rounded-3xl border border-white/20 bg-white/10 p-4 flex flex-col justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-[#FDE68A]/30 flex items-center justify-center">
                      <Server className="h-5 w-5 text-[#FDE68A]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Cloud or on-prem</p>
                      <p className="text-xs text-white/70">Your infra, your rules.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0D0A1A]">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold tracking-[0.2em] uppercase border border-white/20">
              Feature Stack
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">Everything payroll needs, minus the chaos</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Built for teams who want polished output, fast workflows, and portals that feel like a flex.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7 lg:gap-8 items-stretch">
            {features.map((feature) => (
              <Card key={feature.title} className={`relative overflow-hidden border rounded-[28px] shadow-lg bg-gradient-to-br ${feature.tone}`}>
                <div className="absolute inset-0 bg-[#05040B]/35" />
                <CardContent className="relative p-6 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-white/85">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20">
                <CheckCircle2 className="h-4 w-4 text-[#A855F7]" />
                Portal experiences that feel native
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Dedicated portals for everyone</h2>
              <p className="text-lg text-white/70">
                Keep your main dashboard clean while clients and employees get sleek, secure portals tailored to their
                role.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/20">
                    <CheckCircle2 className="h-5 w-5 text-[#00F5FF]" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Client Portal</h4>
                    <p className="text-sm text-white/70">
                      Clients see their teams, download payslips, and keep things moving without email threads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/20">
                    <CheckCircle2 className="h-5 w-5 text-[#F43F5E]" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Employee Portal</h4>
                    <p className="text-sm text-white/70">Employees access only their own payslips in a clean, simple interface.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/20">
                    <CheckCircle2 className="h-5 w-5 text-[#FDE68A]" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Invite System</h4>
                    <p className="text-sm text-white/70">Send secure invitations so clients and employees can onboard in minutes.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link to="/client-portal">
                  <Button variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10">
                    <Building2 className="h-4 w-4 mr-2" />
                    Client Portal
                  </Button>
                </Link>
                <Link to="/employee-portal">
                  <Button variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10">
                    <Users className="h-4 w-4 mr-2" />
                    Employee Portal
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="rounded-[28px] border border-white/30 shadow-[0_0_30px_rgba(0,245,255,0.25)] bg-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#00F5FF]/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-[#00F5FF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Client portal preview</p>
                      <p className="text-xs text-white/80">Invoice-ready and client calm.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Active employees</span>
                      <span className="font-medium">248</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Payslips shared</span>
                      <span className="font-medium text-[#00F5FF]">1,920</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Last run</span>
                      <span className="font-medium">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-white/30 bg-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#F43F5E]/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#F43F5E]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Employee portal preview</p>
                      <p className="text-xs text-white/80">Simple, secure, and drama-free.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Latest payslip</span>
                      <span className="font-medium">January 2026</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Net pay</span>
                      <span className="font-medium text-[#00F5FF]">$5,500.00</span>
                    </div>
                    <Button size="sm" className="w-full bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#F43F5E] text-[#05040B] hover:opacity-90">
                      <FileText className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Security, Privacy & Deployment Section */}
      <section id="deployment" className="py-24 bg-[#0D0A1A]">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold tracking-[0.2em] uppercase border border-white/20">
              Trust Layer
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">Security, privacy, and deployment on your terms</h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Payly is privacy-first, open-source, and designed for Managed Cloud or On‑Premise deployment so firms can
              meet compliance requirements without compromises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="rounded-[28px] border border-white/20 bg-white/5">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#00F5FF]/20 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-[#00F5FF]" />
                </div>
                <h3 className="text-xl font-semibold">Security & Privacy</h3>
                <p className="text-white/70">
                  Role-based access, strong encryption in transit and at rest, audit logs, and privacy-first defaults.
                </p>
                <ul className="text-sm space-y-2 text-white/70">
                  <li>Fine-grained RBAC and permission controls</li>
                  <li>End-to-end encryption and audit trails</li>
                  <li>Privacy by default and data minimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/20 bg-white/5">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#A855F7]/20 flex items-center justify-center">
                  <Server className="h-6 w-6 text-[#C4B5FD]" />
                </div>
                <h3 className="text-xl font-semibold">Flexible Deployment</h3>
                <p className="text-white/70">
                  Cloud or on-premise. Environment-based configuration, no hard ties to a single provider, and full data
                  ownership for self-hosted deployments.
                </p>
                <ul className="text-sm space-y-2 text-white/70">
                  <li>Managed Cloud for convenience and security</li>
                  <li>On-premise for complete data ownership and compliance</li>
                  <li>Environment-driven configs & 12-factor friendly</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/20 bg-white/5">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#F43F5E]/20 flex items-center justify-center">
                  <Code className="h-6 w-6 text-[#F43F5E]" />
                </div>
                <h3 className="text-xl font-semibold">Open & Trustworthy</h3>
                <p className="text-white/70">
                  Always free and open-source. We prioritize auditability and community governance so firms can trust
                  the platform that handles payroll.
                </p>
                <ul className="text-sm space-y-2 text-white/70">
                  <li>Publicly auditable architecture and security reports</li>
                  <li>Community-friendly code layout and contribution flow</li>
                  <li>No vendor lock-in — your data, your choice</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 text-white text-sm border border-white/20">
              <Shield className="h-4 w-4 text-[#00F5FF]" />
              <strong>Privacy-First • Open-Source • Always Free</strong>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Card className="rounded-[28px] border border-white/20 bg-white/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-[#00F5FF]" />
                  <p className="font-semibold">Managed Cloud</p>
                </div>
                <p className="text-white/70">We manage hosting, security, updates, and backups so your team can focus on payroll.</p>
                <div className="flex gap-3">
                  <Link to="/docs/deployment">
                    <Button variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10">Learn More</Button>
                  </Link>
                  <a href="#contact" className="ml-1">
                    <Button className="bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#F43F5E] text-[#05040B] hover:opacity-90">Get Managed</Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/20 bg-white/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <FolderGit className="h-5 w-5 text-[#FDE68A]" />
                  <p className="font-semibold">On‑Premise (Self‑Hosted)</p>
                </div>
                <p className="text-white/70">Deploy inside your environment for complete data ownership, control, and compliance.</p>
                <div className="flex gap-3">
                  <Link to="/docs/deployment#self-hosting">
                    <Button variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10">Self‑Host Docs</Button>
                  </Link>
                  <a href="#contact" className="ml-1">
                    <Button className="bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#F43F5E] text-[#05040B] hover:opacity-90">Contact Sales</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#F43F5E] text-[#05040B]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#FFFFFF55,transparent_50%)]" />

            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to make payroll a flex?</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                Join thousands of businesses using Payly to generate professional payslips in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/demo">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-[#05040B]/10 text-[#05040B] hover:bg-[#05040B]/20">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Try Demo First
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#05040B]/40 text-[#05040B] hover:bg-[#05040B]/10">
                    Create Free Account
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00F5FF] to-[#A855F7] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#05040B]" />
              </div>
              <span className="text-xl font-bold">Payly</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-sm text-white/60">© 2026 Payly. Free & Open Source.</p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm border border-white/20">
              <Shield className="h-4 w-4 text-[#00F5FF]" />
              Privacy-First • Open Source • Your Data, Your Control
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
