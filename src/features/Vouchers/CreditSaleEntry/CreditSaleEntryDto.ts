export interface CreditSaleEntryDto {
    voucherId?: string | null;
    voucherDate: Date | string;
    bankAccountId: string;
    bankName?: string | null;
    bankEntryType: string;
    accountId: string;
    accountName?: string | null;
    amount: number;
    billNo:number;
    expense: number;
    netAmount: number;
    chequeNumber?: string | null;
    chequeDate?: string | null;
    remarks?: string | null;
    ItemName?: string;
  }
  
  export interface BankEntriesAndTotalsDto {
    entries: CreditSaleEntryDto[];
    totals: {
      totalbillNo: 0;
      totalAmount: 0;
      totalExpenses: 0;
      totalNetAmount: 0;
    };
  }
  