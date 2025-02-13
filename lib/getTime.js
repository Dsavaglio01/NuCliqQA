function getCalculatedTime(time) {
    if (time != null) {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
  const timeDifference = currentTimestamp - time.seconds;
  const secondsInMinute = 60;
  const secondsInHour = 60 * secondsInMinute;
  const secondsInDay = 24 * secondsInHour;
  const secondsInMonth = 30 * secondsInDay;
  const secondsInYear = 365 * secondsInDay;
  if (timeDifference < secondsInMinute) {
    return `${timeDifference}${timeDifference !== 1 ? 's' : 's'} ago`;
  } else if (timeDifference < secondsInHour) {
    const minutes = Math.floor(timeDifference / secondsInMinute);
    return `${minutes}${minutes !== 1 ? 'm' : 'm'} ago`;
  } else if (timeDifference < secondsInDay) {
    const hours = Math.floor(timeDifference / secondsInHour);
    return `${hours}${hours !== 1 ? 'h' : 'h'} ago`;
  } else if (timeDifference < secondsInMonth) {
    const days = Math.floor(timeDifference / secondsInDay);
    return `${days}${days !== 1 ? 'd' : 'd'} ago`;
  } else if (timeDifference < secondsInYear) {
    const months = Math.floor(timeDifference / secondsInMonth);
    return `${months}${months !== 1 ? 'month' : 'month'} ago`;
  } else {
    const years = Math.floor(timeDifference / secondsInYear);
    return `${years}${years !== 1 ? 'y' : 'y'} ago`;
  }
}
    }
    export default getCalculatedTime;