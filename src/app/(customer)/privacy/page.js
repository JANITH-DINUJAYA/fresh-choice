export const metadata = {
  title: 'Privacy Policy — Fresh Choice',
};

export default function PrivacyPage() {
  return (
    <div style={{ padding: '8rem 0 5rem', minHeight: '80vh', background: 'var(--fc-cream-50)' }}>
      <div className="container-sm" style={{ background: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 className="heading-lg" style={{ color: 'var(--fc-green-900)', marginBottom: '1.5rem' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
          At Fresh Choice, accessible from fresh-choice-nine.vercel.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Fresh Choice and how we use it.
        </p>
        <h2 className="heading-sm" style={{ color: 'var(--fc-green-800)', marginTop: '2rem', marginBottom: '0.75rem' }}>Information We Collect</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
          If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
        </p>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
          When you register for an Account or place an order, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.
        </p>
        <h2 className="heading-sm" style={{ color: 'var(--fc-green-800)', marginTop: '2rem', marginBottom: '0.75rem' }}>How We Use Your Information</h2>
        <ul style={{ color: 'var(--color-text-muted)', paddingLeft: '1.5rem', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
          <li>Process your transactions and deliveries</li>
        </ul>
      </div>
    </div>
  );
}
