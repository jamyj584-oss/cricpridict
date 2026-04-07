import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-primary text-textMain p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-accent mb-8 inline-block">&larr; Back to Home</Link>
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-textMuted mb-8">Last Updated: April 2026</p>

        <div className="space-y-6 text-sm text-white/80 leading-relaxed">
          <p>At CricPredict, we take data privacy seriously. Our systems are protected via Google Firebase Secure Networking layers.</p>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Data we Collect</h2>
            <p>We collect your Phone Number, Name, State of Residence, and PAN Card details specifically to enforce legislative compliance parameters related to regional restrictions and taxation norms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. How Data is Used</h2>
            <p>Your data is never sold to third-party ad providers. It is exclusively queried to determine legal eligibility to play real-money fantasy sports, and route transactions securely to your verified banking destinations.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
