import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { config } from '../config';
import { normalizePhone } from '../utils/mormalize_phone';

// Khởi tạo Gemini client với API Key từ biến môi trường
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const MODEL = "gemini-2.5-flash"
// Prompt tối ưu token: ngắn gọn, xử lý 1 ảnh = 1 đơn hàng
const EXTRACTION_PROMPT_PHOTO = `Trích SĐT, địa chỉ, nội dung đặt hàng từ ảnh (VN/Bình Định/Quy Nhơn). Ảnh chỉ chứa 1 đơn hàng.

Địa chỉ hợp lệ: số nhà+đường, chỉ đường, địa danh (chợ, ngã ba, khu vực...), hoặc tên quán/shop/công ty — không bắt buộc số nhà. Nếu gốc chỉ là tên địa danh/quán, giữ nguyên, không tự suy số nhà. Viết tắt -> suy đầy đủ theo khu vực, giữ nguyên số nhà/ký hiệu nếu có. Nếu trùng tên ≥2 đường/địa danh -> chọn cái lớn/phổ biến hơn, do_tin_cay_dia_chi tối đa "trung_binh" (không được "cao").

Ảnh có >1 SĐT hoặc >1 địa chỉ (vd: shop in sẵn lẫn khách viết tay) -> ưu tiên lấy của người nhận/giao hàng, bỏ của người gửi/shop.

SĐT hợp lệ: đủ 10 số, đầu 03/05/07/08/09. Nếu OCR không chắc (mờ, dễ nhầm 0/8, 1/7) -> giữ số đọc được, ghi nghi ngờ vào ghi_chu_don_hang.

Có tên người nhận -> ghi vào ghi_chu_don_hang. Không có SĐT/địa chỉ -> mô tả ảnh vào noi_dung_khac.

Chỉ trả JSON, đúng schema:
{"don_hang":{"so_dien_thoai":"","dia_chi_goc":"","dia_chi_day_du":"","ghi_chu_don_hang":"","do_tin_cay_dia_chi":"cao|trung_binh|thap"},"noi_dung_khac":""}`;

// Prompt riêng cho input dạng text (đơn hàng dạng chữ, không phải ảnh)
const EXTRACTION_PROMPT_TEXT = `Trích SĐT, địa chỉ, tên người nhận, nội dung đặt hàng từ text (VN/Bình Định/Quy Nhơn). Text chỉ chứa 1 đơn hàng.

Trước tiên xác định có phải nội dung đặt hàng không (có món/số lượng/size, hoặc SĐT/địa chỉ giao hàng...). Không phải đơn hàng (chat linh tinh, quảng cáo, spam...) -> "la_don_hang": false, để trống don_hang, mô tả ngắn vào noi_dung_khac. Là đơn hàng -> "la_don_hang": true, xử lý bình thường.

Địa chỉ hợp lệ: số nhà+đường, chỉ đường, địa danh (chợ, ngã ba, khu vực...), hoặc tên quán/shop/công ty — không bắt buộc số nhà. Nếu gốc chỉ là tên địa danh/quán, giữ nguyên, không tự suy số nhà. Viết tắt -> suy đầy đủ theo khu vực, giữ nguyên số nhà/ký hiệu nếu có. Nếu trùng tên ≥2 đường/địa danh -> chọn cái lớn/phổ biến hơn, do_tin_cay_dia_chi tối đa "trung_binh".

Text có >1 SĐT hoặc >1 địa chỉ -> ưu tiên lấy của người nhận/giao hàng.

SĐT hợp lệ: đủ 10 số, đầu 03/05/07/08/09. Không chắc -> giữ nguyên, ghi nghi ngờ vào ghi_chu_don_hang.

Không có SĐT/địa chỉ -> mô tả vào noi_dung_khac.

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
            model: MODEL,
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
            model: MODEL,
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