import webpush from 'web-push';
import { config } from '../config';

// Configure web-push
webpush.setVapidDetails(
    config.vapid.subject,
    config.vapid.publicKey,
    config.vapid.privateKey
);

import db from '../config/db';

export const sendPushNotification = async (subscription: webpush.PushSubscription, payload: any) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error) {
        throw error;
    }
};

export const broadcastPushNotification = async (payload: { title: string; body: string; icon?: string; url?: string }) => {
    try {
        const result = await db.query('SELECT * FROM push_subscriptions');
        const subscriptions = result.rows;
        
        let successCount = 0;

        for (const row of subscriptions) {
            const sub = {
                endpoint: row.endpoint,
                keys: {
                    p256dh: row.p256dh,
                    auth: row.auth
                }
            };

            try {
                await sendPushNotification(sub, payload);
                successCount++;
            } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint]);
                }
            }
        }
        return successCount;
    } catch (error) {
        console.error('Lỗi broadcast push notification:', error);
        return 0;
    }
};
