import { Dict } from "@trpc/server";
import { google, calendar_v3 } from "googleapis";
import { format, formatISO } from "date-fns";
import { db } from "~/server/db";
// Define interfaces for calendar event information
interface EventInfo {
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

// Define interface for busy times
interface BusyTime {
  start: string;
  end: string;
}

function abs(value: number): number {
  return value >= 0 ? value : -value;
}

export function fake_get_date_from_string(date_string: string) {
  if (typeof date_string === "string") {
    return new Date();
  } else {
    return "Not a string";
  }
}

export function get_date_from_string(date_string: string) {
  //returns date object from date_string like "Wednesday"
  const dictWeekdays: { [key: string]: number } = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };
  const today = new Date();
  if (typeof date_string === "string") {
    console.log("is a string");
    console.log(typeof date_string);
  }
  if (
    date_string === "tomorrow" ||
    date_string === "tmrw" ||
    date_string === "tmw" ||
    date_string === "Tomorrow"
  ) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  } else if (
    date_string === "today" ||
    date_string === "Today" ||
    date_string === null ||
    date_string === undefined
  ) {
    return today;
  } else {
    const date_string_lower = date_string.toLowerCase();
    let next_day_number: number = 0;
    for (const day in dictWeekdays) {
      if (dictWeekdays.hasOwnProperty(day) && date_string_lower.includes(day)) {
        next_day_number = dictWeekdays[day]!;
        break;
      }
    }

    let next_day_date: Date;
    const today_day_number = today.getDay();
    const diff: number = abs(next_day_number) - abs(today_day_number);
    if (diff === 0) {
      next_day_date = new Date(today);
      next_day_date.setDate(today.getDate() + 7);
    } else {
      next_day_date = new Date(today);
      next_day_date.setDate(today.getDate() + diff);
    }
    return next_day_date;
  }
}

export function convert_time(time_string: string, input_date: Date) {
  const timeString =
    time_string?.toUpperCase().replace("am", "AM").replace("pm", "PM") ?? "";
  const year = input_date.getFullYear();
  const month = input_date.getMonth();
  const day = input_date.getDate();
  const hour = parseInt(timeString?.split(":")[0] ?? "");
  const minute = parseInt(timeString?.split(":")[1]?.split(" ")[0] ?? "");
  const result = formatISO(new Date(year, month, day, hour, minute, 0));

  return result;
}
export function get_events_day(day: Date) {
  //returns list of events on a given day
  const events_list = ["Event 1", "Event 2"];
  return events_list;
}

export default async function create_event(
  event_name: string,
  day: string,
  start: string,
  end: string,
  userId: string,
  description?: string,
) {
  const date: Date = get_date_from_string(day);
  const start_time = convert_time(start, date);
  const end_time = convert_time(end, date);

  const event: EventInfo = {
    summary: event_name,
    start: {
      dateTime: start_time,
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: end_time,
      timeZone: "America/Los_Angeles",
    },
  };

  const newEvent = await db.event.create({
    data: {
      summary: event_name,
      start: start_time,
      end: end_time,
      description: description ?? " ",
      user: { connect: { id: userId } }, //not sure what this is
    },
  });

  //const events_list = get_events_day(date)
  return newEvent;
}

//TODO: fix later
export async function editEvent(event_name: string, event_id?: string) {
  const event = await db.user.findUnique({
    where: { id: event_id },
    include: {
      events: {
        where: {
          summary: event_name,
        },
      },
    },
  });
}
