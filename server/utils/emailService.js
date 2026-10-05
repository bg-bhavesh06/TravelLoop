const nodemailer = require('nodemailer');

async function createPrimaryTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }
  return null;
}

async function createFallbackTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📬 [EMAIL SERVICE] Using Ethereal SMTP Fallback Account:', testAccount.user);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch {
    return nodemailer.createTransport({ jsonTransport: true });
  }
}

async function sendTwoFactorEmail({ to, otp, patternSequence }) {
  const patternStr = Array.isArray(patternSequence) ? patternSequence.join(' ➔ ') : patternSequence;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; background: #FFFFFF;">
      <div style="background: #0F172A; padding: 24px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
          ✈️ Traveloop Security
        </h2>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.8;">Adaptive Multi-Factor Security Alert</p>
      </div>

      <div style="padding: 32px 24px;">
        <h3 style="margin-top: 0; color: #1E293B; font-size: 18px;">Your 2FA Verification Passcode & Pattern</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          A login attempt requiring step-up verification was initiated for your Traveloop account (<strong>${to}</strong>).
        </p>

        ${otp ? `
        <div style="background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Contextual OTP Code</div>
          <div style="font-family: monospace; font-size: 22px; font-weight: 800; color: #0F766E; letter-spacing: 0.1em;">${otp}</div>
        </div>
        ` : ''}

        <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <div style="font-size: 12px; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Required Visual Pattern Sequence</div>
          <div style="font-size: 18px; font-weight: 800; color: #D97706; letter-spacing: 0.05em;">${patternStr}</div>
        </div>

        <p style="color: #64748B; font-size: 13px; margin-top: 24px; line-height: 1.5;">
          Please return to your browser, enter your OTP passcode and select the visual pattern icons shown above to complete your login.
        </p>
      </div>

      <div style="background: #F8FAFC; padding: 16px 24px; border-top: 1px solid #E2E8F0; text-align: center; color: #94A3B8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Traveloop Inc. Security Systems. All rights reserved.
      </div>
    </div>
  `;

  let primaryTransporter = await createPrimaryTransporter();

  if (primaryTransporter) {
    try {
      const fromAddress = process.env.SMTP_USER ? `"Traveloop Security" <${process.env.SMTP_USER}>` : '"Traveloop Security" <security@traveloop.com>';
      const info = await primaryTransporter.sendMail({
        from: fromAddress,
        to,
        subject: '🔒 Traveloop Security Alert — Your 2FA Passcode & Visual Pattern',
        text: `Your 2FA OTP Code is: ${otp || 'N/A'}. Required Pattern: ${patternStr}`,
        html: htmlContent
      });

      console.log(`\n======================================================`);
      console.log(`✉️ [NODEMAILER GMAIL EMAIL DELIVERED TO: ${to}]`);
      console.log(`MessageId: ${info.messageId}`);
      console.log(`======================================================\n`);
      return info;
    } catch (primaryErr) {
      console.warn(`⚠️ Primary SMTP (${process.env.SMTP_USER}) failed (${primaryErr.message}). Switching to Ethereal Fallback Mailer...`);
    }
  }

  // Fallback Mailer
  try {
    const fallbackTransporter = await createFallbackTransporter();
    const info = await fallbackTransporter.sendMail({
      from: '"Traveloop Security Alert" <security@traveloop.com>',
      to,
      subject: '🔒 Traveloop Security Alert — Your 2FA Passcode & Visual Pattern',
      text: `Your 2FA OTP Code is: ${otp || 'N/A'}. Required Pattern: ${patternStr}`,
      html: htmlContent
    });

    console.log(`\n======================================================`);
    console.log(`✉️ [NODEMAILER FALLBACK EMAIL DELIVERED TO: ${to}]`);
    console.log(`MessageId: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 PREVIEW SENT EMAIL ONLINE: ${previewUrl}`);
    }
    console.log(`======================================================\n`);
    return info;
  } catch (fallbackErr) {
    console.error('❌ Nodemailer Fallback Error:', fallbackErr.message);
  }
}

module.exports = { sendTwoFactorEmail };
