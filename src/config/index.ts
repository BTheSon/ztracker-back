import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    vapid: {
        publicKey: process.env.VAPID_PUBLIC_KEY || '',
        privateKey: process.env.VAPID_PRIVATE_KEY || '',
        subject: process.env.VAPID_SUBJECT || 'mailto:admin@ztracker.com',
    }
};
