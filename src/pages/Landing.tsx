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
  Sparkles
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: FileText,
      title: 'Professional Payslips',
      description: 'Generate beautiful, compliant payslips with multiple templates'
    },
    {
      icon: Building2,
      title: 'Multi-Client Management',
      description: 'Manage multiple clients and their employees from one dashboard'
    },
    {
      icon: Users,
      title: 'Portal Access',
      description: 'Give clients and employees secure access to view their data'
    },
    {
      icon: Shield,
      title: 'Role-Based Security',
      description: 'Fine-grained access control for your entire organization'
    },
    {
      icon: Zap,
      title: 'Instant Generation',
      description: 'Create and download payslips in seconds, not hours'
    },
    {
      icon: Globe,
      title: 'Multi-Currency Support',
      description: 'Support for 10+ currencies with proper formatting'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for trying out Payly',
      features: ['Up to 5 employees', 'Basic templates', 'PDF downloads', 'Email support']
    },
    {
      name: 'Professional',
      price: '$29',
      description: 'For growing businesses',
      features: ['Unlimited employees', 'All templates', 'Client & Employee portals', 'Priority support', 'Bulk generation']
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: ['Everything in Pro', 'Custom branding', 'API access', 'Dedicated support', 'On-premise option']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Payly
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/client-portal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Client Portal</Link>
            <Link to="/employee-portal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Employee Portal</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/demo">
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Try Demo
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="btn-gradient">
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Trusted by 500+ businesses worldwide
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Payroll Made{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Simple & Beautiful
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate professional payslips, manage multiple clients, and give your employees 
              secure portal access—all from one powerful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Try Demo - No Login
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" className="btn-gradient w-full sm:w-auto text-lg px-8">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Payroll
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From generating payslips to managing client portals, Payly has you covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover border-0 bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold">
                Dedicated Portals for Everyone
              </h2>
              <p className="text-lg text-muted-foreground">
                Give your clients and employees secure access to their own data without 
                compromising your main dashboard.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Client Portal</h4>
                    <p className="text-sm text-muted-foreground">
                      Clients can view all their employees and download payslips anytime.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Employee Portal</h4>
                    <p className="text-sm text-muted-foreground">
                      Employees access only their own payslips in a clean, simple interface.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Invite System</h4>
                    <p className="text-sm text-muted-foreground">
                      Send secure email invitations for clients and employees to set up their accounts.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Link to="/client-portal">
                  <Button variant="outline">
                    <Building2 className="h-4 w-4 mr-2" />
                    Client Portal
                  </Button>
                </Link>
                <Link to="/employee-portal">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Employee Portal
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
              <Card className="relative border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">John's Payslip</p>
                        <p className="text-sm text-muted-foreground">January 2026</p>
                      </div>
                    </div>
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Basic Salary</span>
                        <span className="font-medium text-success">$5,000.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">HRA</span>
                        <span className="font-medium text-success">$1,000.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Deduction</span>
                        <span className="font-medium text-destructive">-$500.00</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Net Pay</span>
                        <span className="text-primary">$5,500.00</span>
                      </div>
                    </div>
                    <Button className="w-full btn-gradient">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`card-hover border-0 ${index === 1 ? 'ring-2 ring-primary shadow-xl' : 'shadow-sm'}`}
              >
                <CardContent className="p-6">
                  {index === 1 && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== 'Custom' && plan.price !== 'Free' && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${index === 1 ? 'btn-gradient' : ''}`}
                    variant={index === 1 ? 'default' : 'outline'}
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Simplify Your Payroll?
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                Join thousands of businesses using Payly to generate professional payslips in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/demo">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Try Demo First
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
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
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Payly</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Payly. Free & Open Source.
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm">
              <Shield className="h-4 w-4" />
              Privacy-First • Open Source • Your Data, Your Control
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
