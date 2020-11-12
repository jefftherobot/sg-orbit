import { Button } from "@react-components/button";
import { Content } from "@react-components/view";
import { Disclosure } from "@react-components/disclosure";
import { KEYS } from "@react-components/shared";
import { act, fireEvent, render, waitFor } from "@testing-library/react";

// ***** Ids *****

test("when an is provided, it is used to compose the content id", async () => {
    const { getByTestId } = render(
        <Disclosure id="foo">
            <Button data-testid="header">Header</Button>
            <Content data-testid="content">Content</Content>
        </Disclosure>
    );

    const header = await waitFor(() => getByTestId("header"));
    const content = await waitFor(() => getByTestId("content"));

    expect(header.getAttribute("aria-controls")).toBe("foo-content");
    expect(content.getAttribute("id")).toBe("foo-content");
});

test("when an id is autogenerated, it is used to compose the content id", async () => {
    const { getByTestId } = render(
        <Disclosure>
            <Button data-testid="header">Header</Button>
            <Content data-testid="content">Content</Content>
        </Disclosure>
    );

    const header = await waitFor(() => getByTestId("header"));
    const content = await waitFor(() => getByTestId("content"));

    expect(header.getAttribute("aria-controls")).toBe("o-ui-disclosure-1-content");
    expect(content.getAttribute("id")).toBe("o-ui-disclosure-1-content");
});

// ***** Accessibility *****

test("Spacebar keypress toggles content visibility", async () => {
    const { getByTestId } = render(
        <Disclosure>
            <Button data-testid="header">Header</Button>
            <Content>Content</Content>
        </Disclosure>
    );

    const header = await waitFor(() => getByTestId("header"));

    expect(header.getAttribute("aria-expanded")).toBe("false");

    act(() => {
        fireEvent.keyDown(getByTestId("header"), { key: "Space", keyCode: KEYS.space });
    });

    expect(header.getAttribute("aria-expanded")).toBe("true");

    act(() => {
        fireEvent.keyDown(getByTestId("header"), { key: "Space", keyCode: KEYS.space });
    });

    expect(header.getAttribute("aria-expanded")).toBe("false");
});

test("Enter keypress toggles content visibility", async () => {
    const { getByTestId } = render(
        <Disclosure>
            <Button data-testid="header">Header</Button>
            <Content>Content</Content>
        </Disclosure>
    );

    const header = await waitFor(() => getByTestId("header"));

    expect(header.getAttribute("aria-expanded")).toBe("false");

    act(() => {
        fireEvent.keyDown(getByTestId("header"), { key: "Enter", keyCode: KEYS.enter });
    });

    expect(header.getAttribute("aria-expanded")).toBe("true");

    act(() => {
        fireEvent.keyDown(getByTestId("header"), { key: "Enter", keyCode: KEYS.enter });
    });

    expect(header.getAttribute("aria-expanded")).toBe("false");
});

// ***** API *****

test("call onChange when expand", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(
        <Disclosure onChange={handler}>
            <Button data-testid="header">Header</Button>
            <Content>Content</Content>
        </Disclosure>
    );

    act(() => {
        fireEvent.click(getByTestId("header"));
    });

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(expect.anything(), true));
});

test("call onChange when close", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(
        <Disclosure defaultOpen onChange={handler}>
            <Button data-testid="header">Header</Button>
            <Content>Content</Content>
        </Disclosure>
    );

    act(() => {
        fireEvent.click(getByTestId("header"));
    });

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(expect.anything(), false));
});


