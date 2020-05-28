import { DropdownButtonItem } from "./DropdownButtonItem";
import { DropdownContext } from "./context";
import { DropdownDivider } from "./DropdownDivider";
import { DropdownHeader } from "./DropdownHeader";
import { DropdownItem } from "./DropdownItem";
import { DropdownLinkItem } from "./DropdownLinkItem";
import { DropdownMenu, createDropdownMenu } from "./DropdownMenu";
import { DropdownTitleTrigger } from "./DropdownTitleTrigger";
import { KEYS } from "../../shared";
import { bool, element, func, number, oneOf, string } from "prop-types";
import { cloneElement, forwardRef, useCallback, useEffect, useState } from "react";
import { isNil } from "lodash";
import { usePopperTrigger } from "../../popper";

// Sizes constants are duplicated here until https://github.com/reactjs/react-docgen/pull/352 is merged. Otherwise it will not render properly in the docs.
const SIZES = ["small", "medium", "large"];
const DEFAULT_SIZE = "medium";

const propTypes = {
    open: bool,
    defaultOpen: bool,
    title: string,
    trigger: element,
    /**
     * A dropdown menu can vary in size.
     */
    size: oneOf(SIZES),
    upward: bool,
    fluid: bool,
    zIndex: number,
    /**
     * Whether or not the menu should close when the dropdown menu loose focus.
     */
    closeOnBlur: bool,
    /**
     * Whether or not the menu should close when a click happens outside the dropdown menu.
     * Requires `closeOnBlur` to be false.
     */
    closeOnOutsideClick: bool,
    onOpen: func,
    onClose: func,
    menu: element,
    /**
     * @ignore
     */
    active: bool,
    /**
     * @ignore
     */
    focus: bool,
    /**
     * @ignore
     */
    hover: bool
};

const defaultProps = {
    size: DEFAULT_SIZE
};

const UnwrappedTriggerWrapper = forwardRef(({ children, ...rest }, ref) => {
    // Don't pass dropdown trigger specific props down.
    ["open", "upward"].forEach(x => {
        delete rest[x];
    });


    return cloneElement(children, {
        ...rest,
        ref
    });
});

function useThrowWhenMutuallyExclusivePropsAreProvided({ title, trigger }) {
    useEffect(() => {
        if (!isNil(title) && !isNil(trigger)) {
            throw new Error("Dropdown - \"title\" and \"trigger\" props cannot be used together.");
        }
    }, [title, trigger]);
}

function useHandleVisibilityChange({ onOpen, onClose }, setIsOpen) {
    return useCallback((event, isVisible) => {
        if (isVisible) {
            if (!isNil(onOpen)) {
                onOpen(event);
            }
        } else {
            if (!isNil(onClose)) {
                onClose(event);
            }
        }

        setIsOpen(isVisible);
    }, [onOpen, onClose, setIsOpen]);
}

function useHandleMenuSelectItem(closePopper, focusTrigger) {
    return useCallback(event => {
        // HACK: anchors were not activated on enter keydown, adding, delaying the close fix it.
        setTimeout(() => {
            closePopper(event);
            focusTrigger();
        }, 0);
    }, [closePopper, focusTrigger]);
}

function resolveTrigger(title, trigger) {
    if (!isNil(title)) {
        return <DropdownTitleTrigger title={title} />;
    }

    if (!isNil(trigger)) {
        if (!isNil(trigger.type) && trigger.type.name === "DropdownTrigger") {
            return trigger;
        }

        return <UnwrappedTriggerWrapper>{trigger}</UnwrappedTriggerWrapper>;
    }

    throw new Error("Dropdown - \"title\" or \"trigger\" cannot be both undefined.");
}

function useTriggerRenderer({ title, trigger, size, upward, fluid, active, focus, hover }, isOpen) {
    return () => {
        const triggerComponent = resolveTrigger(title, trigger);

        return cloneElement(triggerComponent, {
            open: isOpen,
            upward,
            size,
            fluid,
            active,
            focus,
            hover
        });
    };
}

function useMenuRenderer({ menu, children, forwardedRef, rest }, isOpen, handleMenuSelectItem) {
    return () => {
        const props = {
            ...rest,
            open: isOpen,
            onSelectItem: handleMenuSelectItem,
            ref: forwardedRef
        };

        if (!isNil(menu)) {
            return createDropdownMenu(menu, props);
        }

        return <DropdownMenu {...props}>{children}</DropdownMenu>;
    };
}

function usePopper({ open, defaultOpen, upward, fluid, zIndex, closeOnBlur, closeOnOutsideClick }, handleVisibilityChange, trigger) {
    const { renderPopper, hidePopper, focusTrigger } = usePopperTrigger({
        show: open,
        defaultShow: defaultOpen,
        trigger: trigger,
        toggleHandler: "onClick",
        position: upward ? "top-start" : "bottom-start",
        fluid: fluid,
        zIndex: zIndex,
        showOnKeys: [upward ? KEYS.up : KEYS.down],
        hideOnBlur: closeOnBlur,
        hideOnOutsideClick: closeOnOutsideClick,
        focusFirstElementOnKeyboardShow: true,
        onVisibilityChange: handleVisibilityChange,
        noPortal: true
    });

    return {
        renderPopper,
        closePopper: hidePopper,
        focusTrigger
    };
}

function useRenderer(size, popper) {
    return () => {
        return (
            <DropdownContext.Provider value={{ size }}>
                {popper}
            </DropdownContext.Provider>
        );
    };
}

export function InnerDropdown(props) {
    const {
        open,
        defaultOpen,
        title,
        trigger,
        size,
        upward,
        fluid,
        zIndex,
        closeOnBlur,
        closeOnOutsideClick,
        onOpen,
        onClose,
        active,
        focus,
        hover,
        menu,
        children,
        forwardedRef,
        ...rest
    } = props;
    useThrowWhenMutuallyExclusivePropsAreProvided(props);

    const [isOpen, setIsOpen] = useState();

    const handleVisibilityChange = useHandleVisibilityChange({ onOpen, onClose }, setIsOpen);

    const renderTrigger = useTriggerRenderer({ title, trigger, size, upward, fluid, active, focus, hover }, isOpen);

    const { renderPopper, closePopper, focusTrigger } = usePopper(
        { open, defaultOpen, upward, fluid, zIndex, closeOnBlur, closeOnOutsideClick },
        handleVisibilityChange,
        renderTrigger()
    );

    const handleMenuSelectItem = useHandleMenuSelectItem(closePopper, focusTrigger);

    const renderMenu = useMenuRenderer({ menu, children, forwardedRef, rest }, isOpen, handleMenuSelectItem);
    const render = useRenderer(size, renderPopper(renderMenu()));

    // Without a fragment, react-docgen doesn't work.
    return <>{render()}</>;
}

InnerDropdown.propTypes = propTypes;
InnerDropdown.defaultProps = defaultProps;

export const Dropdown = forwardRef((props, ref) => (
    <InnerDropdown {...props} forwardedRef={ref} />
));

[InnerDropdown, Dropdown].forEach(x => {
    x.Menu = DropdownMenu;
    x.Item = DropdownItem;
    x.LinkItem = DropdownLinkItem;
    x.ButtonItem = DropdownButtonItem;
    x.Header = DropdownHeader;
    x.Divider = DropdownDivider;
});


