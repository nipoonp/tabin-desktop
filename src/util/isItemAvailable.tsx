import { format } from "date-fns";

export const isItemAvailable = (soldOut: boolean, soldOutDate: string) => {
  if (soldOut || soldOutDate == format(new Date(), "yyyy-MM-dd")) {
    return false;
  }

  return true;
};
