import {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";

type EndpointHandler<
    TData,
    Body = any,
    Params = any,
    Query = any,
> = (
    req: Request<Params, BaseResponse<TData>, Body, Query>,
    res: Response<BaseResponse<TData>>,
    next: NextFunction
) => Promise<void> | void;
/**
 * Wrap một Express endpoint.
 *
 * Chức năng:
 * - Tự bắt lỗi của async handler.
 * - Chuẩn hóa kiểu Response theo `BaseResponse<TData>`.
 * - Có thể mở rộng để thêm authentication, logging, permission...
 *
 * @template TData Kiểu dữ liệu trả về trong `BaseResponse.data`
 * @template Body Kiểu của `req.body`
 * @template Params Kiểu của `req.params`
 * @template Query Kiểu của `req.query`
 *
 * @param handler Hàm xử lý endpoint.
 * @returns Express RequestHandler.
 *
 * @example
 * ```ts
 * interface UserDto {
 *   id: string;
 *   name: string;
 * }
 *
 * export const getUser = endpoint<UserDto>(
 *   async (req, res) => {
 *     res.json({
 *       msg: "Success",
 *       data: {
 *         id: "1",
 *         name: "Sơn",
 *       },
 *     });
 *   }
 * );
 * ```
 */
export function endpoint<
    TData,
    Body = any,
    Params = any,
    Query = any,
>(
    handler: EndpointHandler<TData, Body, Params, Query>
): RequestHandler {

    return async (req, res, next) => {
        try {
            await handler(
                req as any,
                res as any,
                next
            );
        } catch (err) {
            next(err);
        }
    };

}