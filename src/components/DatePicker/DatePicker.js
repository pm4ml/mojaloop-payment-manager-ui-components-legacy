import '../../icons/mule/calendar-small.svg';
import './DatePicker.scss';

import moment from 'moment';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';

import * as utils from '../../utils/common';
import keyCodes from '../../utils/keyCodes';
import { InvalidIcon, Loader, Placeholder, ValidationWrapper } from '../Common';
import Icon, { iconSizes } from '../Icon';

function asDate(day) {
  if (day) {
    return moment(day)
      .startOf('day')
      .format('x');
  }
  return 0;
}

class DatePicker extends PureComponent {
  static getDate(value) {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(parseInt(value, 10));
    }
    return undefined;
  }
  static getTimeObject(value) {
    let intValue = value;
    if (typeof value === 'undefined') {
      intValue = 0;
    }
    if (typeof value === 'string') {
      intValue = parseInt(value, 10);
    }

    const hour = value ? moment(intValue).get('hour') : 0;
    const minute = value ? moment(intValue).get('minute') : 0;
    const second = value ? moment(intValue).get('second') : 0;
    return { hour, minute, second };
  }
  static getSelectedDayAndTimestamp(value) {
    let myValue = value;
    if (typeof value === 'string') {
      myValue = parseInt(value, 10);
    }
    return {
      selectedDay: myValue ? new Date(myValue) : null,
      timestamp: myValue,
    };
  }
  static getTimestamp(day, hour, minute, second) {
    const date = asDate(day);
    return parseInt(date, 10) + hour * 60 * 60 * 1000 + minute * 60 * 1000 + second * 1000;
  }

  constructor(props) {
    super(props);

    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleHourClick = this.handleHourClick.bind(this);
    this.handleMinuteClick = this.handleMinuteClick.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleSecondClick = this.handleSecondClick.bind(this);

    // Wrapper events
    this.onClick = this.onClick.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);

    // internal methods
    this.closeDatePicker = this.closeDatePicker.bind(this);
    this.leaveDatePicker = this.leaveDatePicker.bind(this);
    this.testKey = this.testKey.bind(this);

    // internal timeout
    this.deferredTimeChangeTimeout = undefined;

    const { selectedDay, timestamp } = DatePicker.getSelectedDayAndTimestamp(this.props.value);
    const { hour, minute, second } = DatePicker.getTimeObject(this.props.value);

    this.state = {
      selectedDay,
      timestamp,
      hour,
      minute,
      second,
      isOpen: false,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mouseup', this.handlePageClick, false);
  }
  componentDidUpdate(prevProps) {
    const { value, defaultHour, defaultMinute, defaultSecond } = this.props;
    const defaultTime = {
      hour: defaultHour,
      minute: defaultMinute,
      second: defaultSecond,
    };

    if (prevProps.value !== value) {
      let timeValue = value;
      if (typeof value === 'string') {
        timeValue = parseInt(value, 10);
      }
      const { selectedDay, timestamp } = DatePicker.getSelectedDayAndTimestamp(timeValue);
      const { hour, minute, second } = value ? DatePicker.getTimeObject(timeValue) : defaultTime;

      this.setState({
        selectedDay,
        timestamp,
        hour,
        minute,
        second,
      });
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mouseup', this.handlePageClick, false);
  }
  onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
    this.input.focus();
  }
  onFocus(e) {
    if (this.state.isOpen === false) {
      this.setState({ isOpen: true }, () => {
        this.input.focus();
      });
      this.handleResize();
    }
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }
  onBlur(e) {
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
    // this.close();
  }
  closeDatePicker(e) {
    this.setState({ isOpen: false });
    this.onBlur(e);
  }
  handleDateTimeChange(selectedDay, hour, minute, second) {
    const { format } = this.props;
    // convert the value into the specified format if necessary
    let exportDay = selectedDay === null || selectedDay === undefined ? undefined : selectedDay;

    if (exportDay !== undefined && format) {
      const dayStamp = moment(exportDay)
        .startOf('day')
        .format('x');

      exportDay =
        parseInt(dayStamp, 10) + hour * 60 * 60 * 1000 + minute * 60 * 1000 + second * 1000;

      if (format === 'x') {
        exportDay = parseInt(exportDay, 10);
      } else if (format === 'X') {
        exportDay = parseInt(exportDay / 1000, 10);
      } else {
        exportDay = moment(exportDay).format(format);
      }
    }

    // call the external function
    if (this.props.onSelect) {
      this.props.onSelect(exportDay);
    }
  }
  handleDayClick(day, { selected, disabled }) {
    if (disabled) return;
    const selectedDay = selected ? null : day;
    const timestamp = DatePicker.getTimestamp(selected ? undefined : day, 0, 0, 0);
    this.setState({ selectedDay, timestamp });
    this.handleDateTimeChange(selectedDay, this.state.hour, this.state.minute, this.state.second);
  }
  handleHourClick(hour) {
    clearTimeout(this.deferredTimeChangeTimeout);
    const timestamp = DatePicker.getTimestamp(
      this.state.selectedDay,
      hour,
      this.state.minute,
      this.state.second,
    );
    if (hour > 23) return;
    this.setState({ hour, timestamp });
    this.deferredTimeChangeTimeout = setTimeout(
      () =>
        this.handleDateTimeChange(
          this.state.selectedDay,
          hour,
          this.state.minute,
          this.state.second,
        ),
      500,
    );
  }
  handleMinuteClick(minute) {
    clearTimeout(this.deferredTimeChangeTimeout);
    const timestamp = DatePicker.getTimestamp(
      this.state.selectedDay,
      this.state.hour,
      minute,
      this.state.second,
    );
    if (minute > 59) return;
    this.setState({ minute, timestamp });
    this.deferredTimeChangeTimeout = setTimeout(
      () =>
        this.handleDateTimeChange(
          this.state.selectedDay,
          this.state.hour,
          minute,
          this.state.second,
        ),
      500,
    );
  }
  handlePageClick(e) {
    if (!this.calendarPosition.contains(e.target)) {
      this.setState({ isOpen: false });
    }
  }
  handleResize() {
    const wrapper = utils.getParentOverflow(this.calendarPosition);
    const calendarHeight = 300;
    const { maxLowerHeight, maxUpperHeight } = utils.getSpaceAvailability(
      calendarHeight,
      this.calendarPosition,
      wrapper,
    );
    this.reverse = maxLowerHeight > calendarHeight ? false : maxLowerHeight < maxUpperHeight;

    clearTimeout(this._forceUpdateTimeout);
    this._forceUpdateTimeout = setTimeout(() => this.forceUpdate(), 50);
  }
  handleSecondClick(second) {
    clearTimeout(this.deferredTimeChangeTimeout);
    const timestamp = DatePicker.getTimestamp(
      this.state.selectedDay,
      this.state.hour,
      this.state.minute,
      second,
    );
    if (second > 59) return;
    this.setState({ second, timestamp });
    this.deferredTimeChangeTimeout = setTimeout(
      () =>
        this.handleDateTimeChange(
          this.state.selectedDay,
          this.state.hour,
          this.state.minute,
          second,
        ),
      500,
    );
  }
  leaveDatePicker(e, next) {
    this.closeDatePicker(e);
    utils.focusNextFocusableElement(this.input, next);
  }
  testKey(e) {
    const { keyCode, shiftKey } = e.nativeEvent;
    if (keyCode === keyCodes.KEY_TAB) {
      e.preventDefault();
      this.leaveDatePicker(e, !shiftKey);
    }
  }

  render() {
    const {
      placeholder,
      id,
      className,
      size,
      style,
      disabled,
      pending,
      invalid,
      invalidMessages,
      required,
      dateFormat,
      hideIcon,
    } = this.props;
    const { isOpen, timestamp, selectedDay } = this.state;
    const initialMonth = selectedDay || DatePicker.getDate(this.props.initialMonth);
    const hasDate = timestamp !== 0 && timestamp !== undefined;
    const isPlaceholderActive = isOpen || hasDate;
    const iconSize = iconSizes[size];
    const valueFormat = dateFormat || 'MMM Do YYYY, HH:mm:ss';
    const value = hasDate ? moment(timestamp).format(valueFormat) : '';
    const showCalendar = hasDate ? hideIcon === false : true;

    const componentClassName = utils.composeClassNames([
      className,
      'input-datepicker__component',
      'mb-input',
      'mb-input__borders',
      'mb-input__background',
      'mb-input__shadow',
      size === 's' && 'mb-input--small',
      size === 'm' && 'mb-input--medium',
      size === 'l' && 'mb-input--large',
      /* eslint-disable max-len  */
      isOpen &&
        'mb-input--open mb-input__borders--open mb-input__background--open mb-input__shadow--open',
      disabled && 'mb-input--disabled mb-input__borders--disabled mb-input__background--disabled',
      pending &&
        'mb-input--pending mb-input__borders--pending mb-input__background--pending mb-input__shadow--pending',
      invalid &&
        'mb-input--invalid mb-input__borders--invalid mb-input__background--invalid mb-input__shadow--invalid',
      required &&
        'mb-input--required mb-input__borders--required mb-input__background--required mb-input__shadow--required',
      /* eslint-enable */
    ]);

    let customPlaceholder = null;
    if (placeholder) {
      customPlaceholder = (
        <Placeholder size={size} label={placeholder} active={isPlaceholderActive} />
      );
    }

    let loader = null;
    if (pending) {
      loader = <Loader size={size} />;
    }

    let invalidIcon = null;
    if (invalid) {
      invalidIcon = <InvalidIcon size={size} />;
    }

    let calendarIcon = null;
    if (showCalendar) {
      calendarIcon = (
        <div className="mb-input__inner-icon input-datepicker__icon">
          <Icon size={iconSize} name="calendar-small" fill="#999" />
        </div>
      );
    }

    const calendarBoxClassName = utils.composeClassNames([
      'input-datepicker__calendar-box',
      this.reverse && 'input-datepicker__calendar-box--reverse',
    ]);

    return (
      <ValidationWrapper messages={invalidMessages} active={isOpen} key="datepicker">
        <div id={id} className={componentClassName} style={style}>
          <div
            className="mb-input__content input-datepicker__content"
            onClick={this.onClick}
            onKeyDown={this.onFocus}
            role="presentation"
          >
            {customPlaceholder}
            <input
              onFocus={this.onFocus}
              ref={input => {
                this.input = input;
              }}
              className="mb-input__input input-datepicker__value"
              value={value}
              onKeyDown={this.testKey}
              disabled={disabled}
              readOnly
            />
            {loader}
            {invalidIcon}
            {calendarIcon}
          </div>
        </div>
        <div
          key="calendar"
          className="input-datepicker--position"
          ref={calendarPosition => {
            this.calendarPosition = calendarPosition;
          }}
        >
          {this.state.isOpen && (
            <div className={calendarBoxClassName}>
              <DayPicker
                initialMonth={initialMonth}
                selectedDays={day => DateUtils.isSameDay(selectedDay, day)}
                onDayClick={this.handleDayClick}
                disabledDays={this.props.disabledDays}
              />
              {this.props.withTime && (
                <TimePicker
                  hour={this.state.hour}
                  minute={this.state.minute}
                  second={this.state.second}
                  onHourChange={this.handleHourClick}
                  onMinuteChange={this.handleMinuteClick}
                  onSecondChange={this.handleSecondClick}
                  disabled={selectedDay === undefined || selectedDay == null}
                />
              )}
            </div>
          )}
        </div>
      </ValidationWrapper>
    );
  }
}

