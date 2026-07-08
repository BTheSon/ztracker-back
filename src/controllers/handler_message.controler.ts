import { Request, Response } from "express";
import { processImageAndExtractInfo } from "../services/gemini.service";

export const newMsg = async (req: Request, res: Response) => {
    try {
        const { 
            type = "unknown", 
            text = "[Không xác định]", 
            url = null, 
            title = null 
        } = req.body;

        let extractedInfo = null;

        // Xử lý nếu type là photo, tách riêng logic nghiệp vụ vào service
        if (type === "photo" && url) {
            extractedInfo = await processImageAndExtractInfo(url);
        }

        res.json({
            success: true,
            data: { 
                type, 
                text, 
                url, 
                title, 
                geminiExtraction: extractedInfo 
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi xử lý tin nhắn"
        });
    }
};

export const reactionMsg = (req: Request, res: Response) => {
    // API nhận thả cảm xúc (chưa có chức năng cụ thể)
    const { messageId, reaction } = req.body;
    
    // TODO: Xử lý logic thả cảm xúc
    
    res.json({
        success: true,
        message: "Đã nhận cảm xúc"
    });
};