export const metadata = {
  title: 'Terms of Service — Fresh Choice',
};

export default function TermsPage() {
  return (
    <div style={{ padding: '8rem 0 5rem', minHeight: '80vh', background: 'var(--fc-cream-50)' }}>
      <div className="container-sm" style={{ background: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 className="heading-lg" style={{ color: 'var(--fc-green-900)', marginBottom: '1.5rem' }}>Terms of Service</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
          Welcome to Fresh Choice! These terms and conditions outline the rules and regulations for the use of Fresh Choice's Website, located at fresh-choice-nine.vercel.app.
        </p>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
          By accessing this website we assume you accept these terms and conditions. Do not continue to use Fresh Choice if you do not agree to take all of the terms and conditions stated on this page.
        </p>
        <h2 className="heading-sm" style={{ color: 'var(--fc-green-800)', marginTop: '2rem', marginBottom: '0.75rem' }}>License</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
          Unless otherwise stated, Fresh Choice and/or its licensors own the intellectual property rights for all material on Fresh Choice. All intellectual property rights are reserved. You may access this from Fresh Choice for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <h2 className="heading-sm" style={{ color: 'var(--fc-green-800)', marginTop: '2rem', marginBottom: '0.75rem' }}>Delivery Policy</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
          We prepare meals fresh daily in our kitchen and deliver based on selected time slots. Deliveries depend on the zone chosen at checkout, and fees apply accordingly. Please ensure someone is available at the address to receive the delivery.
        </p>
      </div>
    </div>
  );
}
