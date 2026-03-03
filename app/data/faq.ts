import type { FaqItem } from '@/components/home/faq';

export const faqItems: FaqItem[] = [
  {
    question: 'What is StockTrendTracker?',
    answer:
      'StockTrendTracker is a financial recovery platform that helps you track and receive funds from approved recovery programs. After you sign up and complete verification, you can see your balance, deposits, and withdrawal status in one dashboard.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Create a free account, verify your email, and complete your profile. If required by your recovery program, you may need to complete identity verification (KYC) and add your banking details. Once approved, you can view your balance and request withdrawals to your saved bank account.',
  },
  {
    question: 'What is KYC and why do I need it?',
    answer:
      'KYC (Know Your Customer) is a one-time identity check. We may ask you to upload a government-issued ID so we can verify your identity and comply with regulations. You’ll receive an email once your verification is approved. Until then, some features may be limited.',
  },
  {
    question: 'Which countries do you support for withdrawals?',
    answer:
      'We support bank payouts in Canada, Australia, New Zealand, and many European countries. When you add a bank account in your profile, you’ll enter your country and the relevant details (e.g. routing number, BSB, sort code, SWIFT/BIC, or IBAN). Withdrawals are only sent to saved, verified accounts.',
  },
  {
    question: 'How do I add or change my bank account?',
    answer:
      'Go to Profile (or Settings) and use the Banking section to add, edit, or remove bank accounts. You’ll need your account holder name, country, and the correct routing/BSB/sort/SWIFT/IBAN details for your region. We’ll send you an email when you add, update, or delete an account.',
  },
  {
    question: 'How do withdrawals work?',
    answer:
      'You request a withdrawal from your dashboard by entering the amount and choosing one of your saved bank accounts. We process requests according to our schedule and send funds to that account. You can track status in your dashboard; we don’t accept one-off bank details on the withdrawal form—only pre-saved accounts.',
  },
  {
    question: 'I need help. How do I contact support?',
    answer:
      'Use the Support section in your account to open a ticket. Describe your issue and we’ll respond as soon as possible. You can view and reply to your tickets from the same place. For account or withdrawal questions, always use the in-app support so we have full context.',
  },
  {
    question: 'Is my information secure?',
    answer:
      'Yes. We use industry-standard security practices to protect your data. Identity documents and personal details are handled in line with our privacy policy and applicable regulations. We only use your bank details to process approved withdrawals to your chosen account.',
  },
];
