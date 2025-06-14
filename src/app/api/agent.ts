import axios, { AxiosResponse, AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { PaginatedResponse } from "../models/pagination";
import { store } from "../store/configureStore";
import { router } from "../router/Router";
import { AccountGroupDto } from "../../features/Masters/AccountGroup/accountGroupDto";
import CityDto from "../../features/Masters/City/cityDto";
import ItemUnitDto from "../../features/Masters/ItemUnit/itemUnitDto";
import GSTSlabDto from "../../features/Masters/GSTSlab/gstSlabDto";
import {
  AccountDto,
  AccountDtoForDropDownList,
} from "../../features/Masters/Account/accountDto";
import {
  PaymentAndReceiptDto,
  PaymentAndReceiptEntriesAndTotalsDto,
} from "../../features/Vouchers/PaymentAndReceipt/paymentAndReceiptDto";
import { FinancialYearDto } from "../../features/Masters/FinancialYear/financialYearDto";
import { VoucherTypeEnum } from "../../features/Vouchers/VoucherCommon/voucherTypeEnum";
import { ControlOptionDto } from "../../features/Vouchers/VoucherCommon/controlOptionDto";
import {
  BankEntriesAndTotalsDto,
  BankEntryDto,
} from "../../features/Vouchers/BankEntry/bankEntryDto";
import { LedgerReportDto } from "../../features/Reports/Ledger/LedgerReport";
import {
  BatchNumberDto,
  ItemDetailDto,
  ItemDropDownListDto,
  ItemFormDto,
} from "../../features/Masters/Item/ItemDto";
import { ItemSalePurchaseVoucherDto } from "../../features/Vouchers/SalesPurchaseCommonVouchers/SalesPurchaseCommonVoucherDto";
import { SerialNumberDto } from "../../features/Masters/SerialNumberSetting/SerialNumberDto";
import { AdditionalFieldDto } from "../../features/Masters/AdditionalFieldsSetting/AdditionalFieldDto";
import { MandiDto } from "../../features/CommissionAgent/Mandi/mandiDto";
import { CommissionAgentItemDto } from "../../features/CommissionAgent/CommissionAgentItem/commissionAgentItem";
import { StudentAdmissionDto } from "../../features/School/StudentAdmission/StudentAdmissionDto";
import { ItemRegisterDto } from "../../features/Reports/SaleRegister/SaleRegister";

let baseURL;
baseURL = import.meta.env.VITE_REACT_APP_API_URL;

axios.defaults.baseURL = baseURL;

const responseBody = (response: AxiosResponse) => response.data;
// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Request Interceptor
axios.interceptors.request.use((config) => {
  const token = store.getState().account.user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  async (response: AxiosResponse) => {
    // await sleep(1000);
    const pagination = response.headers["pagination"];
    if (pagination) {
      response.data = new PaginatedResponse(
        response.data,
        JSON.parse(pagination)
      );
    }
    return response;
  },
  (error: AxiosError) => {
    handleErrorResponse(error);
    return Promise.reject(error);
  }
);

function handleErrorResponse(error: AxiosError) {
  const { data, status } = error.response || {};
  switch (status) {
    case 400:
      handleBadRequest((data as { errors?: Record<string, string[]> })?.errors);
      break;
    case 401:
      handleUnauthorized(data as string | undefined);
      break;
    case 403:
      handleForbidden();
      break;
    case 500:
      handleServerError();
      break;
    default:
      break;
  }
}
function handleBadRequest(errors: Record<string, string[]> | undefined) {
  if (errors) {
    const modelStateErrors: string[] = Object.values(errors).flatMap(
      (error) => error
    );
    throw modelStateErrors;
  }
}

const handleUnauthorized = (data: string | undefined) => {
  toast.error(data || "Unauthorized");

  const currentPath = window.location.pathname;
  const isResetPasswordPage = currentPath.includes("/reset-password");

  if (!isResetPasswordPage) {
    router.navigate("/login", { state: { from: currentPath } });
  }
};

function handleForbidden() {
  toast.error("You are not allowed to do that!");
}

function handleServerError() {
  //toast.error("Server error. Please try again later.");
}

const requests = {
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(responseBody),

  post: (
    url: string,
    body: unknown,
    params?: URLSearchParams,
    isFormData: boolean = false
  ) =>
    axios
      .post(url, body, {
        params: params,
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
        },
      })
      .then(responseBody),

  put: (url: string, body: unknown, params?: URLSearchParams) =>
    axios.put(url, body, { params }).then(responseBody),

  delete: (url: string, params?: URLSearchParams) =>
    axios.delete(url, { params }).then(responseBody),
};

function createFormData(item: Record<string, any>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(item)) {
    formData.append(key, value);
  }
  return formData;
}

