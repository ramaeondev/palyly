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

export default function LandingAlt2() {
  const features = [
    {
      icon: FileText,
      title: 'Payslips That Look Vintage-Perfect',
      description: 'Clean, compliant, and ready to share instantly.',
      accent: 'bg-[#f7d6a6] text-[#7c3f1d] border-[#7c3f1d]/30',
    },
    {
      icon: Building2,
      title: 'Multi-Client Control',
      description: 'Run every client account from one tidy HQ.',
      accent: 'bg-[#c7e7d9] text-[#1f4d3f] border-[#1f4d3f]/30',
    },
    {
      icon: Users,
      title: 'Portals That Feel Classic',
      description: 'Clients and employees get a clean, focused view.',
      accent: 'bg-[#f4c7d9] text-[#6b2c4f] border-[#6b2c4f]/30',
    },
    {
      icon: Shield,
      title: 'Security That Never Sleeps',
      description: 'RBAC, audit trails, encryption, always on.',
      accent: 'bg-[#d8d1f2] text-[#3f2f6b] border-[#3f2f6b]/30',
    },
    {
      icon: Zap,
      title: 'Instant Everything',
      description: 'Generate payslips in seconds, not hours.',
      accent: 'bg-[#f9e2a1] text-[#7a4a13] border-[#7a4a13]/30',
    },
    {
      icon: Globe,
      title: 'Currency Ready',
      description: '10+ currencies with accurate formatting.',
      accent: 'bg-[#cfe2f3] text-[#264a73] border-[#264a73]/30',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f1e7] text-[#2a201a] retro-body">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#2a201a]/20 bg-[#f8f1e7]/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg border-2 border-[#2a201a] bg-[#fff7ee] flex items-center justify-center shadow-[3px_3px_0_#2a201a]">
              <FileText className="h-5 w-5 text-[#2a201a]" />
            </div>
            <span className="text-2xl font-bold retro-title">Payly</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-[#2a201a]/70 hover:text-[#2a201a] transition-colors">
              Features
            </a>
            <a href="#deployment" className="text-sm text-[#2a201a]/70 hover:text-[#2a201a] transition-colors">
              Deployment
            </a>
            <Link to="/client-portal" className="text-sm text-[#2a201a]/70 hover:text-[#2a201a] transition-colors">
              Client Portal
            </Link>
            <Link to="/employee-portal" className="text-sm text-[#2a201a]/70 hover:text-[#2a201a] transition-colors">
              Employee Portal
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" className="border-[#2a201a]/50 text-[#2a201a] bg-[#fff7ee] hover:bg-[#f1e4d5]">
                Classic
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="sm" className="border-[#2a201a]/50 text-[#2a201a] bg-[#fff7ee] hover:bg-[#f1e4d5]">
                <Sparkles className="h-4 w-4" />
                Try Demo
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-[#1f4d3f] text-[#fff7ee] hover:bg-[#1a3f34]">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f9e2a1,transparent_55%),radial-gradient(circle_at_bottom,#cfe2f3,transparent_60%)] opacity-60" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,rgba(42,32,26,0.08)_1px,transparent_1px),linear-gradient(rgba(42,32,26,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="container relative py-20 md:py-28">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff7ee] text-[#2a201a] text-sm font-medium border border-[#2a201a]/30 shadow-[2px_2px_0_#2a201a]">
                <Sparkles className="h-4 w-4" />
                Always free payroll, built for modern firms.
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance retro-title">
                  Always free payroll, built for modern firms.
                  <span className="block text-[#1f4d3f]">
                    Beautiful payslips, multi-client control, and portals that keep everyone in sync.
                  </span>
                </h1>
                <p className="text-lg text-[#2a201a]/75 max-w-2xl">
                  Payly turns payroll into a clean, confident workflow. Generate polished payslips, manage multiple
                  clients, and keep everyone in the loop with portals that feel premium and effortless.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-[#2a201a]/60 text-[#2a201a] bg-[#fff7ee] hover:bg-[#f1e4d5]">
                    <Sparkles className="h-5 w-5" />
                    Try Demo - No Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 bg-[#1f4d3f] text-[#fff7ee] hover:bg-[#1a3f34]">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-3 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-[#fff7ee] text-[#1f4d3f] border border-[#1f4d3f]/40">Always free</span>
                <span className="px-3 py-1 rounded-full bg-[#fff7ee] text-[#7c3f1d] border border-[#7c3f1d]/40">No credit card needed</span>
                <span className="px-3 py-1 rounded-full bg-[#fff7ee] text-[#3f2f6b] border border-[#3f2f6b]/40">Open-source & privacy-first</span>
                <span className="px-3 py-1 rounded-full bg-[#fff7ee] text-[#264a73] border border-[#264a73]/40">Cloud or on-prem</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[24px] bg-[#2a201a]/10 blur-2xl" />
              <div className="relative rounded-[24px] border-2 border-[#2a201a] bg-[#fff7ee] p-4 shadow-[6px_6px_0_#2a201a]">
                <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(90deg,rgba(42,32,26,0.08)_1px,transparent_1px),linear-gradient(rgba(42,32,26,0.08)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-[90px] gap-4">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 rounded-2xl border-2 border-[#2a201a] bg-[#f9e2a1] text-[#2a201a] p-5 flex flex-col justify-between shadow-[4px_4px_0_#2a201a]">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4" />
                        Payslip Studio
                      </div>
                      <span className="text-xs bg-[#2a201a] text-[#fff7ee] px-2 py-1 rounded-full">Live</span>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold retro-title">Run payroll in 7 minutes</p>
                      <p className="text-sm">Auto-calc, auto-format, auto-ready.</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 rounded-2xl border-2 border-[#2a201a] bg-[#cfe2f3] p-4 flex flex-col justify-between shadow-[4px_4px_0_#2a201a]">
                    <div className="h-10 w-10 rounded-xl bg-[#fff7ee] border-2 border-[#2a201a] flex items-center justify-center">
                      <Globe className="h-5 w-5 text-[#264a73]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Multi-currency</p>
                      <p className="text-xs text-[#2a201a]/70">USD, GBP, EUR, NGN</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 rounded-2xl border-2 border-[#2a201a] bg-[#f4c7d9] p-4 flex flex-col justify-between shadow-[4px_4px_0_#2a201a]">
                    <div className="h-10 w-10 rounded-xl bg-[#fff7ee] border-2 border-[#2a201a] flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#6b2c4f]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Portals on lock</p>
                      <p className="text-xs text-[#2a201a]/70">Clients + employees, separate lanes.</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 rounded-2xl border-2 border-[#2a201a] bg-[#fff7ee] p-4 flex flex-col justify-between shadow-[4px_4px_0_#2a201a]">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold">
                        <Building2 className="h-4 w-4 text-[#1f4d3f]" />
                        Multi-client HQ
                      </div>
                      <span className="text-xs text-[#2a201a]/70">500+ firms</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-[#c7e7d9] text-[#1f4d3f] border border-[#1f4d3f]/30">Templates</span>
                      <span className="px-2 py-1 rounded-full bg-[#d8d1f2] text-[#3f2f6b] border border-[#3f2f6b]/30">Audit trails</span>
                      <span className="px-2 py-1 rounded-full bg-[#f7d6a6] text-[#7c3f1d] border border-[#7c3f1d]/30">Exports</span>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 rounded-2xl border-2 border-[#2a201a] bg-[#d8d1f2] p-4 flex flex-col justify-between shadow-[4px_4px_0_#2a201a]">
                    <div className="h-10 w-10 rounded-xl bg-[#fff7ee] border-2 border-[#2a201a] flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[#3f2f6b]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Compliance-ready</p>
                      <p className="text-xs text-[#2a201a]/70">RBAC, encryption, audit logs.</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 rounded-2xl border-2 border-[#2a201a] bg-[#c7e7d9] p-4 flex flex-col justify-between shadow-[4px_4px_0_#2a201a]">
                    <div className="h-10 w-10 rounded-xl bg-[#fff7ee] border-2 border-[#2a201a] flex items-center justify-center">
                      <Server className="h-5 w-5 text-[#1f4d3f]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Cloud or on-prem</p>
                      <p className="text-xs text-[#2a201a]/70">Your infra, your rules.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#f1e4d5]">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff7ee] text-[#2a201a] text-xs font-semibold tracking-[0.2em] uppercase border border-[#2a201a]/30 shadow-[2px_2px_0_#2a201a]">
              Feature Stack
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 retro-title">Everything payroll needs, minus the chaos</h2>
            <p className="text-lg text-[#2a201a]/70 max-w-2xl mx-auto">
              Built for teams who want polished output, fast workflows, and portals that feel like a flex.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7 lg:gap-8 items-stretch">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 border-[#2a201a] rounded-[24px] shadow-[4px_4px_0_#2a201a] bg-[#fff7ee]">
                <CardContent className="p-6 space-y-4">
                  <div className={`h-12 w-12 rounded-2xl border-2 flex items-center justify-center ${feature.accent}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 retro-title">{feature.title}</h3>
                    <p className="text-[#2a201a]/70">{feature.description}</p>
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff7ee] text-[#2a201a] text-sm font-medium border border-[#2a201a]/30 shadow-[2px_2px_0_#2a201a]">
                <CheckCircle2 className="h-4 w-4" />
                Portal experiences that feel classic
              </div>
              <h2 className="text-3xl md:text-4xl font-bold retro-title">Dedicated portals for everyone</h2>
              <p className="text-lg text-[#2a201a]/70">
                Keep your main dashboard clean while clients and employees get sleek, secure portals tailored to their role.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#fff7ee] border-2 border-[#2a201a] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-[#1f4d3f]" />
                  </div>
                  <div>
                    <h4 className="font-semibold retro-title">Client Portal</h4>
                    <p className="text-sm text-[#2a201a]/70">
                      Clients see their teams, download payslips, and keep things moving without email threads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#fff7ee] border-2 border-[#2a201a] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-[#6b2c4f]" />
                  </div>
                  <div>
                    <h4 className="font-semibold retro-title">Employee Portal</h4>
                    <p className="text-sm text-[#2a201a]/70">Employees access only their own payslips in a clean, simple interface.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#fff7ee] border-2 border-[#2a201a] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-[#7c3f1d]" />
                  </div>
                  <div>
                    <h4 className="font-semibold retro-title">Invite System</h4>
                    <p className="text-sm text-[#2a201a]/70">Send secure invitations so clients and employees can onboard in minutes.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link to="/client-portal">
                  <Button variant="outline" className="border-[#2a201a]/60 text-[#2a201a] bg-[#fff7ee] hover:bg-[#f1e4d5]">
                    <Building2 className="h-4 w-4" />
                    Client Portal
                  </Button>
                </Link>
                <Link to="/employee-portal">
                  <Button variant="outline" className="border-[#2a201a]/60 text-[#2a201a] bg-[#fff7ee] hover:bg-[#f1e4d5]">
                    <Users className="h-4 w-4" />
                    Employee Portal
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="rounded-[24px] border-2 border-[#2a201a] shadow-[4px_4px_0_#2a201a] bg-[#fff7ee]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#c7e7d9] border-2 border-[#2a201a] flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-[#1f4d3f]" />
                    </div>
                    <div>
                      <p className="font-semibold retro-title">Client portal preview</p>
                      <p className="text-xs text-[#2a201a]/70">Invoice-ready and client calm.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-[#2a201a] bg-[#f1e4d5] p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2a201a]/70">Active employees</span>
                      <span className="font-medium">248</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2a201a]/70">Payslips shared</span>
                      <span className="font-medium text-[#1f4d3f]">1,920</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2a201a]/70">Last run</span>
                      <span className="font-medium">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-2 border-[#2a201a] shadow-[4px_4px_0_#2a201a] bg-[#fff7ee]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#f4c7d9] border-2 border-[#2a201a] flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#6b2c4f]" />
                    </div>
                    <div>
                      <p className="font-semibold retro-title">Employee portal preview</p>
                      <p className="text-xs text-[#2a201a]/70">Simple, secure, and drama-free.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-[#2a201a] bg-[#f1e4d5] p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2a201a]/70">Latest payslip</span>
                      <span className="font-medium">January 2026</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2a201a]/70">Net pay</span>
                      <span className="font-medium text-[#1f4d3f]">$5,500.00</span>
                    </div>
                    <Button size="sm" className="w-full bg-[#1f4d3f] text-[#fff7ee] hover:bg-[#1a3f34]">
                      <FileText className="h-4 w-4" />
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
      <section id="deployment" className="py-24 bg-[#f1e4d5]">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff7ee] text-[#2a201a] text-xs font-semibold tracking-[0.2em] uppercase border border-[#2a201a]/30 shadow-[2px_2px_0_#2a201a]">
              Trust Layer
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 retro-title">Security, privacy, and deployment on your terms</h2>
            <p className="text-lg text-[#2a201a]/70 max-w-3xl mx-auto">
              Payly is privacy-first, open-source, and designed for Managed Cloud or On-Premise deployment so firms can
              meet compliance requirements without compromises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="rounded-[24px] border-2 border-[#2a201a] bg-[#fff7ee] shadow-[4px_4px_0_#2a201a]">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#cfe2f3] border-2 border-[#2a201a] flex items-center justify-center">
                  <Lock className="h-6 w-6 text-[#264a73]" />
                </div>
                <h3 className="text-xl font-semibold retro-title">Security & Privacy</h3>
                <p className="text-[#2a201a]/70">
                  Role-based access, strong encryption in transit and at rest, audit logs, and privacy-first defaults.
                </p>
                <ul className="text-sm space-y-2 text-[#2a201a]/70">
                  <li>Fine-grained RBAC and permission controls</li>
                  <li>End-to-end encryption and audit trails</li>
                  <li>Privacy by default and data minimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-2 border-[#2a201a] bg-[#fff7ee] shadow-[4px_4px_0_#2a201a]">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#d8d1f2] border-2 border-[#2a201a] flex items-center justify-center">
                  <Server className="h-6 w-6 text-[#3f2f6b]" />
                </div>
                <h3 className="text-xl font-semibold retro-title">Flexible Deployment</h3>
                <p className="text-[#2a201a]/70">
                  Cloud or on-premise. Environment-based configuration, no hard ties to a single provider, and full data
                  ownership for self-hosted deployments.
                </p>
                <ul className="text-sm space-y-2 text-[#2a201a]/70">
                  <li>Managed Cloud for convenience and security</li>
                  <li>On-premise for complete data ownership and compliance</li>
                  <li>Environment-driven configs & 12-factor friendly</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-2 border-[#2a201a] bg-[#fff7ee] shadow-[4px_4px_0_#2a201a]">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#f7d6a6] border-2 border-[#2a201a] flex items-center justify-center">
                  <Code className="h-6 w-6 text-[#7c3f1d]" />
                </div>
                <h3 className="text-xl font-semibold retro-title">Open & Trustworthy</h3>
                <p className="text-[#2a201a]/70">
                  Always free and open-source. We prioritize auditability and community governance so firms can trust
                  the platform that handles payroll.
                </p>
                <ul className="text-sm space-y-2 text-[#2a201a]/70">
                  <li>Publicly auditable architecture and security reports</li>
                  <li>Community-friendly code layout and contribution flow</li>
                  <li>No vendor lock-in — your data, your choice</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#fff7ee] text-[#2a201a] text-sm border border-[#2a201a]/30 shadow-[2px_2px_0_#2a201a]">
              <Shield className="h-4 w-4 text-[#1f4d3f]" />
              <strong>Privacy-First • Open-Source • Always Free</strong>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Card className="rounded-[24px] border-2 border-[#2a201a] bg-[#fff7ee] shadow-[4px_4px_0_#2a201a]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-[#1f4d3f]" />
                  <p className="font-semibold retro-title">Managed Cloud</p>
                </div>
                <p className="text-[#2a201a]/70">We manage hosting, security, updates, and backups so your team can focus on payroll.</p>
                <div className="flex gap-3">
                  <Link to="/docs/deployment">
                    <Button variant="outline" className="border-[#2a201a]/60 text-[#2a201a] bg-[#fff7ee] hover:bg-[#f1e4d5]">Learn More</Button>
                  </Link>
                  <a href="#contact" className="ml-1">
                    <Button className="bg-[#1f4d3f] text-[#fff7ee] hover:bg-[#1a3f34]">Get Managed</Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-2 border-[#2a201a] bg-[#fff7ee] shadow-[4px_4px_0_#2a201a]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <FolderGit className="h-5 w-5 text-[#7c3f1d]" />
                  <p className="font-semibold retro-title">On-Premise (Self-Hosted)</p>
                </div>
                <p className="text-[#2a201a]/70">Deploy inside your environment for complete data ownership, control, and compliance.</p>
                <div className="flex gap-3">
                  <Link to="/docs/deployment#self-hosting">
                    <Button variant="outline" className="border-[#2a201a]/60 text-[#2a201a] bg-[#fff7ee] hover:bg-[#f1e4d5]">Self-Host Docs</Button>
                  </Link>
                  <a href="#contact" className="ml-1">
                    <Button className="bg-[#1f4d3f] text-[#fff7ee] hover:bg-[#1a3f34]">Contact Sales</Button>
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
          <div className="relative overflow-hidden rounded-[24px] border-2 border-[#2a201a] bg-[#fff7ee] shadow-[6px_6px_0_#2a201a]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f9e2a1,transparent_55%)] opacity-60" />

            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 retro-title">Ready to make payroll feel easy?</h2>
              <p className="text-lg text-[#2a201a]/70 max-w-2xl mx-auto mb-8">
                Join thousands of businesses using Payly to generate professional payslips in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#2a201a]/60 text-[#2a201a] bg-[#fff7ee] hover:bg-[#f1e4d5]">
                    <Sparkles className="h-5 w-5" />
                    Try Demo First
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-[#1f4d3f] text-[#fff7ee] hover:bg-[#1a3f34]">
                    Create Free Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a201a]/20 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg border-2 border-[#2a201a] bg-[#fff7ee] flex items-center justify-center shadow-[2px_2px_0_#2a201a]">
                <FileText className="h-4 w-4 text-[#2a201a]" />
              </div>
              <span className="text-xl font-bold retro-title">Payly</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#2a201a]/60">
              <Link to="/privacy" className="hover:text-[#2a201a] transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-[#2a201a] transition-colors">Terms</Link>
              <a href="#" className="hover:text-[#2a201a] transition-colors">Support</a>
            </div>
            <p className="text-sm text-[#2a201a]/60">© 2026 Payly. Free & Open Source.</p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#2a201a]/20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff7ee] text-[#2a201a] text-sm border border-[#2a201a]/30 shadow-[2px_2px_0_#2a201a]">
              <Shield className="h-4 w-4 text-[#1f4d3f]" />
              Privacy-First • Open Source • Your Data, Your Control
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
