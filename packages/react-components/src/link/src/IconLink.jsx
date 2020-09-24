import "./Link.css";

import { ClearSlots, SlotProvider } from "../../shared";
import { any, bool, elementType, number, oneOf, oneOfType, string } from "prop-types";
import { forwardRef } from "react";
import { iconSlot } from "../../icons";
import { useLink } from "./useLink";

const propTypes = {
    /**
     * The URL that the link points to.
     */
    href: string,
    /**
     * The color accent.
     */
    color: oneOf(["primary", "secondary", "danger"]),
    /**
     * Whether or not this is an external link.
     */
    external: bool,
    /**
     * Whether the link should autoFocus on render.
     */
    autoFocus: bool,
    /**
     * Delay before trying to autofocus.
     */
    autoFocusDelay: number,
    /**
     * A link can vary in size.
     */
    size: oneOf(["sm", "md", "lg"]),
    /**
     * A label providing an accessible name to the button. See [WCAG](https://www.w3.org/TR/WCAG20-TECHS/ARIA14.html).
     */
    "aria-label": string.isRequired,
    /**
     * An HTML element type or a custom React element type to render as.
     */
    as: oneOfType([string, elementType]),
    /**
     * @ignore
     */
    children: any.isRequired
};

export function InnerIconLink({
    color,
    external,
    autoFocus,
    autoFocusDelay,
    size,
    active,
    focus,
    hover,
    visited,
    target,
    rel,
    title,
    as: ElementType = "a",
    "aria-label": ariaLabel,
    className,
    children,
    forwardedRef,
    ...rest
}) {
    const linkProps = useLink({
        cssModule: "o-ui-icon-link",
        color,
        external,
        autoFocus,
        autoFocusDelay,
        size,
        active,
        focus,
        hover,
        visited,
        target,
        rel,
        className,
        forwardedRef
    });

    return (
        <ElementType
            data-testid="icon-link"
            {...rest}
            {...linkProps}
            title={title ?? ariaLabel}
            aria-label={ariaLabel}
        >
            <ClearSlots>
                <SlotProvider
                    slots={{
                        icon: iconSlot({
                            size,
                            className: "o-ui-link-icon"
                        })
                    }}
                >
                    {children}
                </SlotProvider>
            </ClearSlots>
        </ElementType>
    );
}

InnerIconLink.propTypes = propTypes;

export const IconLink = forwardRef((props, ref) => (
    <InnerIconLink {...props} forwardedRef={ref} />
));