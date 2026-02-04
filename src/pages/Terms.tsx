import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
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
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: February 4, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Payly, you agree to be bound by these Terms and Conditions. 
              If you disagree with any part of these terms, you may not access our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Open Source License</h2>
            <p className="text-muted-foreground">
              Payly is open-source software, freely available for use, modification, and distribution 
              under the terms of our open-source license. You are encouraged to contribute to the 
              project and help make it better for everyone.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              When you create an account with us, you must provide accurate, complete, and current 
              information. Failure to do so constitutes a breach of the Terms.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You are responsible for safeguarding your account credentials</li>
              <li>You agree to notify us immediately of any unauthorized access</li>
              <li>You may not use another user's account without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to use the service:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>In any way that violates applicable laws or regulations</li>
              <li>To transmit harmful code or interfere with the service</li>
              <li>To attempt to gain unauthorized access to any systems</li>
              <li>To infringe on the rights of others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data. However, 
              no method of transmission over the Internet is 100% secure. While we strive to 
              protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Payly is provided "as is" without warranties of any kind. We shall not be liable 
              for any indirect, incidental, special, consequential, or punitive damages resulting 
              from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of 
              any material changes by posting the new Terms on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us through our 
              official channels.
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
