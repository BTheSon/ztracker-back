import { Request, Response } from "express";
import { ExtractResult, processImageAndExtractInfo, processTextAndExtractInfo } from "../services/gemini.service";

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

        res.json({
            msg: "Xử lý tin nhắn thành công", // Bổ sung dòng này
            data: { 
                type, 
                text, 
                url, 
                title, 
                geminiExtraction: extractedInfo 
            }
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
    
    //TODO: 
    
    res.json({
        msg: "không có lỗi gì hết"
    });
};