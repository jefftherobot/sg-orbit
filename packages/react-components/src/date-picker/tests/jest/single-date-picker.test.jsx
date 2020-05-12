import { CALENDAR_APPLY_BUTTON_ID, CALENDAR_CLEAR_BUTTON_ID, CALENDAR_ID, INPUT_CLEAR_BUTTON_ID, getInput } from "./shared";
import { DATE_FORMAT, openCalendar } from "./shared";
import { PureComponent, createRef } from "react";
import { SingleDatePicker } from "@react-components/date-picker";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { isNil, noop } from "lodash";
import { waitDelay } from "@utils/wait-for";
import moment from "moment";
import userEvent from "@utils/user-event";

jest.mock("@react-components/date-picker/src/react-dates-wrapper.jsx", () => {
    return {
        DayPickerSingleDateController: () => <></>,
        DayPickerRangeController: () => <></>
    };
});

class DayPickerSingleDateControllerMock extends PureComponent {
    triggerDateChange(date) {
        const { onDateChange } = this.props;

        onDateChange(date);
    }

    render() {
        return <></>;
    }
}

function createSingleDatePicker({ reactDatesCalendar, onDateChange = noop, ...otherProps } = {}) {
    const rdc = isNil(reactDatesCalendar) ? <DayPickerSingleDateControllerMock /> : reactDatesCalendar;

    return <SingleDatePicker
        calendar={<SingleDatePicker.Calendar reactDatesCalendar={rdc} />}
        onDateChange={onDateChange}
        {...otherProps}
    />;
}

// ***** Behaviors *****

test("open the calendar on input click", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    userEvent.click(getInput(getByTestId));

    await waitFor(() => expect(getByTestId(CALENDAR_ID)).toBeInTheDocument());
});

test("open the calendar on space keydown", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    fireEvent.keyDown(getInput(getByTestId), { key: " ", keyCode: 32 });

    await waitFor(() => expect(getByTestId(CALENDAR_ID)).toBeInTheDocument());
});

test("open the calendar on enter keydown", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    fireEvent.keyDown(getInput(getByTestId), { key: "Enter", keyCode: 13 });

    await waitFor(() => expect(getByTestId(CALENDAR_ID)).toBeInTheDocument());
});

test("close the calendar on esc keydown", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    const calendarNode = await openCalendar(getByTestId);

    fireEvent.keyDown(document, { key: "Escape", keyCode: 27 });

    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());
});

test("close the calendar on outside click", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    const calendarNode = await openCalendar(getByTestId);

    userEvent.click(document.body);

    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());
});

test("close the calendar on input click", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    const calendarNode = await openCalendar(getByTestId);

    userEvent.click(getInput(getByTestId));

    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());
});

test("close the calendar on blur", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    const calendarNode = await openCalendar(getByTestId);

    getInput(getByTestId).blur();

    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());
});

test("when disabled, dont open the calendar on input click", async () => {
    const { getByTestId, queryByTestId } = render(createSingleDatePicker({
        disabled: true
    }));

    userEvent.click(getInput(getByTestId));

    await waitFor(() => expect(queryByTestId(CALENDAR_ID)).toBeNull());
});

test("when disabled, dont open the calendar on space keydown", async () => {
    const { getByTestId, queryByTestId } = render(createSingleDatePicker({
        disabled: true
    }));

    fireEvent.keyDown(getInput(getByTestId), { key: " ", keyCode: 32 });

    await waitFor(() => expect(queryByTestId(CALENDAR_ID)).toBeNull());
});

test("when disabled, dont open the calendar on enter keydown", async () => {
    const { getByTestId, queryByTestId } = render(createSingleDatePicker({
        disabled: true
    }));

    fireEvent.keyDown(getInput(getByTestId), { key: "Enter", keyCode: 13 });

    await waitFor(() => expect(queryByTestId(CALENDAR_ID)).toBeNull());
});

test("clear the date on input clear button click", async () => {
    const date = moment();
    const formattedDate = date.format(DATE_FORMAT);

    const { getByTestId } = render(createSingleDatePicker({ defaultDate: date, dateFormat: DATE_FORMAT }));

    const inputNode = getInput(getByTestId);

    await waitFor(() => expect(inputNode).toHaveValue(formattedDate));

    userEvent.click(getByTestId(INPUT_CLEAR_BUTTON_ID));

    await waitFor(() => expect(inputNode).not.toHaveValue(formattedDate));
});