DatePicker.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape(),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['s', 'm', 'l']),
  onSelect: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  format: PropTypes.string,
  dateFormat: PropTypes.string,
  withTime: PropTypes.bool,
  defaultHour: PropTypes.number,
  defaultMinute: PropTypes.number,
  defaultSecond: PropTypes.number,
  disabled: PropTypes.bool,
  pending: PropTypes.bool,
  required: PropTypes.bool,
  invalid: PropTypes.bool,
  initialMonth: PropTypes.string,
  disabledDays: PropTypes.func,
  hideIcon: PropTypes.bool,
};
DatePicker.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  size: 'l',
  value: undefined,
  placeholder: undefined,
  onSelect: undefined,
  onBlur: undefined,
  onFocus: undefined,
  format: undefined,
  dateFormat: undefined,
  withTime: false,
  defaultHour: 0,
  defaultMinute: 0,
  defaultSecond: 0,
  disabled: false,
  pending: false,
  required: false,
  invalid: false,
  initialMonth: undefined,
  disabledDays: undefined,
  hideIcon: false,
};

const TimePicker = ({
  hour,
  minute,
  second,
  onHourChange,
  onMinuteChange,
  onSecondChange,
  disabled,
}) => (
  <div className="timepicker-position">
    <TimeInput
      name="Hours"
      limit={23}
      selected={hour}
      onChange={onHourChange}
      disabled={disabled}
    />
    <TimeInput
      name="Minutes"
      limit={59}
      selected={minute}
      onChange={onMinuteChange}
      disabled={disabled}
    />
    <TimeInput
      name="Seconds"
      limit={59}
      selected={second}
      onChange={onSecondChange}
      disabled={disabled}
    />
  </div>
);
TimePicker.propTypes = {
  hour: PropTypes.number,
  minute: PropTypes.number,
  second: PropTypes.number,
  onHourChange: PropTypes.func,
  onMinuteChange: PropTypes.func,
  onSecondChange: PropTypes.func,
  disabled: PropTypes.bool,
};
TimePicker.defaultProps = {
  hour: 0,
  minute: 0,
  second: 0,
  onHourChange: undefined,
  onMinuteChange: undefined,
  onSecondChange: undefined,
  disabled: false,
};

