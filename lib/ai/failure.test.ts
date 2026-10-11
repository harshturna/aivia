import { describe, expect, it } from "vitest";
import { plainFailure } from "./failure";

describe("plainFailure", () => {
  it("names a safety block without the service's words", () => {
    const line = plainFailure(
      "fal: Request failed with status 422: Unprocessable Entity — prompt flagged by the content checker"
    );
    expect(line).toBe(
      "The safety filter blocked this one. Try wording it differently."
    );
  });

  it("calls an outage busy and drops the request id", () => {
    const line = plainFailure(
      "upstream returned 503 Service Unavailable (request id 7f3a)"
    );
    expect(line).toBe("The service was busy. Try again in a moment.");
    expect(line).not.toMatch(/7f3a|503/);
  });

  it("keeps the run's own piece cap as written", () => {
    const cap =
      "One brief can make up to 6 pieces. Send another brief for more.";
    expect(plainFailure(cap)).toBe(cap);
  });

  it("falls back to a plain line for anything else", () => {
    expect(plainFailure("TypeError: Cannot read properties of undefined")).toBe(
      "Something went wrong making it. Try again."
    );
    expect(plainFailure(undefined)).toBe(
      "Something went wrong making it. Try again."
    );
  });
});