const UserAccount = {
  login: async (values: any) =>
    await requests.post("UserAccount/login", values),
  forgotPassword: async (values: any) => {
    await requests.post("UserAccount/ForgotPassword", values);
  },
  resetPassword: async (values: any) =>
    await axios.post("/UserAccount/ResetPassword", values),
  register: async (values: any) =>
    await requests.post("UserAccount/register", values),
  currentUser: async () => await requests.get("UserAccount/GetCurrentUser"),
};

const Company = {
  create: async (company: CompaniesMasterDto) =>
    await requests.post("company/CreateCompany", createFormData(company)),
  update: async (company: CompaniesMasterDto) =>
    await requests.post("company/UpdateCompany", createFormData(company)),
  getStates: async () => await requests.get("company/GetStates"),
  getCompanies: async () => await requests.get("company/GetCompaniesList"),
  //get company data to update the data
  getCompanyDetail: async (accessId: string): Promise<CompaniesMasterDto> => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.get("company/GetCompanyDetail", params);
  },
  getCompanyName: async (accessId: string) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.get("company/GetCompanyName", params);
  },
};
const FinancialYear = {
  create: async (accessId: string, financialYears: FinancialYearDto) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.post(
      "FinancialYear/CreateFinancialYear",
      financialYears,
      params
    );
  },
  update: async (accessId: string, financialYears: FinancialYearDto) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.post(
      "FinancialYear/UpdateFinancialYear",
      financialYears,
      params
    );
  },
  getCurrentFinancialYear: async (accessId: string) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.get("FinancialYear/GetCurrentFinancialYear", params);
  },
  getAllFinancialYears: async (
    accessId: string
  ): Promise<FinancialYearDto[]> => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.get("FinancialYear/GetAllFinancialYears", params);
  },
  updateCurrentFinancialYear: async (
    accessId: string,
    newFinancialYear: Date
  ) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.post(
      "FinancialYear/UpdateCurrentFinancialYear",
      newFinancialYear,
      params
    );
  },
};
const AccountGroup = {
  create: async (accessId: string, accountGroup: AccountGroupDto) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.post("AccountGroup", accountGroup, params);
  },
  getAllAccountGroups: async (accessId: string) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.get("AccountGroup", params);
  },
  getById: async (accessId: string, groupId: number) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.get(`AccountGroup/${groupId}`, params);
  },
  update: async (
    accessId: string,
    groupId: number,
    accountGroup: AccountGroupDto
  ) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.put(`AccountGroup/${groupId}`, accountGroup, params);
  },
  delete: async (accessId: string, groupId: number) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.delete(`AccountGroup/${groupId}`, params);
  },
  getAllUnderGroups: async (accessId: string) => {
    const params = new URLSearchParams({ accessId: accessId });
    return await requests.get("AccountGroup/GetAllUnderGroups", params);
  },
};
const City = {
  getAllCities: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("city/GetAllCities", params);
  },
  getCityById: async (accessId: string, cityId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`city/${cityId}`, params);
  },
  createCity: async (accessId: string, city: CityDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("city/CreateCity", city, params);
  },
  updateCity: async (accessId: string, cityId: number, city: CityDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`city/${cityId}`, city, params);
  },
  deleteCity: async (accessId: string, cityId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`city/${cityId}`, params);
  },
};
const ItemCompany = {
  getAllItemCompanies: async (accessId: string): Promise<ItemCompanyDto[]> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("itemCompany/GetAllItemCompanies", params);
  },

  getItemCompanyById: async (
    accessId: string,
    itemCompanyID: number
  ): Promise<ItemCompanyDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`itemCompany/${itemCompanyID}`, params);
  },

  createItemCompany: async (
    accessId: string,
    itemCompany: ItemCompanyDto
  ): Promise<ItemCompanyDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.post(
      "itemCompany/CreateItemCompany",
      itemCompany,
      params
    );
  },

  updateItemCompany: async (
    accessId: string,
    itemCompanyID: number,
    itemCompany: ItemCompanyDto
  ): Promise<void> => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `itemCompany/${itemCompanyID}`,
      itemCompany,
      params
    );
  },

  deleteItemCompany: async (
    accessId: string,
    itemCompanyID: number
  ): Promise<void> => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`itemCompany/${itemCompanyID}`, params);
  },
};
const ItemGodown = {
  getAllItemGodowns: async (accessId: string): Promise<ItemGodownDto[]> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("itemGodown/GetAllItemGodowns", params);
  },

  getItemGodownById: async (
    accessId: string,
    itemGodownID: number
  ): Promise<ItemGodownDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`itemGodown/${itemGodownID}`, params);
  },

  createItemGodown: async (
    accessId: string,
    itemGodown: ItemGodownDto
  ): Promise<ItemGodownDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.post(
      "itemGodown/CreateItemGodown",
      itemGodown,
      params
    );
  },

  updateItemGodown: async (
    accessId: string,
    itemGodownID: number,
    itemGodown: ItemGodownDto
  ): Promise<void> => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`itemGodown/${itemGodownID}`, itemGodown, params);
  },

  deleteItemGodown: async (
    accessId: string,
    itemGodownID: number
  ): Promise<void> => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`itemGodown/${itemGodownID}`, params);
  },
};
const ItemUnit = {
  getAllItemUnits: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("itemunit", params);
  },
  getItemUnitById: async (
    accessId: string,
    itemUnitId: number
  ): Promise<ItemUnitDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`itemunit/${itemUnitId}`, params);
  },
  createItemUnit: async (accessId: string, itemUnitDto: ItemUnitDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("itemunit", itemUnitDto, params);
  },
  updateItemUnit: async (
    accessId: string,
    itemUnitId: number,
    itemUnitDto: ItemUnitDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`itemunit/${itemUnitId}`, itemUnitDto, params);
  },
  deleteItemUnit: async (accessId: string, itemUnitId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`itemunit/${itemUnitId}`, params);
  },
};
const GSTSlab = {
  getAllGSTSlabs: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("gstslab", params);
  },
  getGSTSlabById: async (accessId: string, gstSlabId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`gstslab/${gstSlabId}`, params);
  },
  createGSTSlab: async (accessId: string, gstSlabDto: GSTSlabDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("gstslab", gstSlabDto, params);
  },
  updateGSTSlab: async (
    accessId: string,
    gstSlabId: number,
    gstSlabDto: GSTSlabDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`gstslab/${gstSlabId}`, gstSlabDto, params);
  },
  deleteGSTSlab: async (accessId: string, gstSlabId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`gstslab/${gstSlabId}`, params);
  },
};
const States = {
  getAllStatesOfCompany: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("account/AllStates", params);
  },
};
const Account = {
  getAllAccounts: async (
    accessId: string,
    {
      pageNumber,
      pageSize,
      search = "",
    }: { pageNumber: number; pageSize: number; search?: string }
  ) => {
    const params = new URLSearchParams({
      accessId,
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    if (search.trim() !== "") {
      params.append("searchTerm", search);
    }
    return await requests.get("/account", params);
  },
  getAccountById: async (
    accessId: string,
    accountId: string
  ): Promise<AccountDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`account/${accountId}`, params);
  },
  createAccount: async (
    accessId: string,
    financialYearFrom: string,
    accountDto: AccountDto
  ) => {
    const params = new URLSearchParams({ accessId, financialYearFrom });
    return await requests.post("account", accountDto, params);
  },
  updateAccount: async (
    accessId: string,
    accountId: string,
    financialYearFrom: string,
    accountDto: AccountDto
  ) => {
    const params = new URLSearchParams({ accessId, financialYearFrom });
    return await requests.put(`account/${accountId}`, accountDto, params);
  },
  deleteAccount: async (
    accessId: string,
    accountId: string,
    financialYearFrom: string
  ) => {
    const params = new URLSearchParams({ accessId, financialYearFrom });
    return await requests.delete(`account/${accountId}`, params);
  },

  getAccountsByGroupNames: async (accessId: string, groupNames: string[]) => {
    const params = new URLSearchParams({ accessId });
    groupNames.forEach((name: string) => params.append("groupNames", name));
    return await requests.get(`account/ByGroupNames`, params);
  },
  getAccountsByGSTSlabId: async (
    accessId: string,
    gstSlabId: number
  ): Promise<AccountDtoForDropDownList[]> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`account/ByGSTSlabId/${gstSlabId}`, params);
  },
  getAllAccountsForDropDownList: async (
    accessId: string,
    financialYearFrom: string,
    tillDateBalance: string
  ): Promise<AccountDtoForDropDownList[]> => {
    const params = new URLSearchParams({
      accessId,
      financialYearFrom,
      tillDateBalance,
    });
    return await requests.get(`Account/GetAllAccountsForDropDownList`, params);
  },
};
const ItemCategory = {
  getAllItemCategories: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("itemCategory/GetAllItemCategories", params);
  },
  getItemCategoryById: async (accessId: string, itemCategoryID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`itemCategory/${itemCategoryID}`, params);
  },
  createItemCategory: async (
    accessId: string,
    itemCategory: ItemCategoryDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post(
      "itemCategory/CreateItemCategory",
      itemCategory,
      params
    );
  },
  updateItemCategory: async (
    accessId: string,
    itemCategoryID: number,
    itemCategory: ItemCategoryDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `itemCategory/${itemCategoryID}`,
      itemCategory,
      params
    );
  },
  deleteItemCategory: async (accessId: string, itemCategoryID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`itemCategory/${itemCategoryID}`, params);
  },
};