class TimeInput extends PureComponent {
  static getDoubleDigitTime(value) {
    const intValue = parseInt(value, 10);
    return intValue < 10 ? `0${intValue}` : intValue;
  }
  constructor(props) {
    super(props);

    this.onChangeValue = this.onChangeValue.bind(this);
    this.state = {
      value: parseInt(this.props.selected, 10),
      shown: TimeInput.getDoubleDigitTime(this.props.selected),
    };
  }

  componentDidUpdate(prevProps) {
    const { selected } = this.props;
    if (prevProps.selected !== this.props.selected) {
      if (parseInt(selected, 10) === this.state.value) return;
      this.setState({
        value: parseInt(selected, 10),
        shown: TimeInput.getDoubleDigitTime(selected),
      });
    }
  }

  onChangeValue(e) {
    const { value } = e.target;
    const time = value === '' ? 0 : parseInt(value, 10);
    this.props.onChange(time);
  }

  render() {
    const { name, limit, disabled } = this.props;
    return (
      <div className="timepicker-item-box">
        <div className="placeholder"> {name} </div>
        <input
          disabled={disabled}
          type="number"
          className="timepicker-select"
          onFocus={e => e.target.select()}
          onChange={this.onChangeValue}
          value={this.state.shown}
          min={0}
          max={limit}
        />
      </div>
    );
  }
}
TimeInput.propTypes = {
  name: PropTypes.string,
  limit: PropTypes.number,
  selected: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};
TimeInput.defaultProps = {
  name: '',
  limit: 0,
  selected: false,
  onChange: undefined,
  disabled: false,
};
export default DatePicker;
