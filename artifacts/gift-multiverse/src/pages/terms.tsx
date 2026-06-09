export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>

      <div className="prose prose-invert max-w-none space-y-8">
        {[
          {
            title: "1. Acceptance of Terms",
            body: `By accessing and using Gift Multiverse ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. We reserve the right to modify these terms at any time. Continued use of the Service following any changes constitutes acceptance of those changes.`,
          },
          {
            title: "2. Account Registration",
            body: `You must create an account to buy or sell gift cards. You are responsible for maintaining the confidentiality of your password and Safe Key. You are responsible for all activity that occurs under your account. You may not share your account, and you must notify us immediately of any unauthorized use. Each user is permitted one account only.`,
          },
          {
            title: "3. Safe Key",
            body: `Upon registration, you will receive a unique Safe Key displayed once. This key is your sole means of password recovery. Gift Multiverse cannot recover, reset, or provide access to any Safe Key after initial display. You are solely responsible for storing your Safe Key in a secure location.`,
          },
          {
            title: "4. Buying Gift Cards",
            body: `All purchases are final. Gift card codes are delivered digitally and immediately upon purchase. If a code you purchased is invalid, stolen, or has been previously used, you must contact support within 48 hours. We will investigate and, at our discretion, provide a replacement or refund. We do not guarantee that any specific card will remain available.`,
          },
          {
            title: "5. Selling Gift Cards",
            body: `By submitting a gift card for sale, you represent that you own the card, that it has the stated balance, and that it is valid and unused. Submitting fraudulent cards is strictly prohibited and will result in account termination and potential legal action. We retain a 10% platform fee from all approved sales. Approval is at our sole discretion.`,
          },
          {
            title: "6. Prohibited Activities",
            body: `You may not use the Service to submit stolen, fraudulent, or counterfeit gift cards; to engage in money laundering; to create multiple accounts; to reverse-engineer or scrape the Service; to harass other users; or for any illegal purpose. Violation of these prohibitions will result in immediate account termination.`,
          },
          {
            title: "7. Limitation of Liability",
            body: `Gift Multiverse is not liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability to you for any cause of action will not exceed the amount paid by you to us in the six months preceding the claim. We make no warranties about the availability, accuracy, or reliability of the Service.`,
          },
          {
            title: "8. Governing Law",
            body: `These Terms are governed by the laws of the applicable jurisdiction, without regard to conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration.`,
          },
          {
            title: "9. Contact",
            body: `For questions about these Terms, please contact us through our Contact page. We will respond within 5 business days.`,
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