const Item = {
  getItemsForDropDownList: async (
    accessId: string,
    financialYearFrom: string,
    tillDate: string
  ): Promise<ItemDropDownListDto[]> => {
    const params = new URLSearchParams({
      accessId,
      financialYearFrom,
      tillDate,
    });
    return await requests.get(`items/LoadItemsForDropDownList`, params);
  },
  getVoucherItemsForDropDownList: async (
    accessId: string,
    selectedTaxType: string,
    financialYearFrom: string,
    tillDate: string
  ): Promise<ItemDropDownListDto[]> => {
    const params = new URLSearchParams({
      accessId,
      selectedTaxType,
      financialYearFrom,
      tillDate,
    });
    return await requests.get(`items/LoadVoucherItemsForDropDownList`, params);
  },
  getAllItems: async (
    accessId: string,
    {
      pageNumber,
      pageSize,
      search = "",
    }: { pageNumber: number; pageSize: number; search?: string }
  ): Promise<any> => {
    const params = new URLSearchParams({
      accessId,
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    if (search.trim() !== "") {
      params.append("searchTerm", search);
    }

    return await requests.get("/items/GetAllItems", params);
  },
  getItemById: async (
    accessId: string,
    itemId: number
  ): Promise<ItemFormDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`items/${itemId}`, params);
  },
  createItem: async (accessId: string, item: ItemFormDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("items/CreateItem", item, params);
  },
  updateItem: async (accessId: string, itemId: number, item: ItemFormDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`items/${itemId}`, item, params);
  },
  deleteItem: async (accessId: string, itemId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`items/${itemId}`, params);
  },
  getHSNCodesByPrefix: async (
    accessId: string,
    hsnCodePrefix: string
  ): Promise<any> => {
    const params = new URLSearchParams({
      accessId,
      hsnCodePrefix,
    });
    return await requests.get("/Items/HSNCodes", params);
  },
  //For Sale/Purchase Voucher
  getItemDetailById: async (
    accessId: string,
    itemId: number
  ): Promise<ItemDetailDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`items/ItemDetails/${itemId}`, params);
  },
};
const PaymentAndReceipt = {
  savePaymentOrReceipt: async (
    accessId: string,
    paymentAndReceiptDto: PaymentAndReceiptDto,
    existingVoucherId = ""
  ) => {
    const params = new URLSearchParams({ accessId, existingVoucherId });
    return await requests.post(
      "PaymentAndReceipt/SavePaymentOrReceipt",
      paymentAndReceiptDto,
      params
    );
  },

  getAccountsForDropDownListPaymentOrReceipt: async (
    accessId: string,
    financialYearFrom: string,
    tillDateBalance: string,
    voucherType: VoucherTypeEnum,
    showBankAccount: Boolean,
    showTradingAccounts: Boolean
  ): Promise<AccountDtoForDropDownList[]> => {
    const params = new URLSearchParams({
      accessId,
      financialYearFrom,
      tillDateBalance,
      voucherType: voucherType.toString(),
      showBankAccount: showBankAccount.toString(),
      showTradingAccounts: showTradingAccounts.toString(),
    });
    return await requests.get(
      `PaymentAndReceipt/GetAccountsForDropDownListPaymentOrReceipt`,
      params
    );
  },
  getAllPaymentOrReceiptVouchersByDate: async (
    accessId: string,
    voucherDate: string,
    voucherType: VoucherTypeEnum
  ): Promise<PaymentAndReceiptEntriesAndTotalsDto> => {
    const params = new URLSearchParams({
      accessId,
      voucherDate,
      voucherType: voucherType.toString(),
    });
    return await requests.get(
      `PaymentAndReceipt/GetAllPaymentOrReceiptVouchersByDate`,
      params
    );
  },
  getPaymentOrReceiptVoucherById: async (
    accessId: string,
    voucherId: string
  ): Promise<PaymentAndReceiptDto> => {
    const params = new URLSearchParams({
      accessId,
      voucherId,
    });
    return await requests.get(
      `PaymentAndReceipt/GetPaymentOrReceiptVoucherById`,
      params
    );
  },
};
const BankEntry = {
  saveBankEntry: async (
    accessId: string,
    bankEntryDto: BankEntryDto,
    existingVoucherId = ""
  ) => {
    const params = new URLSearchParams({ accessId, existingVoucherId });
    return await requests.post("BankEntry/SaveBankEntry", bankEntryDto, params);
  },

  getAccountsForDropDownListBankEntry: async (
    accessId: string,
    financialYearFrom: string,
    tillDateBalance: string
  ): Promise<AccountDtoForDropDownList[]> => {
    const params = new URLSearchParams({
      accessId,
      financialYearFrom,
      tillDateBalance,
    });
    return await requests.get(
      `bankEntry/GetAccountsForDropDownListBankEntry`,
      params
    );
  },
  getAllBankEntriesByDate: async (
    accessId: string,
    voucherDate: string
  ): Promise<BankEntriesAndTotalsDto> => {
    const params = new URLSearchParams({
      accessId,
      voucherDate,
    });
    return await requests.get(`bankEntry/GetAllBankEntriesByDate`, params);
  },
  getBankEntryById: async (
    accessId: string,
    voucherId: string
  ): Promise<BankEntryDto> => {
    const params = new URLSearchParams({
      accessId,
      voucherId,
    });
    return await requests.get(`bankEntry/GetBankEntryById`, params);
  },
};
const Vouchers = {
  getLastVoucherDate: async (
    accessId: string,
    financialYearDto: FinancialYearDto | null,
    voucherType: VoucherTypeEnum | null
  ): Promise<Date> => {
    const params = new URLSearchParams({
      accessId,
      voucherType: voucherType == null ? "" : voucherType.toString(),
    });
    return await requests.post(
      "voucher/LastVoucherDate",
      financialYearDto,
      params
    );
  },
  delete: async (
    accessId: string,
    voucherId: string,
    voucherType: VoucherTypeEnum
  ) => {
    const params = new URLSearchParams({
      accessId: accessId,
      voucherId: voucherId,
      voucherType: voucherType.toString(),
    });
    return await requests.delete(`voucher/${voucherId}`, params);
  },
  getVoucherById: async (accessId: string, voucherId: string) => {
    const params = new URLSearchParams({
      accessId: accessId,
      voucherId: voucherId,
    });
    // return await requests.get(`voucher/${voucherId}`, params);
    const response = await requests.get(`voucher/${voucherId}`, params);
    // Assuming response.data contains the voucher data
    if (response) {
      const voucherData = response;
      if (
        voucherData.voucherItemDetails &&
        voucherData.voucherItemDetails.length > 0
      ) {
        try {
          voucherData.voucherItemDetails.map((item: any) => {
            if (item.serialNumberValues) {
              item.serialNumberValues = JSON.parse(item.serialNumberValues);
            }
          });
        } catch (error) {
          console.error("Error parsing SerialNumberValues:", error);
        }
      }
    }

    return response;
  },
};
const ControlOptions = {
  list: async (
    accessId: string,
    voucherType: VoucherTypeEnum
  ): Promise<ControlOptionDto[]> => {
    const params = new URLSearchParams({
      accessId,
      voucherType: voucherType.toString(),
    });
    return await requests.get(
      "ControlPanel/GetControlOptionsByVoucherType",
      params
    );
  },
  UpdateControlOptions: async (
    accessId: string,
    voucherType: VoucherTypeEnum,
    controlOptions: ControlOptionDto[]
  ) => {
    const params = new URLSearchParams({
      accessId,
      voucherType: voucherType.toString(),
    });
    return await requests.put(
      `ControlPanel/UpdateControlOptions`,
      controlOptions,
      params
    );
  },
};
const JournalEntry = {
  saveJournalEntry: async (
    accessId: string,
    JournalEntryDto: JournalEntryDto,
    existingVoucherId = ""
  ) => {
    const params = new URLSearchParams({ accessId, existingVoucherId });
    return await requests.post(
      "JournalEntry/SaveJournalEntry",
      JournalEntryDto,
      params
    );
  },

  GetAccountsForDropDownListJournalEntry: async (
    accessId: string,
    financialYearFrom: string,
    tillDateBalance: string
  ): Promise<AccountDtoForDropDownList[]> => {
    const params = new URLSearchParams({
      accessId,
      financialYearFrom,
      tillDateBalance,
    });
    return await requests.get(
      `JournalEntry/GetAccountsForDropDownListJournalEntry`,
      params
    );
  },
  getJournalEntryById: async (
    accessId: string,
    voucherId: string
  ): Promise<JournalEntryDto> => {
    const params = new URLSearchParams({
      accessId,
      voucherId,
    });
    return await requests.get(`journalEntry/GetJournalEntryById`, params);
  },
};
const Reports = {
  getLedgerReport: async (
    accessId: string,
    accountId: string,
    fromDate: string,
    toDate: string,
    financialYearFrom: string
  ): Promise<LedgerReportDto[]> => {
    const params = new URLSearchParams({
      accessId,
      accountId,
      fromDate,
      toDate,
      financialYearFrom,
    });
    return await requests.get(`reports/LedgerReport`, params);
  },
  ItemRegister: async (
    accessId: string,
    fromDate: string,
    toDate: string,
    financialYearFrom: string,
    voucherType: VoucherTypeEnum
  ): Promise<ItemRegisterDto[]> => {
    const params = new URLSearchParams({
      accessId,
      fromDate,
      toDate,
      financialYearFrom,
      voucherType: String(voucherType)
    });
    return await requests.get(`reports/ItemRegister`, params);
  },

  getTrailBalanceReport: async (
    accessId: string,
    fromDate: string,
    toDate: string
  ): Promise<TrialBalanceDto> => {
    const params = new URLSearchParams({
      accessId,
      fromDate,
      toDate,
    });
    return await requests.get(`reports/TrialBalanceReport`, params);
  },
};


