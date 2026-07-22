import { Request, Response } from "express";
import { ExtractResult, processImageAndExtractInfo, processTextAndExtractInfo } from "../services/gemini.service";
import { Order } from "../types/models/order.model";
import { handleOrderReaction, notifyDeletedOrder, notifyNewOrder, notifyMessToAllClients } from "../services/orderSocketService";
import { broadcastPushNotification } from "../services/push.service";

export const newMsg = async (req: Request, res: Response) => {
    
    let extractedInfo: ExtractResult | null = null;
    let geminiError: string | null = null;

    const { 
        msg_id = "",
        type = "unknown", 
        text = "[Không xác định]", 
        url = null, 
        title = null 
    } = req.body;

    // Gọi Gemini — tách riêng try/catch để lỗi không làm mất toàn bộ đơn
    try {
        if (type === "photo" && url) {
            extractedInfo = await processImageAndExtractInfo(url);
        } else if (type === "text" && text) {
            extractedInfo = await processTextAndExtractInfo(text);
        }
    } catch (error: any) {
        // Gemini lỗi (quota, network, timeout,...) — ghi log, tiếp tục xử lý
        geminiError = error?.message || "Lỗi không xác định từ Gemini";
        console.warn("[Gemini] Không thể trích xuất thông tin, tiếp tục gửi order trống:", geminiError);
        notifyMessToAllClients(`[Gemini Error] ${geminiError}`);
    }

    try {
        const newOrderData: Order = {
            id: msg_id,
            address: extractedInfo?.don_hang?.dia_chi_day_du || extractedInfo?.don_hang?.dia_chi_goc || "Không xác định",
            phone: extractedInfo?.don_hang?.so_dien_thoai || "0000000000",
            img_url: url,
            raw_text: type === "text" ? text : undefined,
            createdAt: new Date()
        };

        if (extractedInfo?.la_don_hang) {
            notifyNewOrder(newOrderData);

            broadcastPushNotification({
                title: 'Đơn hàng mới!',
                body: `Bạn vừa nhận được đơn hàng mới tại: ${newOrderData.address}`,
                icon: newOrderData.img_url || '/icon.png',
                data: {
                    type: "new_order",
                    orderData: newOrderData
                }
            }).catch(e => console.error("Lỗi khi gửi push trong lúc nhận đơn:", e));

        } else {
            console.log("Không phải đơn hàng hoặc Gemini lỗi, không phát sự kiện:", extractedInfo);
        }

        res.json({
            msg: geminiError
                ? `Xử lý tin nhắn thành công (Gemini lỗi: ${geminiError})`
                : "Xử lý tin nhắn thành công",
            data: newOrderData
        });
    } catch (error: any) {
        res.status(500).json({
            msg: error.message || "Lỗi xử lý tin nhắn",
            data: null
        });
    }
};

export const reactionMsg = (req: Request, res: Response) => {
    // API nhận thả cảm xúc (chưa có chức năng cụ thể)
    const { msg_id, r_icon } = req.body;
    
    handleOrderReaction(r_icon, msg_id);
    
    res.json({
        msg: "không có lỗi gì hết"
    });
};

export const deleteMsg = (req: Request, res: Response) => {
    const { msg_id } = req.body;
    
    if (msg_id) {
        notifyDeletedOrder(msg_id);
    }

    res.json({
        msg: "Đã thông báo xóa đơn hàng"
    })

}