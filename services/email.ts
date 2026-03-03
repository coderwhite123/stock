'use server';

import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'StockTrendTracker <onboarding@resend.dev>';
const APP_NAME = 'StockTrendTracker';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@stocktrendtracker.com';

function greeting(recipientName?: string | null): string {
  if (recipientName?.trim()) return `Dear ${recipientName.trim()},`;
  return 'Dear Valued Client,';
}

function emailSignature(): string {
  return `
    <p style="margin-top:28px;color:#555;font-size:14px;">
      Kind regards,<br/>
      <strong>The ${APP_NAME} Team</strong><br/>
      <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
    </p>
  `;
}

/** Send verification email via Resend (our own link). Use this instead of Supabase auth email to avoid rate limits. */
export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const link = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Verify your email address – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>Thank you for registering with ${APP_NAME}. To complete your account setup and access your dashboard, please verify your email address by clicking the link below:</p>
      <p><a href="${link}" style="color:#2563eb;text-decoration:underline;">Verify my email address</a></p>
      <p>This link will expire in 24 hours. If you did not create an account with us, you may safely ignore this message.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendDepositConfirmationEmail(
  email: string,
  amountBtc: string,
  txHash: string,
  confirmations: number,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Deposit confirmed – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>We are pleased to confirm that your Bitcoin deposit has been received and credited to your account.</p>
      <p><strong>Amount:</strong> ${amountBtc} BTC<br/>
      <strong>Confirmations:</strong> ${confirmations}<br/>
      <strong>Transaction ID:</strong> ${txHash}</p>
      <p>Your account balance has been updated accordingly. You may view the details in your dashboard at any time.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendWithdrawalRequestEmail(
  email: string,
  amountBtc: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Withdrawal request received – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>We have received your withdrawal request for <strong>${amountBtc} BTC</strong>.</p>
      <p>Our team will review your request and process it in accordance with our procedures. You will receive a separate notification once the review is complete.</p>
      <p>If you have any questions in the meantime, please do not hesitate to contact us.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendWithdrawalApprovalEmail(
  email: string,
  amountBtc: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Withdrawal approved – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>We are pleased to inform you that your withdrawal request for <strong>${amountBtc} BTC</strong> has been approved.</p>
      <p>Funds will be transferred to your designated bank account in accordance with our processing schedule. You will receive a further confirmation once the transfer has been initiated.</p>
      <p>Thank you for your patience and for choosing ${APP_NAME}.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendWithdrawalRejectionEmail(
  email: string,
  amountBtc: string,
  reason?: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Update on your withdrawal request – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>We are writing to inform you that your withdrawal request for <strong>${amountBtc} BTC</strong> could not be completed at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you have any questions or would like to discuss your options, please contact our support team and we will be happy to assist you.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

/** Notify user when a refund manager is assigned to them. */
export async function sendManagerAssignedEmail(
  email: string,
  managerName: string,
  managerEmail: string,
  managerPhone?: string | null,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const managerContact = [
    `<strong>${managerName}</strong>`,
    `Email: <a href="mailto:${managerEmail}">${managerEmail}</a>`,
    managerPhone ? `Phone: ${managerPhone}` : null,
  ]
    .filter(Boolean)
    .join('<br/>');
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your refund manager – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>We are pleased to let you know that a dedicated refund manager has been assigned to your account.</p>
      <p><strong>Your assigned manager:</strong></p>
      <p>${managerContact}</p>
      <p>Your assigned manager will reach out to you as soon as possible to walk you through your refund process. You can also contact them directly using the details above if you have any questions.</p>
      <p>Thank you for choosing ${APP_NAME}.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

const QR_API = 'https://api.qrserver.com/v1/create-qr-code';

export async function sendWalletAssignedEmail(
  email: string,
  btcAddress: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const qrUrl = `${QR_API}/?size=200x200&data=${encodeURIComponent(btcAddress)}`;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your Bitcoin deposit address – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>A dedicated Bitcoin (BTC) deposit address has been assigned to your account. You may use this address to receive deposits that will be credited to your balance after network confirmation.</p>
      <p><img src="${qrUrl}" alt="QR code for BTC address" width="200" height="200" style="display:block;margin:16px 0;" /></p>
      <p><strong>Your deposit address:</strong><br/><code style="background:#f5f5f5;padding:8px;word-break:break-all;font-size:13px;">${btcAddress}</code></p>
      <p>Please send only Bitcoin (BTC) to this address. Sending any other asset may result in loss of funds.</p>
      <p>You can view this address and your balance at any time from your dashboard.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendWalletRemovedEmail(email: string, recipientName?: string | null) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Bitcoin deposit address removed – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>This is to inform you that the Bitcoin deposit address previously assigned to your account has been removed and is no longer active.</p>
      <p>Please do not send funds to that address. If you require a new deposit address, please log in to your dashboard to generate one or contact our support team for assistance.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendBalanceCreditedEmail(
  email: string,
  amountBtc: string,
  note?: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Account credited – ${amountBtc} BTC – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>We are writing to confirm that <strong>${amountBtc} BTC</strong> has been credited to your account. Your balance has been updated accordingly.</p>
      ${note ? `<p><strong>Reference note:</strong> ${note}</p>` : ''}
      <p>You may view your current balance and submit withdrawal requests at any time from your dashboard.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendBalanceDebitedEmail(
  email: string,
  amountBtc: string,
  note?: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Account debited – ${amountBtc} BTC – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>This is to confirm that <strong>${amountBtc} BTC</strong> has been debited from your account. Your balance has been updated accordingly.</p>
      ${note ? `<p><strong>Reference note:</strong> ${note}</p>` : ''}
      <p>You may view your current balance and transaction history at any time from your dashboard. If you have any questions regarding this debit, please contact our support team.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendKycApprovedEmail(email: string, recipientName?: string | null) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Identity verification approved – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>We are pleased to inform you that your identity verification (KYC) has been approved. Your account is now verified.</p>
      <p>Thank you for completing this process. If you have any questions, please contact our support team.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

/** Notify user when an admin replies to their support ticket. */
export async function sendTicketReplyEmail(
  email: string,
  ticketSubject: string,
  ticketId: string,
  replyBody: string,
  supportUrl: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const safeBody = replyBody.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
  const ticketUrl = `${supportUrl.replace(/\/$/, '')}/support/${ticketId}`;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `New reply on your support ticket – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>Our team has replied to your support ticket.</p>
      <p><strong>Ticket:</strong> ${ticketSubject.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      <p><strong>Reply:</strong></p>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px;margin:8px 0;">${safeBody}</p>
      <p><a href="${ticketUrl}" style="color:#2563eb;text-decoration:underline;">View ticket and reply</a></p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendBankAccountAddedEmail(
  email: string,
  bankName: string,
  accountLast4: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Bank account added – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>This is to confirm that a new bank account has been added to your account.</p>
      <p><strong>Bank:</strong> ${bankName}<br/><strong>Account ending in:</strong> ${accountLast4}</p>
      <p>You may use this account when submitting withdrawal requests. If you did not make this change, please contact our support team immediately.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendBankAccountUpdatedEmail(
  email: string,
  bankName: string,
  accountLast4: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Bank account updated – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>This is to confirm that your saved bank account details have been updated.</p>
      <p><strong>Bank:</strong> ${bankName}<br/><strong>Account ending in:</strong> ${accountLast4}</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}

export async function sendBankAccountDeletedEmail(
  email: string,
  bankName: string,
  accountLast4: string,
  recipientName?: string | null
) {
  const resend = getResend();
  if (!resend) return { error: new Error('Resend not configured') };
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Bank account removed – ${APP_NAME}`,
    html: `
      <p>${greeting(recipientName)}</p>
      <p>This is to confirm that a bank account has been removed from your account.</p>
      <p><strong>Bank:</strong> ${bankName}<br/><strong>Account ending in:</strong> ${accountLast4}</p>
      <p>You will need to add a new bank account if you wish to submit future withdrawal requests. If you did not make this change, please contact our support team immediately.</p>
      ${emailSignature()}
    `,
  });
  return { error };
}
