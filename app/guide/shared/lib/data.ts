export interface SaleEventData {
    quantity: number;
    proceeds: number;
    adjustedCost: number;
    dateAcquired: string;
    dateSold: string;
    rateAcquired: number;
    rateSold: number;
  }
  
export const getDefaultData = (defaultDate: string): SaleEventData => ({
    quantity: 1,
    proceeds: 0,
    dateSold: defaultDate,
    dateAcquired: defaultDate,
    adjustedCost: 0,
    rateAcquired: 1,
    rateSold: 1,
  });