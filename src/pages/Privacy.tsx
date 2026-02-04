import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: February 4, 2026
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-primary mb-2">Our Commitment</h3>
            <p className="text-muted-foreground mb-0">
              Payly is built on privacy-first principles. Your data belongs to you. 
              We are transparent about what we collect and why, and we never sell your data.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials</li>
              <li><strong>Organization Data:</strong> Firm, client, and employee details you enter</li>
              <li><strong>Payroll Data:</strong> Salary components, deductions, and payslip information</li>
              <li><strong>Usage Data:</strong> How you interact with our service (anonymized)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process payroll and generate payslips</li>
              <li>Send you important service notifications</li>
              <li>Protect against unauthorized access and abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement robust security measures to protect your sensitive financial data:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Encryption:</strong> All data is encrypted in transit (TLS) and at rest</li>
              <li><strong>Access Control:</strong> Strict role-based access control (RBAC)</li>
              <li><strong>Audit Logging:</strong> Comprehensive logging for security monitoring</li>
              <li><strong>Regular Updates:</strong> Security patches applied promptly</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or rent your personal information. We may share data only:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>With your consent or at your direction</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. On-Premise Deployment</h2>
            <p className="text-muted-foreground">
              For organizations requiring maximum data control, Payly supports on-premise 
              deployment. With on-premise hosting, all your data stays within your own 
              infrastructure, giving you complete ownership and control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Open Source Transparency</h2>
            <p className="text-muted-foreground">
              As an open-source project, our codebase is publicly auditable. You can review 
              exactly how we handle your data, verify our security practices, and contribute 
              improvements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new policy on this page and updating the 
              "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or your data, please contact 
              us through our official channels.
            </p>
          </section>
        </div>
      </main>
      
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Payly — Free, Open Source, Privacy-First Payroll</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
