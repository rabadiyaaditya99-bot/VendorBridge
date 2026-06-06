const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

/**
 * Creates the Nodemailer transporter using env variables or ethereal mock fallback
 */
const getTransporter = async () => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback to ethereal email for testing
  console.log("No SMTP details provided in .env, creating temporary Ethereal test account...");
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.error("Failed to create Ethereal test account, email fallback to logger.");
    return null;
  }
};

/**
 * Sends an email with the invoice PDF as an attachment
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} textMessage Text body
 * @param {string} relativePdfPath Path to PDF (relative to backend root)
 * @returns {Promise<boolean>}
 */
const sendInvoiceEmail = async (to, subject, textMessage, relativePdfPath) => {
  try {
    const transporter = await getTransporter();
    
    if (!transporter) {
      console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Message: ${textMessage} | Attachment: ${relativePdfPath}`);
      return true;
    }

    const attachments = [];
    if (relativePdfPath) {
      const absolutePath = path.join(__dirname, "../..", relativePdfPath);
      if (fs.existsSync(absolutePath)) {
        attachments.push({
          filename: path.basename(absolutePath),
          path: absolutePath,
        });
      } else {
        console.warn(`Attachment not found at: ${absolutePath}`);
      }
    }

    const mailOptions = {
      from: `"VendorBridge ERP" <${process.env.EMAIL_USER || "no-reply@vendorbridge.com"}>`,
      to,
      subject,
      text: textMessage,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb;">VendorBridge Procurement ERP</h2>
          <p>Hello,</p>
          <p>${textMessage.replace(/\n/g, "<br>")}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #9ca3af;">This is an automated system email from VendorBridge. Please do not reply directly to this message.</p>
        </div>
      `,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    
    // If using Ethereal, print the test preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    // Return true for local environment resilience, logging the failure
    return false;
  }
};

module.exports = { sendInvoiceEmail };
