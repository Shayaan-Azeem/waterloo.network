import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, code: string) {
    if (!resend) {
        console.log(`[DEV] Email to ${email}: Your verification code is ${code}`);
        return true;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Webring <noreply@uwaterloo.network>',
            to: [email],
            subject: 'Your Verification Code',
            html: `<p>Your verification code is: <strong>${code}</strong></p>`,
        });

        if (error) {
            console.error('Resend Error:', error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Email Send Error:', e);
        return false;
    }
}
