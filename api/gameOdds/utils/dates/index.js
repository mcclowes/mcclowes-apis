const getFutureGameweeks = (events) => {
  return events.filter((week) => {
    return week["deadline_time"]
      ? new Date(week["deadline_time"]) > new Date()
      : false;
  });
};

const getCurrentGameweek = (events) =>
  events.filter((week) => week["is_current"])[0];

const getNextGameweek = (events) => events.filter((week) => week["is_next"])[0];

const getNextNextGameweek = (events) => {
  return getFutureGameweeks(events)[1];
};

const newFutureDate = () => new Date(
  new Date().getFullYear() + 1,
  new Date().getMonth(),
  new Date().getDate()
)

export const findGameweekPeriod = (events) => {
  if (!events || !events.length) {
    return [null, null];
  }

  const nextGameWeek = getNextGameweek(events)
  const nextNextGameWeek = getNextNextGameweek(events)

  const nextGameweekStart =
    !!nextGameWeek ? nextGameWeek["deadline_time"] : new Date();

  const nextGameweekEnd =
    !!nextNextGameWeek
    ? nextNextGameWeek["deadline_time"]
    : newFutureDate();

  return [nextGameweekStart, nextGameweekEnd];
};