test("when the calendar is closed and a value is selected, clear the value on esc keydown", async () => {
    const date = moment();
    const formattedDate = date.format(DATE_FORMAT);

    const { getByTestId } = render(createSingleDatePicker({ defaultDate: date, dateFormat: DATE_FORMAT }));

    const inputNode = getInput(getByTestId);

    await waitFor(() => expect(inputNode).toHaveValue(formattedDate));

    fireEvent.keyDown(inputNode, { key: "Escape", keyCode: 27 });

    await waitFor(() => expect(inputNode).not.toHaveValue(formattedDate));
});

test("dont close the calendar on calendar clear button click", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    const calendarNode = await openCalendar(getByTestId);

    userEvent.click(getByTestId(CALENDAR_CLEAR_BUTTON_ID));

    await waitFor(() => expect(calendarNode).toBeInTheDocument());
});

test("when a date is selected, clicking on the calendar apply button close the calendar", async () => {
    const { getByTestId } = render(createSingleDatePicker({
        defaultDate: moment()
    }));

    const calendarNode = await openCalendar(getByTestId);

    userEvent.click(getByTestId(CALENDAR_APPLY_BUTTON_ID));

    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());
});

test("clear the date on calendar clear button click", async () => {
    const date = moment();
    const formattedDate = date.format(DATE_FORMAT);

    const { getByTestId } = render(createSingleDatePicker({
        defaultDate: date,
        dateFormat: DATE_FORMAT
    }));

    await waitFor(() => expect(getInput(getByTestId)).toHaveValue(formattedDate));

    await openCalendar(getByTestId);

    userEvent.click(getByTestId(CALENDAR_CLEAR_BUTTON_ID));

    await waitFor(() => expect(getInput(getByTestId)).not.toHaveValue(formattedDate));
});

test("when the date is cleared on calendar clear button click, the apply button is focused", async () => {
    const date = moment();
    const formattedDate = date.format(DATE_FORMAT);

    const { getByTestId } = render(createSingleDatePicker({
        defaultDate: date,
        dateFormat: DATE_FORMAT
    }));

    await waitFor(() => expect(getInput(getByTestId)).toHaveValue(formattedDate));

    await openCalendar(getByTestId);

    userEvent.click(getByTestId(CALENDAR_CLEAR_BUTTON_ID));

    await waitFor(() => expect(getByTestId(CALENDAR_APPLY_BUTTON_ID)).toHaveFocus());
});

test("when the calendar close on esc keydown, the input should be focused", async () => {
    const { getByTestId } = render(createSingleDatePicker());

    await openCalendar(getByTestId);

    getByTestId(CALENDAR_CLEAR_BUTTON_ID).focus();

    const inputNode = getInput(getByTestId);

    await waitFor(() => expect(inputNode).not.toHaveFocus());

    fireEvent.keyDown(document, { key: "Escape", keyCode: 27 });

    await waitFor(() => expect(inputNode).toHaveFocus());
});

test("when a date is selected and the calendar is closed without applying the selection, clear the date", async () => {
    const ref = createRef();
    const date = moment();
    const formattedDate = date.format(DATE_FORMAT);

    const { getByTestId } = render(createSingleDatePicker({
        reactDatesCalendar: <DayPickerSingleDateControllerMock ref={ref} />,
        dateFormat: DATE_FORMAT
    }));

    await openCalendar(getByTestId);

    ref.current.triggerDateChange(date);

    const inputNode = getInput(getByTestId);

    await waitFor(() => expect(inputNode).toHaveValue(formattedDate));

    userEvent.click(document.body);

    await waitFor(() => expect(inputNode).not.toHaveValue(formattedDate));
});

test("when closeOnBlur is false, dont close the calendar on blur", async () => {
    const { getByTestId } = render(createSingleDatePicker({
        closeOnBlur: false
    }));

    const calendarNode = await openCalendar(getByTestId);

    userEvent.click(document.body);

    getByTestId(CALENDAR_APPLY_BUTTON_ID).focus();

    await waitFor(() => expect(calendarNode).toBeInTheDocument());
});

test("when closeOnBlur is false and closeOnOutsideClick is true, close the calendar on outside click", async () => {
    const { getByTestId } = render(createSingleDatePicker({
        closeOnBlur: false,
        closeOnOutsideClick: true
    }));

    const calendarNode = await openCalendar(getByTestId);

    userEvent.click(document.body);

    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());
});

