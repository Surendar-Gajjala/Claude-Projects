import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../../../src/middleware/validate.middleware";

describe("validate middleware", () => {
  const schema = z.object({
    body: z.object({ name: z.string().min(1) })
  });
  const res = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  it("calls next() with a 400 AppError when validation fails", () => {
    const req = { body: {}, params: {}, query: {} } as unknown as Request;

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("calls next() with no arguments and assigns the parsed body when valid", () => {
    const req = { body: { name: "Engineering" }, params: {}, query: {} } as unknown as Request;

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: "Engineering" });
  });
});
