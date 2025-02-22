import { format, parse, isValid, parseISO } from "date-fns";

export const toCustomDateFormat = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return format(date, "dd-MM-yyyy");
};
export const formatDateForBackend = (date: string | Date): string => {
  let parsedDate: Date;

  if (typeof date === "string") {
    // Check if the string is in ISO format (e.g., "2024-04-02T00:00:00")
    if (date.includes("T")) {
      parsedDate = parseISO(date);
    } else {
      parsedDate = parse(date, "dd-MM-yyyy", new Date());
    }

    if (!isValid(parsedDate)) {
      throw new Error("Invalid date value");
    }
  } else if (date instanceof Date) {
    parsedDate = date;
  } else {
    throw new Error("Invalid date value");
  }

  // Set time to 00:00:00
  parsedDate.setHours(0, 0, 0, 0);
  return format(parsedDate, "yyyy-MM-dd"); // Format compatible with C# DateTime
};

export const formatDateForFrontend = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd-MM-yyyy");
};
export const validateDate = (dateInput: string | Date): boolean => {
  try {
    let parsedDate: Date;

    if (typeof dateInput === "string") {
      parsedDate = parse(dateInput, "dd-MM-yyyy", new Date());
    } else if (dateInput instanceof Date) {
      parsedDate = dateInput;
    } else {
      return false;
    }

    return isValid(parsedDate);
  } catch (error) {
    console.error("Error validating date:", error);
    return false;
  }
};

export function getFirstMonthDates(fyStartDate: Date | string): { startDate: string; endDate: string } {
  // Parse input date
  const startDate = typeof fyStartDate === 'string' ? parseISO(fyStartDate) : new Date(fyStartDate);
  
  // Calculate end date (last day of the first month)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  // Format dates using dd-MM-yyyy pattern
  return {
    startDate: format(startDate, 'dd-MM-yyyy'),
    endDate: format(endDate, 'dd-MM-yyyy')
  };
}

// export function getFirstMonthDates(fyStartDate: Date | string) {
//   const start = new Date(fyStartDate);
//   const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
//   return { startDate: start, endDate: end };
// };