const BillBook = {
  getAllBillBooks: async (
    accessId: string,
    voucherType: string = "Sale"
  ): Promise<BillBookDto[]> => {
    const params = new URLSearchParams({ accessId, voucherType });
    return await requests.get("billBook/GetAllBillBooks", params);
  },
  getBillBookById: async (accessId: string, billBookId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`billBook/${billBookId}`, params);
  },
  createBillBook: async (accessId: string, billBook: BillBookDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("billBook/CreateBillBook", billBook, params);
  },
  updateBillBook: async (
    accessId: string,
    billBookId: number,
    billBook: BillBookDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.put(`billBook/${billBookId}`, billBook, params);
  },
  deleteBillBook: async (accessId: string, billBookId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`billBook/${billBookId}`, params);
  },
};
const SalePurchase = {
  getAccountsForDropDownListSalePurchase: async (
    accessId: string,
    financialYearFrom: string,
    tillDateBalance: string
  ): Promise<AccountDtoForDropDownList[]> => {
    const params = new URLSearchParams({
      accessId,
      financialYearFrom,
      tillDateBalance,
    });
    return await requests.get(
      `SalePurchase/GetAccountsForDropDownListSalePurchase`,
      params
    );
  },
  getLastVoucherInfoBySaleBillBookId: async (
    accessId: string,
    billBookId: string,
    voucherType: VoucherTypeEnum
) => {
    const params = new URLSearchParams({ 
        accessId, 
        billBookId, 
        voucherType: String(voucherType) // Convert enum to string
    });
    return await requests.get(
        `SalePurchase/GetLastVoucherNoBySaleBillBookId?${params.toString()}`
    );
},
  saveVoucher: async (
    accessId: string,
    dto: ItemSalePurchaseVoucherDto,
    existingVoucherId: string
  ) => {
    const params = new URLSearchParams({ accessId, existingVoucherId });
    return await requests.post("SalePurchase/SaveVoucher", dto, params);
  },

  updateVoucher: async (accessId: string, dto: ItemSalePurchaseVoucherDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`SalePurchase/UpdateVoucher`, dto, params);
  },

  deleteVoucher: async (accessId: string, voucherId: string) => {
    const params = new URLSearchParams({
      accessId: accessId,
      voucherId: voucherId,
    });
    return await requests.delete(`SalePurchase/${voucherId}`, params);
  },

  getVoucherById: async (accessId: string, voucherId: string) => {
    const params = new URLSearchParams({
      accessId: accessId,
      voucherId: voucherId,
    });
    return await requests.get(`SalePurchase/GetVoucherById`, params);
  },

  checkIfBillNumberExists: async (
    accessId: string,
    billBookId: string,
    voucherNo: string
  ) => {
    const params = new URLSearchParams({
      accessId: accessId,
      billBookId: billBookId,
      voucherNo: voucherNo,
    });
    return await requests.get(`SalePurchase/CheckIfBillNumberExists`, params);
  },
};
const SerialNumber = {
  getAll: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("serialNumber", params);
  },
  getById: async (accessId: string, id: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`serialNumber/${id}`, params);
  },
  create: async (accessId: string, data: SerialNumberDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("serialNumber", data, params);
  },
  update: async (accessId: string, id: string, data: SerialNumberDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`serialNumber/${id}`, data, params);
  },
  delete: async (accessId: string, id: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`serialNumber/${id}`, params);
  },
};
const AdditionalField = {
  getAll: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("AdditionalField", params);
  },
  getById: async (accessId: string, id: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`AdditionalField/${id}`, params);
  },
  create: async (accessId: string, data: AdditionalFieldDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("AdditionalField", data, params);
  },
  update: async (accessId: string, id: string, data: AdditionalFieldDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`AdditionalField/${id}`, data, params);
  },
  delete: async (accessId: string, id: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`AdditionalField/${id}`, params);
  },
};
const AdditionalFieldType = {
  getAll: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("AdditionalFieldType", params);
  },
};
const CommissionAgentItem = {
  getAllCommissionAgentItems: async (
    accessId: string
  ): Promise<CommissionAgentItemDto[]> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(
      "commissionAgentItem/GetAllCommissionAgentItems",
      params
    );
  },
  getCommissionAgentItemById: async (accessId: string, itemId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`commissionAgentItem/${itemId}`, params);
  },
  createCommissionAgentItem: async (
    accessId: string,
    item: CommissionAgentItemDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post(
      "commissionAgentItem/CreateCommissionAgentItem",
      item,
      params
    );
  },
  updateCommissionAgentItem: async (
    accessId: string,
    itemId: number,
    item: CommissionAgentItemDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`commissionAgentItem/${itemId}`, item, params);
  },
  deleteCommissionAgentItem: async (accessId: string, itemId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`commissionAgentItem/${itemId}`, params);
  },
};
const Mandi = {
  getAllMandis: async (accessId: string): Promise<MandiDto[]> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("mandi/GetAllMandis", params);
  },
  getMandiById: async (
    accessId: string,
    mandiId: number
  ): Promise<MandiDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`mandi/${mandiId}`, params);
  },
  createMandi: async (accessId: string, mandi: MandiDto): Promise<MandiDto> => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("mandi/CreateMandi", mandi, params);
  },
  updateMandi: async (
    accessId: string,
    mandiId: number,
    mandi: MandiDto
  ): Promise<void> => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`mandi/${mandiId}`, mandi, params);
  },
  deleteMandi: async (accessId: string, mandiId: number): Promise<void> => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`mandi/${mandiId}`, params);
  },
};

