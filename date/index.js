import { previousFriday, parseISO, set } from "date-fns";

function getStartDate(commandLineArg) {
  const startDate = commandLineArg
    ? parseISO(commandLineArg)
    : set(previousFriday(new Date()), {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
    });
    
  return startDate;   
}

const dateLib = { getStartDate };

export { dateLib };
