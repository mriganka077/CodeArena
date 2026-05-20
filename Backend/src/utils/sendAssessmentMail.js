import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendAssessmentMail = async ({
  candidateEmail,
  candidateName,
  driveName,
  status,
  reason,
  score,
}) => {
  let subject = "";
  let html = "";

  if (status === "Completed") {
    subject = `Assessment Completed Successfully - ${driveName}`;

    html = `...`;
  } else {
    subject = `Assessment Terminated - ${driveName}`;

    html = `...`;
  }

  await transporter.sendMail({
    from: `"AI Assessment Portal" <${process.env.MAIL_USER}>`,
    to: candidateEmail,
    subject,
    html,
  });
};

export default sendAssessmentMail;