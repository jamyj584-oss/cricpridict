import Link from "next/link";

export default function Terms() {
  return (
    <main className="min-h-screen bg-primary text-textMain p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-accent mb-8 inline-block">&larr; Back to Home</Link>
        
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-sm text-textMuted mb-8">Last Updated: April 2026</p>

        <div className="space-y-6 text-sm text-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. The Service</h2>
            <p>Welcome to CricPredict. These terms govern your use of the CricPredict fantasy sports platform. By accessing the application, you represent that you are at least 18 years of age and hold the legal capacity to enter into an agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. Regional Restrictions</h2>
            <p>Due to complex state-level legislation surrounding games of skill vs chance, users originating from the following states are strictly prohibited from participating in real-money formats: <strong>Assam, Odisha, Telangana, Andhra Pradesh, Nagaland, and Sikkim</strong>. Any attempt to bypass these restrictions via VPN or false declaration will result in immediate termination and forfeiture of funds.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. KYC & Withdrawals</h2>
            <p>Users must submit valid Government ID (PAN Card) before requesting any fund withdrawal. Withdrawals are processed within 1-2 business days. The platform reserves the right to halt transactions flagging suspicious activity.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">4. Responsible Gaming</h2>
            <p>This platform involves real monetary exchange and risks. We do not promote the usage of the platform as an income replacement strategy. If you feel you are developing unhealthy gaming habits, please lock your account via the settings panel immediately.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
