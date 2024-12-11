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
    return `${timeDifference} s${timeDifference !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < secondsInHour) {
    const minutes = Math.floor(timeDifference / secondsInMinute);
    return `${minutes} m${minutes !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < secondsInDay) {
    const hours = Math.floor(timeDifference / secondsInHour);
    return `${hours} h${hours !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < secondsInMonth) {
    const days = Math.floor(timeDifference / secondsInDay);
    return `${days} d${days !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < secondsInYear) {
    const months = Math.floor(timeDifference / secondsInMonth);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(timeDifference / secondsInYear);
    return `${years} y${years !== 1 ? 's' : ''} ago`;
  }
}
    }
    export default getCalculatedTime;