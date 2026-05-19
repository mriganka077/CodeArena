import { sendEmail } from "../utils/sendEmail.js";

export const sendShortlistMail = async (req, res) => {

    try {

        const { email, subject, body } = req.body;

        await sendEmail({
            to: email,
            subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    font-family:'Segoe UI',sans-serif;
                ">

                    <div style="
                        max-width:680px;
                        margin:40px auto;
                        background:#111827;
                        border-radius:24px;
                        overflow:hidden;
                        border:1px solid rgba(255,255,255,0.08);
                        box-shadow:0 20px 60px rgba(0,0,0,0.45);
                    ">

                        <!-- Top Gradient -->
                        <div style="
                            background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);
                            padding:50px 40px;
                            text-align:center;
                        ">

                            <h1 style="
                                margin:0;
                                color:#fff;
                                font-size:34px;
                                font-weight:800;
                                letter-spacing:-1px;
                            ">
                                CodeArena
                            </h1>

                            <p style="
                                margin-top:12px;
                                color:rgba(255,255,255,0.82);
                                font-size:15px;
                            ">
                                Recruitment & Talent Team
                            </p>

                        </div>

                        <!-- Body -->
                        <div style="
                            padding:50px 42px;
                            color:#e5e7eb;
                        ">

                            <div style="
                                display:inline-block;
                                padding:8px 16px;
                                border-radius:999px;
                                background:rgba(99,102,241,0.14);
                                color:#a5b4fc;
                                font-size:12px;
                                font-weight:700;
                                letter-spacing:1px;
                                text-transform:uppercase;
                                margin-bottom:24px;
                            ">
                                Candidate Shortlisted
                            </div>

                            <h2 style="
                                margin:0 0 20px;
                                color:#fff;
                                font-size:28px;
                                line-height:1.3;
                            ">
                                Congratulations 
                            </h2>

                            <div style="
                                color:#d1d5db;
                                font-size:16px;
                                line-height:1.9;
                                white-space:pre-line;
                            ">
                                ${body}
                            </div>

                            <!-- CTA -->
                            <div style="
                                margin-top:40px;
                                text-align:center;
                            ">

                                <a href="http://localhost:5173"
                                style="
                                    display:inline-block;
                                    background:linear-gradient(135deg,#6366f1,#8b5cf6);
                                    color:#fff;
                                    text-decoration:none;
                                    padding:16px 34px;
                                    border-radius:16px;
                                    font-weight:700;
                                    font-size:15px;
                                    box-shadow:0 12px 30px rgba(99,102,241,0.35);
                                ">
                                    Visit CodeArena
                                </a>

                            </div>

                        </div>

                        <!-- Footer -->
                        <div style="
                            border-top:1px solid rgba(255,255,255,0.06);
                            padding:28px 40px;
                            background:#0f172a;
                        ">

                            <p style="
                                margin:0;
                                color:#94a3b8;
                                font-size:13px;
                                line-height:1.7;
                                text-align:center;
                            ">
                                © 2026 CodeArena Recruitment Team <br/>
                                This email was sent regarding your recruitment process.
                            </p>

                        </div>

                    </div>

                </body>
                </html>
                `
        });

        res.status(200).json({
            success: true,
            message: "Mail sent successfully",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to send mail",
        });
    }
};