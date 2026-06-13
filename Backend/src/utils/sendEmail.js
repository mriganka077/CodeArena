import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify();
  console.log("SMTP Connected");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export const verificationEmailHTML = (firstName, verifyURL) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto;
              background: #0d0d1a; color: #fff; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #6C63FF, #2A1454);
                padding: 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">CodeArena</h1>
      <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Verify your email address</p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; margin-top: 0;">Hi <strong>${firstName}</strong>,</p>
      <p style="color: #a1a1aa; line-height: 1.6;">
        Thanks for signing up! Click the button below to verify your email.
        This link expires in <strong style="color: #fff;">24 hours</strong>.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyURL}"
           style="background: linear-gradient(135deg, #6C63FF, #4f46e5); color: #fff;
                  padding: 14px 32px; border-radius: 12px; text-decoration: none;
                  font-weight: 600; font-size: 15px; display: inline-block;">
          Verify Email →
        </a>
      </div>
      <p style="color: #52525b; font-size: 12px; text-align: center;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>
  </div>
`;

export const otpEmailHTML = (otp) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto;
              background: #0d0d1a; color: #fff; border-radius: 16px; overflow: hidden;">
    
    <!-- Header (same as verification) -->
    <div style="background: linear-gradient(135deg, #6C63FF, #2A1454);
                padding: 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">CodeArena</h1>
      <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Your OTP Code</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px; text-align: center;">
      <p style="font-size: 16px; margin-top: 0;">
        Use the OTP below to continue:
      </p>

      <!-- OTP Box -->
      <div style="margin: 28px 0;">
        <span style="display: inline-block;
                     background: linear-gradient(135deg, #6C63FF, #4f46e5);
                     padding: 14px 28px;
                     border-radius: 12px;
                     font-size: 28px;
                     letter-spacing: 6px;
                     font-weight: 600;">
          ${otp}
        </span>
      </div>

      <p style="color: #a1a1aa; line-height: 1.6;">
        This OTP will expire in 
        <strong style="color: #fff;">5 minutes</strong>.
      </p>

      <p style="color: #52525b; font-size: 12px; margin-top: 30px;">
        Do not share this code with anyone.
      </p>
    </div>
  </div>
`;