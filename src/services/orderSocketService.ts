import { io } from '../socket';
import { Order } from '../types/models/order.model';

/**
 * Phát sự kiện thông báo có đơn hàng mới tới tất cả các client đang kết nối.
 * @param orderData Dữ liệu của đơn hàng mới
 */
export const notifyNewOrder = (orderData: Order) => {
    if (io) {
        io.emit('new_order', orderData);
        console.log('Đã gửi event new_order:', orderData);
    }
};

/**
 * Kiểm tra reaction, nếu là "/-heart" thì phát sự kiện go_ship kèm theo msg_id của đơn.
 * @param reaction Nội dung reaction nhận được
 * @param msg_id ID của đơn (msg_id)
 */
export const handleOrderReaction = (reaction: string, msg_id: string) => {
    if (reaction === '/-heart') {
        if (io) {
            io.emit('go_ship', { msg_id: msg_id });
            console.log(`Đã gửi event go_ship cho msg_id: ${msg_id}`);
        }
    }
};

/**
 * Phát sự kiện thông báo một đơn hàng đã bị xóa.
 * @param msg_id ID của đơn bị xóa (msg_id)
 */
export const notifyDeletedOrder = (msg_id: string) => {
    if (io) {
        io.emit('deleted_oder', { msg_id: msg_id });
        console.log(`Đã gửi event deleted_oder cho msg_id: ${msg_id}`);
    }
};

export const notifyMessToAllClients = (msg: string) => {
    if (io) {
        io.emit('server_message', { msg: msg });
    }
}