// ***** API *****

test("dont call onDateChange when a date is selected", async () => {
    const ref = createRef();
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        reactDatesCalendar: <DayPickerSingleDateControllerMock ref={ref} />,
        onDateChange: handler
    }));

    await openCalendar(getByTestId);

    ref.current.triggerDateChange(moment());

    await waitDelay(5);

    expect(handler).not.toHaveBeenCalled();
});

test("dont call onDateChange when the calendar is dimissed", async () => {
    const ref = createRef();
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        reactDatesCalendar: <DayPickerSingleDateControllerMock ref={ref} />,
        onDateChange: handler
    }));

    await openCalendar(getByTestId);

    ref.current.triggerDateChange(moment());

    userEvent.click(document.body);

    await waitDelay(5);

    expect(handler).not.toHaveBeenCalled();
});

test("call onDateChange when the date is applied", async () => {
    const newDate = moment();
    const ref = createRef();
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        reactDatesCalendar: <DayPickerSingleDateControllerMock ref={ref} />,
        onDateChange: handler
    }));

    await openCalendar(getByTestId);

    ref.current.triggerDateChange(newDate);

    userEvent.click(getByTestId(CALENDAR_APPLY_BUTTON_ID));

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(expect.anything(), newDate));
});

test("call onDateChange when the date is cleared from the input", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        defaultDate: moment(),
        onDateChange: handler
    }));

    userEvent.click(getByTestId(INPUT_CLEAR_BUTTON_ID));

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(expect.anything(), null));
});

test("call onVisibilityChange when the calendar is opened with an input click", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        onVisibilityChange: handler
    }));

    userEvent.click(getInput(getByTestId));

    // I shouldn't need this but the test fail otherwise.
    await waitFor(() => expect(getByTestId(CALENDAR_ID)).toBeInTheDocument());

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(expect.anything(), true));
});

test("call onVisibilityChange when the calendar is opened with space keydown", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        onVisibilityChange: handler
    }));

    fireEvent.keyDown(getInput(getByTestId), { key: " ", keyCode: 32 });

    // I shouldn't need this but the test fail otherwise.
    await waitFor(() => expect(getByTestId(CALENDAR_ID)).toBeInTheDocument());

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(expect.anything(), true));
});

test("call onVisibilityChange when the calendar is opened with enter keydown", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        onVisibilityChange: handler
    }));

    fireEvent.keyDown(getInput(getByTestId), { key: "Enter", keyCode: 13 });

    // I shouldn't need this but the test fail otherwise.
    await waitFor(() => expect(getByTestId(CALENDAR_ID)).toBeInTheDocument());

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(expect.anything(), true));
});

test("call onVisibilityChange when the calendar is closed with an outside click", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        onVisibilityChange: handler
    }));

    const calendarNode = await openCalendar(getByTestId);

    userEvent.click(document.body);

    // I shouldn't need this but the test fail otherwise.
    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(expect.anything(), false));
});

test("call onVisibilityChange when the calendar is closed with esc keydown", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        onVisibilityChange: handler
    }));

    const calendarNode = await openCalendar(getByTestId);

    fireEvent.keyDown(document, { key: "Escape", keyCode: 27 });

    // I shouldn't need this but the test fail otherwise.
    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());

    expect(handler).toHaveBeenLastCalledWith(expect.anything(), false);
});

test("call onVisibilityChange when the calendar close on blur", async () => {
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        onVisibilityChange: handler
    }));

    const calendarNode = await openCalendar(getByTestId);

    getInput(getByTestId).blur();

    // I shouldn't need this but the test fail otherwise.
    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());

    expect(handler).toHaveBeenLastCalledWith(expect.anything(), false);
});

test("call onVisibilityChange when the date is applied", async () => {
    const ref = createRef();
    const handler = jest.fn();

    const { getByTestId } = render(createSingleDatePicker({
        reactDatesCalendar: <DayPickerSingleDateControllerMock ref={ref} />,
        onVisibilityChange: handler
    }));

    const calendarNode = await openCalendar(getByTestId);

    ref.current.triggerDateChange(moment());

    userEvent.click(getByTestId(CALENDAR_APPLY_BUTTON_ID));

    // I shouldn't need this but the test fail otherwise.
    await waitFor(() => expect(calendarNode).not.toBeInTheDocument());

    expect(handler).toHaveBeenLastCalledWith(expect.anything(), false);
});
