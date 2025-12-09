import { useState, useEffect, useRef } from "react";
import styles from "./DateTimePicker.module.css";

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function DateTimePicker({
  value,
  onChange,
  placeholder = "Выберите дату и время",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState({ hours: 12, minutes: 0 });
  const pickerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedTime({
        hours: date.getHours(),
        minutes: date.getMinutes(),
      });
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];

    // Дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Дни следующего месяца
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleDateSelect = (dateInfo) => {
    const newDate = new Date(
      dateInfo.date.getFullYear(),
      dateInfo.date.getMonth(),
      dateInfo.date.getDate(),
      selectedTime.hours,
      selectedTime.minutes,
    );
    setSelectedDate(newDate);
    setCurrentMonth(
      new Date(dateInfo.date.getFullYear(), dateInfo.date.getMonth(), 1),
    );
    updateValue(newDate);
  };

  const handleTimeChange = (type, value) => {
    const newTime = { ...selectedTime, [type]: parseInt(value) };
    setSelectedTime(newTime);

    if (selectedDate) {
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        newTime.hours,
        newTime.minutes,
      );
      setSelectedDate(newDate);
      updateValue(newDate);
    }
  };

  const updateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Получаем смещение часового пояса в формате +HH:MM или -HH:MM
    const timezoneOffset = -date.getTimezoneOffset();
    const offsetSign = timezoneOffset >= 0 ? "+" : "-";
    const offsetHours = String(
      Math.floor(Math.abs(timezoneOffset) / 60),
    ).padStart(2, "0");
    const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(
      2,
      "0",
    );
    const timezone = `${offsetSign}${offsetHours}:${offsetMinutes}`;

    onChange(`${year}-${month}-${day}T${hours}:${minutes}:00${timezone}`);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return "";
    return selectedDate.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={styles.dateTimePicker} ref={pickerRef}>
      <div
        className={`${styles.input} ${isOpen ? styles.focused : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? styles.value : styles.placeholder}>
          {value ? formatDisplayValue() : placeholder}
        </span>
        <span className={styles.icon}>📅</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
              <button
                type="button"
                className={styles.navButton}
                onClick={handlePrevMonth}
              >
                ‹
              </button>
              <span className={styles.monthYear}>
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                type="button"
                className={styles.navButton}
                onClick={handleNextMonth}
              >
                ›
              </button>
            </div>

            <div className={styles.weekdays}>
              {WEEKDAYS.map((day) => (
                <div key={day} className={styles.weekday}>
                  {day}
                </div>
              ))}
            </div>

            <div className={styles.days}>
              {days.map((dayInfo, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.day} ${!dayInfo.isCurrentMonth ? styles.otherMonth : ""} ${isToday(dayInfo.date) ? styles.today : ""} ${isSelected(dayInfo.date) ? styles.selected : ""}`}
                  onClick={() => handleDateSelect(dayInfo)}
                >
                  {dayInfo.day}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.timePicker}>
            <span className={styles.timeLabel}>🕐 Время:</span>
            <div className={styles.timeInputs}>
              <select
                className={styles.timeSelect}
                value={selectedTime.hours}
                onChange={(e) => handleTimeChange("hours", e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className={styles.timeSeparator}>:</span>
              <select
                className={styles.timeSelect}
                value={selectedTime.minutes}
                onChange={(e) => handleTimeChange("minutes", e.target.value)}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className={styles.confirmButton}
            onClick={() => setIsOpen(false)}
          >
            Готово
          </button>
        </div>
      )}
    </div>
  );
}

export default DateTimePicker;
