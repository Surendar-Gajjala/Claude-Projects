import { AppError } from "../../../src/utils/app-error";

describe("AppError", () => {
  it("sets statusCode, message, and isOperational for the base constructor", () => {
    const error = new AppError("Something went wrong", 418, ["detail"]);

    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(418);
    expect(error.isOperational).toBe(true);
    expect(error.errors).toEqual(["detail"]);
    expect(error).toBeInstanceOf(Error);
  });

  it("applies default statusCode and errors when omitted", () => {
    const error = new AppError("plain error");

    expect(error.statusCode).toBe(500);
    expect(error.errors).toEqual([]);
  });

  it.each([
    ["unauthorized", "Unauthorized"] as const,
    ["forbidden", "Forbidden"] as const,
    ["notFound", "Resource not found"] as const
  ])("%s() falls back to its default message when none is given", (factory, defaultMessage) => {
    const error = (AppError[factory] as () => AppError)();
    expect(error.message).toBe(defaultMessage);
  });

  it.each([
    ["badRequest", 400] as const,
    ["unauthorized", 401] as const,
    ["forbidden", 403] as const,
    ["notFound", 404] as const,
    ["conflict", 409] as const
  ])("%s() produces a %i AppError", (factory, statusCode) => {
    const error = (AppError[factory] as (message: string) => AppError)("msg");
    expect(error.statusCode).toBe(statusCode);
  });
});
