export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly message: string;
  readonly data: T;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly message: string;
  readonly errors: readonly string[];
}

export function successResponse<T>(message: string, data: T): ApiSuccessResponse<T> {
  return { success: true, message, data };
}

export function errorResponse(message: string, errors: readonly string[] = []): ApiErrorResponse {
  return { success: false, message, errors };
}
