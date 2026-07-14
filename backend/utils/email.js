const nodemailer = require("nodemailer");

async function sendOTPEmail(email, otp, subjectType = "verification") {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const subject = subjectType === "reset" ? "Reset Password OTP - LedgerSplit" : "Verify Email OTP - LedgerSplit";
  const body = `Your LedgerSplit OTP is: ${otp}. It is valid for 5 minutes. Do not share it with anyone.`;

  if (!host || !user || !pass) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL SIMULATOR] To: ${email}`);
    console.log(`[EMAIL SIMULATOR] Subject: ${subject}`);
    console.log(`[EMAIL SIMULATOR] Body: ${body}`);
    console.log(`======================================================\n`);
    return true;
  }

  try {
    const transportConfig = {
      auth: { user, pass }
    };

    if (host.includes("gmail.com")) {
      transportConfig.service = "gmail";
    } else {
      transportConfig.host = host;
      transportConfig.port = Number(port) || 587;
      transportConfig.secure = Number(port) === 465;
    }

    const transporter = nodemailer.createTransport(transportConfig);

    console.log(`[SMTP Mailer] Attempting to send email to: ${email}...`);
    await transporter.sendMail({
      from: `"LedgerSplit" <${user}>`,
      to: email,
      subject,
      text: body,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #E5E7EB; border-radius: 16px;">
          <h2 style="color: #14532D; margin-bottom: 20px;">LedgerSplit</h2>
          <p style="font-size: 14px; color: #4B5563;">Here is your 6-digit verification code. Please enter this to complete your request:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 15px; margin: 20px 0; background: #E6F4EA; color: #14532D; border-radius: 12px;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #9CA3AF;">This code will expire in 5 minutes. If you did not request this email, please ignore it.</p>
        </div>
      `
    });
    return true;
  } catch (err) {
    console.error("SMTP Mail Send Error:", err);
    console.log(`\n[FALLBACK EMAIL LOG] OTP for ${email}: ${otp}\n`);
    return false;
  }
}

module.exports = { sendOTPEmail };
