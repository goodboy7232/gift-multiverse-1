export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>

      <div className="space-y-8">
        {[
          {
            title: "1. Information We Collect",
            body: `We collect information you provide directly: username, hashed password, and hashed safe key. We do not collect email addresses or phone numbers. We also collect transaction records, IP addresses for fraud prevention, and usage data such as pages visited and purchases made.`,
          },
          {
            title: "2. How We Use Your Information",
            body: `We use your information to: provide and improve the Service, process transactions and maintain transaction records, prevent fraud and enforce our Terms of Service, analyze usage patterns to improve the product, and respond to your support requests.`,
          },
          {
            title: "3. Data Storage and Security",
            body: `All passwords and safe keys are stored as one-way cryptographic hashes (bcrypt). Gift card codes submitted for sale are stored encrypted at rest. We use industry-standard security practices including HTTPS encryption for all data in transit. We retain transaction records for 7 years to comply with applicable regulations.`,
          },
          {
            title: "4. Data Sharing",
            body: `We do not sell your personal data. We may share information with: service providers who help us operate the platform (e.g., database hosting), law enforcement when legally required, and successor companies in the event of a merger or acquisition.`,
          },
          {
            title: "5. Cookies and Tracking",
            body: `We use session cookies to maintain your logged-in state. We do not use third-party advertising cookies. We may use analytics tools to understand usage patterns. You can disable cookies in your browser settings, but this may affect functionality.`,
          },
          {
            title: "6. Your Rights",
            body: `You may request deletion of your account and associated data at any time via our Contact page. We will process deletion requests within 30 days, subject to legal retention requirements. You may request a copy of the data we hold about you.`,
          },
          {
            title: "7. Children's Privacy",
            body: `Our Service is not directed to users under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.`,
          },
          {
            title: "8. Changes to This Policy",
            body: `We may update this Privacy Policy periodically. We will notify users of material changes by posting the new policy on this page with a new "Last updated" date. Your continued use of the Service after changes constitutes acceptance.`,
          },
          {
            title: "9. Contact",
            body: `For privacy questions, data deletion requests, or data access requests, please use our Contact page. We will respond within 10 business days.`,
          },
        ].map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
            <p className="text-muted-foreground leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
