import { AutoControlledPureComponent, getAutoControlledStateFromProps } from "../../../shared";
import { DatePickerAnchor } from "../date-picker-anchor";
import { DateRangePickerButtons } from "./date-range-picker-buttons";
import { DateRangePickerCalendar } from "./date-range-picker-calendar";
import { DateRangePickerInput } from "./date-range-picker-input";
import { DateRangePickerPresets } from "./date-range-picker-presets";
import { arrayOf, bool, element, func, number, object, oneOf, oneOfType, shape, string } from "prop-types";
import { cloneElement, createRef } from "react";
import { isFunction, isNil } from "lodash";
import { momentObj as momentType } from "react-moment-proptypes";
import moment from "moment";

// Duplicated here until https://github.com/reactjs/react-docgen/pull/352 is merged. Otherwise the props will not render properly in the docs.
const PRESET_SHAPE = {
    text: string.isRequired,
    startDate: object.isRequired,
    endDate: object.isRequired
};

// Sizes constants are duplicated here until https://github.com/reactjs/react-docgen/pull/352 is merged. Otherwise it will not render properly in the docs.
const SIZES = ["small", "medium", "large"];

export class DateRangePicker extends AutoControlledPureComponent {
    static propTypes = {
        /**
         * A controlled start date value.
         */
        startDate: momentType,
        /**
         * A controlled end date value.
         */
        endDate: momentType,
        /**
         * The initial value of start date.
         */
        defaultStartDate: momentType,
        /**
         * The initial value of end date.
         */
        defaultEndDate: momentType,
        /**
         * Called when the date(s) are / is applied.
         * @param {SyntheticEvent} event - React's original SyntheticEvent.
         * @param {Moment} startDate - Selected start date.
         * @param {Moment} endDate - Selected end date.
         * @param {string} presetName - Selected preset name.
         * @param {Object} props - All the props.
         * @returns {void}
         */
        onDatesChange: func.isRequired,
        /**
         * Called when the calendar open / close.
         * @param {SyntheticEvent} event - React's original SyntheticEvent.
         * @param {boolean} isVisible - Indicate if the calendar is visible.
         * @param {Object} props - All the props.
         * @returns {void}
         */
        onVisibilityChange: func,
        /**
         * Whether or not the calendar enforce the selection of of a range of dates.
         */
        allowSingleDateSelection: bool,
        /**
         * Whether or not the calendar selected date(s) can be cleared.
         */
        allowClear: bool,
        /**
         * The minimum (inclusive) date available for selection.
         */
        minDate: momentType,
        /**
         * The maximum (inclusive) date available for selection.
         */
        maxDate: momentType,
        /**
         * An initial visible month displayed when the calendar open.
         */
        initialVisibleMonth: oneOfType([momentType, func]),
        /**
         * The number of months displayed simultaneously in the calendar.
         */
        numberOfMonths: number,
        /**
         * A React component that display the currently applied date(s) and open the calendar.
         */
        input: element,
        /**
         * The placeholder text.
         */
        placeholder: string,
        /**
         * A format to display the currently applied date(s).
         */
        rangeFormat: string,
        /**
         * A format to display a date.
         */
        dateFormat: string,
        /**
         * Whether or not the calendar will open upward.
         */
        upward: bool,
        /**
         * A calendar can open to the left or to the right.
         */
        direction: oneOf(["left", "right"]),
        /**
         * Disables automatic repositioning of the calendar, it will always be placed according to upward and direction values.
         */
        pinned: bool,
        /**
         * z-index of the calendar.
         */
        zIndex: number,
        /**
         * A React component to select a date.
         */
        calendar: element,
        /**
         * A React component to list and select a preset.
         */
        presetsComponent: element,
        /**
         * Array of pre-determined dates range displayed to the left of the calendar.
         */
        presets: arrayOf(shape(PRESET_SHAPE)),
        /**
         * A React component displayed under the calendar to `clear` and `apply` the date(s).
         */
        buttons: element,
        /**
         * A controlled open value that determined whether or not the calendar is displayed.
         */
        open: bool,
        /**
         * The initial value of open.
         */
        defaultOpen: bool,
        /**
         * Whether or not the date picker take up the width of its container.
         */
        fluid: bool,
        /**
         * Whether or not the calendar should close when the date picker loose focus.
         */
        closeOnBlur: bool,
        /**
         * Whether or not the calendar should close when a click happens outside the date picker.
         * Requires `closeOnBlur` to be false.
         */
        closeOnOutsideClick: bool,
        /**
         * A date picker can vary in sizes.
         */
        size: oneOf(SIZES),
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

    static defaultProps = {
        allowSingleDateSelection: false,
        allowClear: true,
        numberOfMonths: 2,
        input: <DateRangePickerInput />,
        dateFormat: "MMM Do YYYY",
        calendar: <DateRangePickerCalendar />,
        presetsComponent: <DateRangePickerPresets />,
        presets: [],
        buttons: <DateRangePickerButtons />,
        fluid: false
    };

    static autoControlledProps = ["startDate", "endDate", "open"];

    // Expose sub-components.
    static Input = DateRangePickerInput;
    static Calendar = DateRangePickerCalendar;
    static Presets = DateRangePickerPresets;
    static Buttons = DateRangePickerButtons;

    state = {
        startDate: null,
        endDate: null,
        selectedStartDate: null,
        selectedEndDate: null,
        selectedPresetName: null,
        open: false
    };

    _inputRef = createRef();

    static getDerivedStateFromProps(props, state) {
        return getAutoControlledStateFromProps(props, state, DateRangePicker.autoControlledProps, ({ startDate, endDate }) => ({
            selectedStartDate: startDate,
            selectedEndDate: endDate
        }));
    }

    handleAnchorVisibilityChange = (event, shouldOpen) => {
        const { startDate, endDate } = this.state;

        if (shouldOpen) {
            this.openCalendar(event);
        } else {
            this.setState({ selectedStartDate: startDate, selectedEndDate: endDate, selectedPresetName: null });
            this.closeCalendar(event);
        }
    }

    handleInputClear = event => {
        const { onDatesChange } = this.props;

        this.trySetAutoControlledStateValue({ startDate: null });
        this.trySetAutoControlledStateValue({ endDate: null });
        this.setState({ selectedStartDate: null, selectedEndDate: null, selectedPresetName: null });

        onDatesChange(event, null, null, null);
    };

    handleCalendarDatesChange = (startDate, endDate, presetName) => {
        this.setState({ selectedStartDate: startDate, selectedEndDate: endDate, selectedPresetName: presetName });
    };

    handleCalendarApply = event => {
        const { onDatesChange } = this.props;
        const { selectedStartDate, selectedEndDate, selectedPresetName } = this.state;

        this.closeCalendar(event);
        this.trySetAutoControlledStateValue({ startDate: selectedStartDate });
        this.trySetAutoControlledStateValue({ endDate: selectedEndDate });
        this.focusInput();

        onDatesChange(event, selectedStartDate, selectedEndDate, selectedPresetName);
    };

    focusInput() {
        setTimeout(() => {
            if (!isNil(this._inputRef.current)) {
                if (isFunction(this._inputRef.current.focus)) {
                    this._inputRef.current.focus();
                }
            }
        }, 0);
    }

    openCalendar(event) {
        const { onVisibilityChange } = this.props;

        this.trySetAutoControlledStateValue({ open: true });

        if (!isNil(onVisibilityChange)) {
            onVisibilityChange(event, true);
        }
    }

    closeCalendar(event) {
        const { onVisibilityChange } = this.props;

        this.trySetAutoControlledStateValue({ open: false });

        if (!isNil(onVisibilityChange)) {
            onVisibilityChange(event, false);
        }
    }

    renderInput() {
        const { input, allowClear, placeholder, rangeFormat, dateFormat, disabled, fluid, size, active, focus, hover } = this.props;
        const { open, selectedStartDate, selectedEndDate } = this.state;

        return cloneElement(input, {
            open,
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            onClear: this.handleInputClear,
            allowClear,
            placeholder,
            rangeFormat,
            dateFormat,
            disabled,
            fluid,
            size,
            active,
            focus,
            hover,
            ref: this._inputRef
        });
    }

    renderCalendar() {
        const { allowSingleDateSelection, allowClear, minDate, maxDate, initialVisibleMonth, numberOfMonths, calendar, presetsComponent, presets, buttons } = this.props;
        const { selectedStartDate, selectedEndDate } = this.state;

        return cloneElement(calendar, {
            // Since 21.1.0 react-dates mutate the startDate / endDate moment objects. Not sure where and why.
            // To prevent side effects, we provide a clone. https://momentjs.com/docs/#/parsing/moment-clone/
            startDate: isNil(selectedStartDate) ? selectedStartDate : moment(selectedStartDate),
            endDate: isNil(selectedEndDate) ? selectedEndDate : moment(selectedEndDate),
            onDatesChange: this.handleCalendarDatesChange,
            onApply: this.handleCalendarApply,
            allowSingleDateSelection,
            allowClear,
            minDate,
            maxDate,
            initialVisibleMonth,
            numberOfMonths,
            presetsComponent,
            presets,
            buttons
        });
    }

    render() {
        const { upward, direction, pinned, zIndex, disabled, closeOnBlur, closeOnOutsideClick, fluid, className, style } = this.props;
        const { open } = this.state;

        return (
            <DatePickerAnchor
                open={open}
                input={this.renderInput()}
                calendar={this.renderCalendar()}
                upward={upward}
                direction={direction}
                pinned={pinned}
                zIndex={zIndex}
                onVisibilityChange={this.handleAnchorVisibilityChange}
                disabled={disabled}
                closeOnBlur={closeOnBlur}
                closeOnOutsideClick={closeOnOutsideClick}
                fluid={fluid}
                className={className}
                style={style}
            />
        );
    }
}