const Email = {
  // sendEmails: async (accessId: string) => {
  //   const params = new URLSearchParams({ accessId });
  //   return await requests.post("email/SendEmails", params);
  // },
  sendEmails: async (accessId: string, files: File[]) => {
    console.log("API call initiated");
    const formData = new FormData();
    formData.append("accessId", accessId);

    files.forEach((file) => {
      formData.append("attachments", file);
    });

    return await axios
      .post("email/SendEmails", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(responseBody);
  },

  getAllEmails: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("email/GetAllEmails", params);
  },
  getEmailById: async (accessId: string, emailID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`email/${emailID}`, params);
  },
  createEmail: async (accessId: string, email: EmailDto) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post("email/CreateEmail", email, params);
  },
  updateEmail: async (accessId: string, emailID: number, email: EmailDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`email/${emailID}`, email, params);
  },
  deleteEmail: async (accessId: string, emailID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`email/${emailID}`, params);
  },
};


const Transporter = {
  getAllTransporters: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("transporter/GetAllTransporters", params);
  },
  getTransporterById: async (accessId: string, transporterId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`transporter/${transporterId}`, params);
  },
  createTransporter: async (
    accessId: string,
    transporter: TransporterDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post(
      "transporter/CreateTransporter",
      transporter,
      params
    );
  },
  updateTransporter: async (
    accessId: string,
    transporterId: number,
    transporter: TransporterDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `transporter/${transporterId}`,
      transporter,
      params
    );
  },
  deleteTransporter: async (accessId: string, transporterId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`transporter/${transporterId}`, params);
  },
};


