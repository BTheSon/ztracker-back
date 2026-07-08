const PHONE_REGEX = /^0(3|5|7|8|9)\d{8}$/;

// Regex kiểm tra số điện thoại VN cơ bản (10 số, đầu 03/05/07/08/09)
export const normalizePhone = (phone: string): string => {
    if (!phone) return '';
    // loại bỏ khoảng trắng, dấu chấm, gạch ngang
    const cleaned = phone.replace(/[\s.\-]/g, '');
    return PHONE_REGEX.test(cleaned) ? cleaned : phone; // giữ nguyên nếu không khớp, để người dùng tự kiểm tra
};