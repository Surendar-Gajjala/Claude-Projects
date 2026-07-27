import { successResponse, errorResponse } from "../../../src/utils/api-response";

describe("api-response", () => {
  it("successResponse builds a success envelope", () => {
    expect(successResponse("ok", { id: 1 })).toEqual({ success: true, message: "ok", data: { id: 1 } });
  });

  it("errorResponse builds an error envelope with default empty errors", () => {
    expect(errorResponse("bad")).toEqual({ success: false, message: "bad", errors: [] });
  });

  it("errorResponse includes provided errors", () => {
    expect(errorResponse("bad", ["field: required"])).toEqual({
      success: false,
      message: "bad",
      errors: ["field: required"]
    });
  });
});