const Vehicle = {
  getAllVehicles: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("vehicle/GetAllVehicles", params);
  },
  getVehicleById: async (accessId: string, vehicleId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`vehicle/${vehicleId}`, params);
  },
  createVehicle: async (
    accessId: string,
    vehicle: VehicleDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post(
      "vehicle/CreateVehicle",
      vehicle,
      params
    );
  },
  updateVehicle: async (
    accessId: string,
    vehicleId: number,
    vehicle: VehicleDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `vehicle/${vehicleId}`,
      vehicle,
      params
    );
  },
  deleteVehicle: async (accessId: string, vehicleId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`vehicle/${vehicleId}`, params);
  },
};

 const Student = {
  create: async (student: StudentAdmissionDto) => {
    const params = new URLSearchParams();
    return await requests.post("student/create", student, params);
  },
  list: async () => {
    return await requests.get("student/list");
  }
};

const Class = {
  getAllClasses: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("class/GetAllClasses", params);
  },
  getClassById: async (accessId: string, classID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`class/${classID}`, params);
  },
  createClass: async (
    accessId: string,
    classData: ClassDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post(
      "class/CreateClass",
      classData,
      params
    );
  },
  updateClass: async (
    accessId: string,
    classID: number,
    classData: ClassDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `class/${classID}`,
      classData,
      params
    );
  },
  deleteClass: async (accessId: string, classID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`class/${classID}`, params);
  },
};


