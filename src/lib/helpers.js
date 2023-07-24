import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration)

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatDuration(durationInMilliseconds) {
    const duration = dayjs.duration(durationInMilliseconds);
    const seconds = duration.seconds();
    return `${seconds} seconds`;
}