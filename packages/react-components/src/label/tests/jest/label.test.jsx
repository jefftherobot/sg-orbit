import { Label } from "@react-components/label";
import { createRef } from "react";
import { render } from "@testing-library/react";

function createLabel(props = {}) {
    return <Label
        {...props}
    />;
}

// ***** Refs *****

test("ref is a DOM element", async () => {
    const ref = createRef();

    render(
        createLabel({
            ref
        })
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current instanceof HTMLElement).toBeTruthy();
    expect(ref.current.tagName).toBe("DIV");
});

test("when using a callback ref, ref is a DOM element", async () => {
    let refNode = null;

    render(
        createLabel({
            ref: node => {
                refNode = node;
            }
        })
    );

    expect(refNode).not.toBeNull();
    expect(refNode instanceof HTMLElement).toBeTruthy();
    expect(refNode.tagName).toBe("DIV");
});

test("set ref once", async () => {
    const handler = jest.fn();

    render(
        createLabel({
            ref: handler
        })
    );

    expect(handler).toHaveBeenCalledTimes(1);
});