const Section = {
  getAllSections: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("section/GetAllSections", params);
  },
  getSectionById: async (accessId: string, sectionID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`section/${sectionID}`, params);
  },
  createSection: async (
    accessId: string,
    section: SectionDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post(
      "section/CreateSection",
      section,
      params
    );
  },
  updateSection: async (
    accessId: string,
    sectionID: number,
    section: SectionDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `section/${sectionID}`,
      section,
      params
    );
  },
  deleteSection: async (accessId: string, sectionID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`section/${sectionID}`, params);
  },
};


const SchoolCategory = {
  getAllSchoolCategories: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("schoolCategory/GetAllSchoolCategories", params);
  },
  getSchoolCategoryById: async (accessId: string, schoolCategoryID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`schoolCategory/${schoolCategoryID}`, params);
  },
  createSchoolCategory: async (
    accessId: string,
    schoolCategory: SchoolCategoryDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post(
      "schoolCategory/CreateSchoolCategory",
      schoolCategory,
      params
    );
  },
  updateSchoolCategory: async (
    accessId: string,
    schoolCategoryID: number,
    schoolCategory: SchoolCategoryDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `schoolCategory/${schoolCategoryID}`,
      schoolCategory,
      params
    );
  },
  deleteSchoolCategory: async (accessId: string, schoolCategoryID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`schoolCategory/${schoolCategoryID}`, params);
  },
};


