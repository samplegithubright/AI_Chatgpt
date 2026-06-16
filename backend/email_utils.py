import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "LLM GPT")

def send_otp_email(email: str, otp: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
        msg['To'] = email
        msg['Subject'] = f"{otp} is your LLM GPT verification code"

        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #3b82f6; text-align: center;">LLM GPT</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Use the following code to verify your identity:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; margin: 20px 0; border-radius: 5px;">
                        {otp}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6b7280; text-align: center;">
                        &copy; 2024 LLM GPT. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"OTP email sent successfully to {email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
