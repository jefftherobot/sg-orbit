import { PopperTrigger } from "../../popper";
import { PureComponent } from "react";
import { bool, element, func, number, object, string } from "prop-types";
import { isNil } from "lodash";
import { resolvePopperPosition } from "../../shared";

export class DatePickerAnchor extends PureComponent {
    static propTypes = {
        open: bool.isRequired,
        input: element.isRequired,
        calendar: element.isRequired,
        upward: bool,
        direction: ["left", "right"],
        pinned: bool,
        zIndex: number,
        onVisibilityChange: func,
        closeOnBlur: bool,
        closeOnOutsideClick: bool,
        fluid: bool,
        className: string,
        style: object
    };

    static defaultProps = {
        upward: false,
        direction: "right",
        pinned: false,
        zIndex: 2
    };

    handleVisibilityChange = (event, visible) => {
        const { onVisibilityChange } = this.props;

        if (!isNil(onVisibilityChange)) {
            onVisibilityChange(event, visible);
        }
    };

    render() {
        const { open, input, calendar, upward, direction, pinned, zIndex, closeOnBlur, closeOnOutsideClick, disabled, fluid, className, style } = this.props;

        return (
            <PopperTrigger.TextInput
                show={open}
                input={input}
                position={resolvePopperPosition(upward, direction)}
                pinned={pinned}
                offset={[0, 10]}
                onVisibilityChange={this.handleVisibilityChange}
                hideOnBlur={closeOnBlur}
                hideOnOutsideClick={closeOnOutsideClick}
                focusFirstElementOnKeyboardShow
                disabled={disabled}
                fluid={fluid}
                zIndex={zIndex}
                className={className}
                style={style}
            >
                {calendar}
            </PopperTrigger.TextInput>
        );
    }
}
