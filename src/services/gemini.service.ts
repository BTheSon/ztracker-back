import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { config } from '../config';
import { normalizePhone } from '../utils/mormalize_phone';

// Khởi tạo Gemini client với API Key từ biến môi trường
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Prompt tối ưu token: ngắn gọn, xử lý 1 ảnh = 1 đơn hàng
const EXTRACTION_PROMPT_PHOTO = `Trích SĐT, địa chỉ, nội dung đặt hàng từ ảnh (VN/binhdinh/quynhon). Ảnh chỉ chứa 1 đơn hàng.

Địa chỉ hợp lệ có thể là: số nhà+đường, chỉ tên đường, tên địa danh (chợ, ngã ba, khu vực...), hoặc tên cửa hàng/quán/công ty — KHÔNG bắt buộc phải có số nhà. Nếu địa chỉ gốc chỉ là tên địa danh/quán, giữ nguyên như vậy, không cố suy diễn thêm số nhà không có trong ảnh.
Địa chỉ viết tắt -> suy ra đầy đủ theo khu vực; giữ nguyên số nhà/ký hiệu nếu có. xuất địe chỉ chỉ có thể là số nhà+đường, chỉ tên đường, tên địa danh (chợ, ngã ba, khu vực...), hoặc tên cửa hàng/quán/công ty — KHÔNG bắt buộc phải có số nhà. Nếu địa chỉ gốc chỉ là tên địa danh/quán, giữ nguyên như vậy, không cố suy diễn thêm số nhà không có trong ảnh.
Nếu phải suy đoán giữa ≥2 đường/địa danh khả dĩ trùng tên -> chọn đường/địa danh lớn, phổ biến hơn, nhưng đánh dấu do_tin_cay_dia_chi tối đa "trung_binh" (không được để "cao").
Nếu ảnh có nhiều hơn 1 SĐT hoặc nhiều hơn 1 địa chỉ (vd: số/địa chỉ shop in sẵn trên hóa đơn lẫn số/địa chỉ viết tay của khách) -> ưu tiên lấy SĐT và địa chỉ gắn với người nhận/giao hàng, không lấy của người gửi/shop.
SĐT: kiểm tra hợp lệ (đủ 10 số, đầu số 03/05/07/08/09). Nếu không chắc do OCR (số bị mờ, dễ nhầm 0/8, 1/7...) -> giữ số đọc được, ghi chú nghi ngờ vào ghi_chu_don_hang (vd: "SĐT có thể đọc sai, cần xác nhận lại").
Có tên người nhận trong ảnh -> ghi vào ghi_chu_don_hang.
Không có SĐT/địa chỉ -> mô tả ảnh vào noi_dung_khac.
Chỉ trả JSON, đúng schema:
{"don_hang":{"so_dien_thoai":"","dia_chi_goc":"","dia_chi_day_du":"","ghi_chu_don_hang":"","do_tin_cay_dia_chi":"cao|trung_binh|thap"},"noi_dung_khac":""}`;

