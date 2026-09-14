import { useState } from "react";
import styles from "../../pages/DashboardPage/DashboardPage.module.css";

function CalendarView({ tasks, onView }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Получаем первый день месяца и количество дней
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Воскресенье

  // Корректируем для начала недели с понедельника
  const startingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Названия месяцев и дней недели
  const monthNames = [
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
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  // Навигация по месяцам
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Получаем задачи для конкретного дня
  const getTasksForDay = (day) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getFullYear() === year &&
        taskDate.getMonth() === month &&
        taskDate.getDate() === day
      );
    });
  };

  // Проверяем, является ли день сегодняшним
  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  // Создаём массив дней для отображения
  const calendarDays = [];

  // Пустые ячейки до первого дня месяца
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Получаем дни с задачами для мобильного вида
  const daysWithTasks = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length > 0 || isToday(day)) {
      daysWithTasks.push({ day, tasks: dayTasks });
    }
  }

  // Форматирование даты для мобильного вида
  const formatDayDate = (day) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className={styles.calendarView}>
      {/* Шапка календаря */}
      <div className={styles.calendarHeader}>
        <button
          className={styles.calendarNavBtn}
          onClick={goToPreviousMonth}
          title="Предыдущий месяц"
        >
          ←
        </button>
        <div className={styles.calendarTitle}>
          <h3>
            {monthNames[month]} {year}
          </h3>
          <button className={styles.calendarTodayBtn} onClick={goToToday}>
            Сегодня
          </button>
        </div>
        <button
          className={styles.calendarNavBtn}
          onClick={goToNextMonth}
          title="Следующий месяц"
        >
          →
        </button>
      </div>

      {/* Дни недели */}
      <div className={styles.calendarWeekdays}>
        {dayNames.map((day) => (
          <div key={day} className={styles.calendarWeekday}>
            {day}
          </div>
        ))}
      </div>

      {/* Сетка дней (десктоп) */}
      <div className={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div key={`empty-${index}`} className={styles.calendarDayEmpty} />
            );
          }

          const dayTasks = getTasksForDay(day);
          const hasOverdue = dayTasks.some(
            (t) => t.status !== "done" && new Date(t.deadline) < new Date(),
          );

          return (
            <div
              key={day}
              className={`${styles.calendarDay} ${isToday(day) ? styles.calendarDayToday : ""} ${hasOverdue ? styles.calendarDayOverdue : ""}`}
            >
              <div className={styles.calendarDayNumber}>{day}</div>
              <div className={styles.calendarDayTasks}>
                {dayTasks.slice(0, 3).map((task) => {
                  return (
                    <div
                      key={task.id}
                      className={`${styles.calendarTask} ${task.status === "done" ? styles.calendarTaskDone : ""}`}
                      style={{ borderLeftColor: task.color }}
                      onClick={() => onView(task)}
                      title={task.text}
                    >
                      <span className={styles.calendarTaskTime}>
                        {new Date(task.deadline).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className={styles.calendarTaskText}>
                        {task.text.length > 20
                          ? task.text.substring(0, 20) + "..."
                          : task.text}
                      </span>
                      {task.priority === "high" && (
                        <span className={styles.calendarTaskPriority}>🔼</span>
                      )}
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className={styles.calendarTasksMore}>
                    +{dayTasks.length - 3} ещё
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Мобильный список дней */}
      <div className={styles.calendarMobileList}>
        {daysWithTasks.length === 0 ? (
          <div className={styles.calendarMobileEmpty}>
            <span>📅</span>
            <p>Нет задач на этот месяц</p>
          </div>
        ) : (
          daysWithTasks.map(({ day, tasks: dayTasks }) => {
            const hasOverdue = dayTasks.some(
              (t) => t.status !== "done" && new Date(t.deadline) < new Date(),
            );

            return (
              <div
                key={day}
                className={`${styles.calendarMobileDay} ${isToday(day) ? styles.calendarMobileDayToday : ""}`}
              >
                <div className={styles.calendarMobileDayHeader}>
                  <span
                    className={`${styles.calendarMobileDayDate} ${isToday(day) ? styles.calendarMobileDayDateToday : ""}`}
                  >
                    {formatDayDate(day)}
                  </span>
                  {isToday(day) && (
                    <span className={styles.calendarMobileTodayBadge}>
                      Сегодня
                    </span>
                  )}
                  {hasOverdue && (
                    <span className={styles.calendarMobileOverdueBadge}>
                      Просрочено
                    </span>
                  )}
                </div>
                <div className={styles.calendarMobileDayTasks}>
                  {dayTasks.length === 0 ? (
                    <div className={styles.calendarMobileNoTasks}>
                      Нет задач
                    </div>
                  ) : (
                    dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`${styles.calendarMobileTask} ${task.status === "done" ? styles.calendarMobileTaskDone : ""}`}
                        style={{ borderLeftColor: task.color }}
                        onClick={() => onView(task)}
                      >
                        <div className={styles.calendarMobileTaskMain}>
                          <span className={styles.calendarMobileTaskTime}>
                            {new Date(task.deadline).toLocaleTimeString(
                              "ru-RU",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          <span className={styles.calendarMobileTaskText}>
                            {task.text}
                          </span>
                        </div>
                        <div className={styles.calendarMobileTaskBadges}>
                          {task.priority === "high" && (
                            <span className={styles.calendarMobileTaskPriority}>
                              🔼
                            </span>
                          )}
                          {task.is_recurring && (
                            <span
                              className={styles.calendarMobileTaskRecurring}
                            >
                              🔄
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Легенда */}
      <div className={styles.calendarLegend}>
        <div className={styles.calendarLegendItem}>
          <span
            className={styles.calendarLegendDot}
            style={{ backgroundColor: "#6366f1" }}
          />
          <span>К выполнению</span>
        </div>
        <div className={styles.calendarLegendItem}>
          <span
            className={styles.calendarLegendDot}
            style={{ backgroundColor: "#f97316" }}
          />
          <span>В работе</span>
        </div>
        <div className={styles.calendarLegendItem}>
          <span
            className={styles.calendarLegendDot}
            style={{ backgroundColor: "#22c55e" }}
          />
          <span>Завершено</span>
        </div>
        <div className={styles.calendarLegendItem}>
          <span
            className={styles.calendarLegendDot}
            style={{ backgroundColor: "#ef4444" }}
          />
          <span>Просрочено</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