const FeeHeading = {
  getAllFeeHeadings: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("feeHeading/GetAllFeeHeadings", params);
  },
  getFeeHeadingById: async (accessId: string, feeHeadingID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`feeHeading/${feeHeadingID}`, params);
  },
  createFeeHeading: async (
    accessId: string,
    feeHeading: FeeHeadingDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post(
      "feeHeading/CreateFeeHeading",
      feeHeading,
      params
    );
  },
  updateFeeHeading: async (
    accessId: string,
    feeHeadingID: number,
    feeHeading: FeeHeadingDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `feeHeading/${feeHeadingID}`,
      feeHeading,
      params
    );
  },
  deleteFeeHeading: async (accessId: string, feeHeadingID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`feeHeading/${feeHeadingID}`, params);
  },
};

const FeePlan = {
  getAllFeePlans: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("feePlan/GetAllFeePlans", params);
  },
  getFeePlanById: async (accessId: string, feePlanID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`feePlan/${feePlanID}`, params);
  },
  createFeePlan: async (
    accessId: string,
    feePlan: FeePlanDto
  ) => {
    const params = new URLSearchParams({ accessId });

    return await requests.post(
      "feePlan/CreateFeePlan",
      feePlan,
      params
    );
  },
  updateFeePlan: async (
    accessId: string,
    feePlanID: number,
    feePlan: FeePlanDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(
      `feePlan/${feePlanID}`,
      feePlan,
      params
    );
  },
  deleteFeePlan: async (accessId: string, feePlanID: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`feePlan/${feePlanID}`, params);
  },
};


const BatchNumber = {
  getAllBatches: async (accessId: string) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get("batch", params);
  },
  getBatchById: async (accessId: string, batchId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.get(`batch/${batchId}`, params);
  },
  createBatch: async (accessId: string, batchNumberDto: BatchNumberDto) => {
    const params = new URLSearchParams({ accessId });
    return await requests.post("batch", batchNumberDto, params);
  },
  updateBatch: async (
    accessId: string,
    batchId: number,
    batchNumberDto: BatchNumberDto
  ) => {
    const params = new URLSearchParams({ accessId });
    return await requests.put(`batch/${batchId}`, batchNumberDto, params);
  },
  deleteBatch: async (accessId: string, batchId: number) => {
    const params = new URLSearchParams({ accessId });
    return await requests.delete(`batch/${batchId}`, params);
  },
};

const agent = {
  UserAccount,
  Company,
  FinancialYear,
  AccountGroup,
  City,
  ItemUnit,
  GSTSlab,
  Account,
  States,
  ItemCompany,
  ItemGodown,
  ItemCategory,
  Item,
  Vouchers,
  PaymentAndReceipt,
  ControlOptions,
  BankEntry,
  JournalEntry,
  Reports,
  BillBook,
  SalePurchase,
  SerialNumber,
  AdditionalField,
  AdditionalFieldType,
  CommissionAgentItem,
  Mandi,
  Email,
  Transporter,
  Vehicle,
  Student,
  Class,
  Section,
  SchoolCategory,
  FeeHeading,
  FeePlan,
  BatchNumber
};

export default agent;