// Prompt riêng cho input dạng text (đơn hàng dạng chữ, không phải ảnh)
const EXTRACTION_PROMPT_TEXT = `Trích SĐT, địa chỉ, tên người nhận, nội dung đặt hàng từ đoạn text (VN/binhdinh/quynhon).
Trước tiên xác định text có phải nội dung đặt hàng không (có món/số lượng/size, hoặc SĐT/địa chỉ liên quan giao hàng...).
Nếu KHÔNG phải đơn hàng (tin nhắn hỏi han, chat linh tinh, quảng cáo, spam...) -> đặt "la_don_hang": false, để trống các trường còn lại trong don_hang, và mô tả ngắn gọn nội dung vào noi_dung_khac.
Nếu LÀ đơn hàng -> đặt "la_don_hang": true, xử lý như bình thường: text chỉ chứa 1 đơn hàng.

Địa chỉ hợp lệ có thể là: số nhà+đường, chỉ tên đường, tên địa danh (chợ, ngã ba, khu vực...), hoặc tên cửa hàng/quán/công ty — KHÔNG bắt buộc phải có số nhà. Nếu địa chỉ gốc chỉ là tên địa danh/quán, giữ nguyên như vậy, không cố suy diễn thêm số nhà không có.
Địa chỉ viết tắt -> suy ra đầy đủ theo khu vực; giữ nguyên số nhà/ký hiệu nếu có.
Nếu phải suy đoán giữa ≥2 đường/địa danh khả dĩ trùng tên -> chọn đường/địa danh lớn, phổ biến hơn, nhưng đánh dấu do_tin_cay_dia_chi tối đa "trung_binh" (không được để "cao").
Nếu text có nhiều hơn 1 SĐT hoặc nhiều hơn 1 địa chỉ -> ưu tiên lấy SĐT và địa chỉ gắn với người nhận/giao hàng.
SĐT: kiểm tra hợp lệ (đủ 10 số, đầu số 03/05/07/08/09). Nếu không chắc -> giữ nguyên, ghi chú nghi ngờ vào ghi_chu_don_hang.
Không có SĐT/địa chỉ -> mô tả nội dung vào noi_dung_khac.
Chỉ trả JSON, đúng schema:
{"la_don_hang":true,"don_hang":{"so_dien_thoai":"","dia_chi_goc":"","dia_chi_day_du":"","ten_nguoi_nhan":"","ghi_chu_don_hang":"","do_tin_cay_dia_chi":"cao|trung_binh|thap"},"noi_dung_khac":""}`;

export interface DonHang {
    so_dien_thoai: string;
    dia_chi_goc: string;
    dia_chi_day_du: string;
    ghi_chu_don_hang: string;
    do_tin_cay_dia_chi: 'cao' | 'trung_binh' | 'thap';
}

export interface ExtractResult {
    la_don_hang?: boolean; // false nếu text không phải nội dung đặt hàng
    don_hang: DonHang;
    noi_dung_khac?: string;
    rawText?: string; // fallback nếu parse JSON lỗi
}

const emptyDonHang: DonHang = {
    so_dien_thoai: '',
    dia_chi_goc: '',
    dia_chi_day_du: '',
    ghi_chu_don_hang: '',
    do_tin_cay_dia_chi: 'thap'
};


// Hàm dùng chung để parse response JSON từ Gemini (dùng cho cả ảnh và text)
const parseExtractionResponse = (responseText: string): ExtractResult => {
    try {
        const parsed = JSON.parse(responseText);
        const laDonHang = parsed.la_don_hang !== false;

        const extractedData: ExtractResult = {
            la_don_hang: laDonHang,
            don_hang: laDonHang && parsed.don_hang ? { ...emptyDonHang, ...parsed.don_hang } : emptyDonHang,
            noi_dung_khac: parsed.noi_dung_khac || undefined
        };

        if (laDonHang) {
            extractedData.don_hang.so_dien_thoai = normalizePhone(extractedData.don_hang.so_dien_thoai);
        }

        return extractedData;
    } catch (error) {
        console.error("Lỗi parse JSON từ kết quả Gemini:", responseText);
        return { la_don_hang: false, don_hang: emptyDonHang, rawText: responseText };
    }
};

export const processImageAndExtractInfo = async (url: string): Promise<ExtractResult> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load image from URL: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const imagePart: Part = {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType
            }
        };

        const result = await model.generateContent([EXTRACTION_PROMPT_PHOTO, imagePart]);
        const responseText = result.response.text();

        return parseExtractionResponse(responseText);
    } catch (error) {
        console.error("Lỗi trong quá trình gọi dịch vụ Gemini:", error);
        throw error;
    }
};

export const processTextAndExtractInfo = async (text: string): Promise<ExtractResult> => {
    try {
        if (!text || !text.trim()) {
            return { la_don_hang: false, don_hang: emptyDonHang, noi_dung_khac: '' };
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const prompt = `${EXTRACTION_PROMPT_TEXT}

Text đầu vào:
"""
${text}
"""`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const extracted = parseExtractionResponse(responseText);

        if (!extracted.la_don_hang) {
            console.log("Text không phải đơn hàng, bỏ qua xử lý:", text);
        }

        return extracted;
    } catch (error) {
        console.error("Lỗi trong quá trình gọi dịch vụ Gemini (text):", error);
        throw error;
    }
};