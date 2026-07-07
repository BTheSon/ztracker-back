import { Request, Response } from "express";

export const newMsg = async (req: Request, res: Response) => {
    try {
        const { 
            type = "unknown", 
            text = "[Không xác định]", 
            url = null, 
            title = null 
        } = req.body;

        let imageBuffer: Buffer | null = null;

        // Xử lý nếu type là photo
        if (type === "photo" && url) {
            // Dùng fetch (có sẵn trong Node 18+) để lấy dữ liệu thay vì cài thêm thư viện
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load image from URL: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer); // Đối tượng ảnh dưới dạng Buffer
        }

        res.json({
            success: true,
            data: { type, text, url, title, hasImage: !!imageBuffer }
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