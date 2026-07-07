interface BaseResponse<T> {
    msg: string;
    data: T;
}

interface ErrorResponse {
    msg: string;
}