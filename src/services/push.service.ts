import webpush from 'web-push';
import { config } from '../config';

// Configure web-push
webpush.setVapidDetails(
    config.vapid.subject,
    config.vapid.publicKey,
    config.vapid.privateKey
);

export const sendPushNotification = async (subscription: webpush.PushSubscription, payload: any) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        console.log('Push notification sent successfully');
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};
