import { Request, Response } from 'express';
import { config } from '../config';
import { sendPushNotification } from '../services/push.service';
import db from '../config/db';

export const getVapidPublicKey = (req: Request, res: Response) => {
    res.json({
        data: {
            publicKey: config.vapid.publicKey
        }
    });
};

export const subscribe = async (req: Request, res: Response) => {
    try {
        const subscription = req.body;
        const endpoint = subscription.endpoint;
        const p256dh = subscription.keys?.p256dh;
        const auth = subscription.keys?.auth;

        if (!endpoint || !p256dh || !auth) {
            return res.status(400).json({ msg: 'Thiếu thông tin keys bắt buộc của Subscription' });
        }

        // Lưu hoặc cập nhật vào Database (ON CONFLICT xử lý trùng lặp endpoint)
        const query = `
            INSERT INTO push_subscriptions (endpoint, p256dh, auth) 
            VALUES ($1, $2, $3)
            ON CONFLICT (endpoint) DO UPDATE 
            SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth;
        `;
        await db.query(query, [endpoint, p256dh, auth]);

        console.log('Đã đăng ký Web Push thành công cho thiết bị:', endpoint);
        
        res.status(201).json({
            msg: 'Đăng ký nhận thông báo thành công'
        });
    } catch (error) {
        console.error('Lỗi lưu subscription:', error);
        res.status(500).json({ msg: 'Lỗi server khi lưu đăng ký' });
    }
};

// Endpoint để test gửi thông báo (Frontend có thể gọi thử)
export const testPush = async (req: Request, res: Response) => {
    const { title, body } = req.body;
    
    const payload = {
        title: title || 'Thông báo mới',
        body: body || 'Đây là tin nhắn test từ Backend!',
        icon: '/icon.png', // Thay đổi icon tuỳ FE
    };

    let successCount = 0;
    
    try {
        // Lấy tất cả subs từ DB
        const result = await db.query('SELECT * FROM push_subscriptions');
        const subscriptions = result.rows;

        for (const row of subscriptions) {
            // Định dạng lại theo chuẩn web-push cần
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
                console.error('Lỗi khi gửi thông báo đến endpoint:', sub.endpoint);
                // Gợi ý: Nếu lỗi 410 (Gone) nghĩa là người dùng đã hủy đăng ký, có thể xóa dòng này khỏi DB
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint]);
                    console.log('Đã xóa subscription hết hạn:', row.endpoint);
                }
            }
        }

        res.json({
            msg: `Đã gửi thông báo thành công đến ${successCount} thiết bị`
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn DB gửi push:', error);
        res.status(500).json({ msg: 'Lỗi server khi test gửi push' });
    }
};
