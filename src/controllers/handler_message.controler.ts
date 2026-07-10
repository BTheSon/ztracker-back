import { Request, Response } from "express";
import { ExtractResult, processImageAndExtractInfo, processTextAndExtractInfo } from "../services/gemini.service";
import { Order } from "../types/models/order.model";
import { handleOrderReaction, notifyDeletedOrder, notifyNewOrder } from "../services/orderSocketService";

export const newMsg = async (req: Request, res: Response) => {
    
    let extractedInfo: ExtractResult | null = null;
    try {
        const { 
            msg_id = "",
            type = "unknown", 
            text = "[Không xác định]", 
            url = null, 
            title = null 
        } = req.body;

        // Xử lý nếu type là photo, tách riêng logic nghiệp vụ vào service
        if (type === "photo" && url) {
            extractedInfo = await processImageAndExtractInfo(url);
        } else if (type === "text" && text) {
            extractedInfo = await processTextAndExtractInfo(text);
        }

        const newOrderData: Order = {
            id: msg_id,
            address: extractedInfo?.don_hang?.dia_chi_day_du || "Không xác định",
            phone: extractedInfo?.don_hang?.so_dien_thoai || "0000000000",
            img_url:url,
            createdAt: new Date()
        }

        if (extractedInfo?.la_don_hang) {
            notifyNewOrder(newOrderData);
        }else {
            console.log("Không phải đơn hàng, không phát sự kiện:", extractedInfo);
        }

        res.json({
            msg: "Xử lý tin nhắn thành công", // Bổ sung dòng này
            data: newOrderData
        });
    } catch (error: any) {
        // Lưu ý: res.status(500).json(...) ở đây cũng phải khớp với BaseResponse
        res.status(500).json({
            msg: error.message || "Lỗi xử lý tin nhắn",
            data: extractedInfo
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