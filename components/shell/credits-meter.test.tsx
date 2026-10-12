// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { userProModal } from "@/hooks/useProModal";
import { CreditsMeter } from "./credits-meter";

afterEach(() => {
  cleanup();
  userProModal.setState({ isOpen: false });
});

describe("the credits meter running low (TICKET-089)", () => {
  it("offers the shared guest an account, since it cannot subscribe", () => {
    const { getByRole, queryByRole } = render(
      <CreditsMeter count={9} max={10} isGuest />
    );
    expect(
      getByRole("link", { name: "Create an account" }).getAttribute("href")
    ).toBe("/signup");
    expect(queryByRole("button", { name: "Upgrade" })).toBeNull();
  });

  it("offers an account Pro", () => {
    const { getByRole, queryByRole } = render(
      <CreditsMeter count={9} max={10} />
    );
    expect(queryByRole("link", { name: "Create an account" })).toBeNull();
    fireEvent.click(getByRole("button", { name: "Upgrade" }));
    expect(userProModal.getState().isOpen).toBe(true);
  });
});
