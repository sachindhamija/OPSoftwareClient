import {
    CommonCard,
    CommonTable,
    CustomButton,
    CustomDateInputBox,
    CustomDropdown,
    CustomInput,
    FormNavigator,
  } from "../../../app/components/Components";
  import { Suspense, useEffect, useRef, useState } from "react";
  import { useAppSelector } from "../../../app/store/configureStore";
  import {
    convertNullOrEmptyToZero,
    formatNumberIST,
  } from "../../../app/utils/numberUtils";
  import agent from "../../../app/api/agent";
  import toast from "react-hot-toast";
  import handleApiErrors from "../../../app/errors/handleApiErrors";
  import { Col, Row } from "react-bootstrap";
  import { useForm } from "react-hook-form";
  import { selectCurrentFinancialYear } from "../../Masters/FinancialYear/financialYearSlice";
  import CommonModal from "../../../app/components/CommonModal";
  import {
    formatDateForBackend,
    formatDateForFrontend,
    validateDate,
  } from "../../../app/utils/dateUtils";
  import { ItemStockTransferDto } from "./ItemStockTransferDto";
  import { VoucherTypeEnum } from "../VoucherCommon/voucherTypeEnum";
  import { AccountDtoForDropDownList } from "../../Masters/Account/accountDto";
  import { ColumnDef } from "@tanstack/react-table";
  import getLastVoucherDate from "../../../app/hooks/useLastVoucherDate";
  import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";
  import { OptionType } from "../../../app/models/optionType";
  import ItemForm from "../../Masters/Item/ItemForm";

  interface CreditSaleEntryProps {
    voucherId?: string;
    isInModal?: boolean;
    onSuccessfulSubmit?: () => void;
  }
  
  function CreditSaleEntry({
    voucherId = undefined,
    isInModal = false,
    onSuccessfulSubmit,
  }: CreditSaleEntryProps) {
    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const voucherType = VoucherTypeEnum.BankEntry;
    const [currentVoucherId, setCurrentVoucherId] = useState(voucherId);
    const [itemDropDownList] = useState<OptionType[]>([]);
    const [ShowItemModal, setShowItemModal] = useState(false);
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      control,
      formState: { errors, isSubmitting },
      reset,
    } = useForm<ItemStockTransferDto>({
      mode: "all",
    });
 
    const [, setBankAccountOptions] = useState<AccountDtoForDropDownList[]>([]);
    const [accountOptions, setAccountOptions] = useState<
      AccountDtoForDropDownList[]
    >([]);
    const [entriesList, setEntriesList] = useState<ItemStockTransferDto[]>([]);
    const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);
    const voucherDateRef = useRef<HTMLInputElement>(null);
    const voucherDate = watch("voucherDate");
  
    const bankEntryTypeRef = useRef<HTMLInputElement | null>(null);
    const [totals, setTotals] = useState({
      totalAmount: 0,
      totalExpenses: 0,
      totalNetAmount: 0,
    });
    const [, setIsAccountDropdownDisabled] =
      useState(false);
    const [, setIsExpensesDisabled] = useState(false);
    const [, setIsChequeBookDisabled] = useState(false);
  
    const amount = watch("amount");
    const expense = watch("expense");
    const bankEntryType = watch("bankEntryType", "");

  
    const columns: ColumnDef<ItemStockTransferDto>[] = [
      {
        accessorFn: (row) => formatDateForFrontend(row.voucherDate),
        id: "voucherDate",
        header: "EntryDate",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.bankName,
        id: "billNo",
        header: "Bill no.",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.accountName,
        id: "accountName",
        header: "Account Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.chequeNumber,
        id: "itemName",
        header: "Item Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.remarks,
        id: "qty",
        header: "Qty",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => formatNumberIST(row.amount),
        id: "amount",
        header: "Amount",
        cell: (info) => info.getValue(),
      },
    ];
    useEffect(() => {
      if (
        accessId &&
        financialYear &&
        voucherType !== undefined &&
        voucherId == undefined
      ) {
        getLastVoucherDate(accessId, voucherType, financialYear)
          .then((date) => {
            setLastVoucherDate(date);
            setTimeout(() => {
              if (voucherDateRef.current) {
                voucherDateRef.current.focus();
                voucherDateRef.current.select();
              }
            }, 100);
          })
          .catch((error) => {
            console.error("Error fetching last voucher date:", error);
            toast.error("Failed to fetch last voucher date.");
          });
      }
    }, [accessId, financialYear, voucherType]);
  
    useEffect(() => {
      const calcNetAmount = () => {
        const amt = Number(amount) || 0;
        const exp = Number(expense) || 0;
        let netAmount =
          bankEntryType === "Cheque Received/Neft/Rtgs/UPI"
            ? amt - exp
            : amt + exp;
        return netAmount;
      };
      setValue("netAmount", calcNetAmount());
    }, [amount, expense, bankEntryType, setValue]);
  
    useEffect(() => {
      if (bankEntryType.toLowerCase().includes("cash")) {
        const cashAccount = accountOptions.find(
          (acc) => acc.accountName == "CASH"
        );
        if (cashAccount) {
          setValue("accountId", cashAccount.accountID);
          setIsAccountDropdownDisabled(true);
          if (bankEntryType.toLowerCase().includes("deposit")) {
            setIsChequeBookDisabled(true);
            setIsExpensesDisabled(true);
          } else if (bankEntryType.toLowerCase().includes("withdraw")) {
            setIsChequeBookDisabled(false);
            setIsExpensesDisabled(false);
          }
        }
      } else if (bankEntryType.toLowerCase().includes("interest")) {
        const bankInterestAccount = accountOptions.find(
          (acc) => acc.accountName == "BANK INTEREST"
        );
        if (bankInterestAccount) {
          setValue("accountId", bankInterestAccount.accountID);
          setIsAccountDropdownDisabled(true);
          setIsChequeBookDisabled(true);
          setIsExpensesDisabled(true);
        }
      } else if (bankEntryType.toLowerCase().includes("expenses")) {
        const bankExpensesAccount = accountOptions.find(
          (acc) => acc.accountName == "BANK CHARGES"
        );
        if (bankExpensesAccount) {
          setValue("accountId", bankExpensesAccount.accountID);
          setIsAccountDropdownDisabled(true);
          setIsChequeBookDisabled(true);
          setIsExpensesDisabled(true);
        }
      } else if (bankEntryType.toLowerCase().includes("received")) {
        setIsExpensesDisabled(true);
      } else {
        setValue("accountId", "");
        setIsAccountDropdownDisabled(false);
        setIsChequeBookDisabled(false);
        setIsExpensesDisabled(false);
        setTimeout(() => bankEntryTypeRef.current?.focus(), 1);
      }
    }, [bankEntryType, setValue]);
  
    const fetchAccounts = async (currentVoucherDate: Date | string) => {
      if (!accessId || !financialYear) return;
      const financialYearFrom = financialYear.financialYearFrom;
      try {
        const accounts =
          await agent.BankEntry.getAccountsForDropDownListBankEntry(
            accessId,
            financialYearFrom.toString(),
            formatDateForBackend(currentVoucherDate)
          );
        const bankAccounts = accounts.filter(
          (account) => account.accountGroupName === "BANK ACCOUNTS"
        );
        const otherAccounts = accounts.filter(
          (account) => account.accountGroupName !== "BANK ACCOUNTS"
        );
        setBankAccountOptions(bankAccounts);
        setAccountOptions(otherAccounts);
      } catch (error) {
        toast.error("Failed to fetch accounts for dropdown.");
        console.error(error);
      }
    };
  
    const fetchEntriesAsPerDate = async () => {
      try {
        setTotals({ totalAmount: 0, totalExpenses: 0, totalNetAmount: 0 });
        const dateToUse = validateDate(voucherDate) ? voucherDate : "";
        if (dateToUse) {
          const formattedDate = formatDateForBackend(voucherDate.toString());
          const response = await agent.BankEntry.getAllBankEntriesByDate(
            accessId,
            formattedDate
          );
          setEntriesList(
            response.entries.map((entry) => ({
              ...entry,
              billNo: Number(entry.billNo) || 0,
            }))
          );
          setTotals(response.totals);
        }
      } catch (error) {
        toast.error("Failed to fetch Entries List.");
      }
    };
  
    useEffect(() => {
      if (voucherDate && validateDate(voucherDate) && !currentVoucherId) {
        fetchAccounts(voucherDate);
        fetchEntriesAsPerDate();
      }
    }, [accessId, voucherDate, financialYear, voucherType]);
  
    const handleDelete = async () => {
      if (currentVoucherId !== undefined) {
        if (window.confirm("Are you sure you want to delete this voucher?")) {
          try {
            await agent.Vouchers.delete(accessId, currentVoucherId, voucherType);
            toast.success("Voucher deleted successfully");
            if (isInModal && onSuccessfulSubmit) {
              onSuccessfulSubmit();
            }
            resetForm();
            fetchEntriesAsPerDate();
          } catch (error) {
            console.error("Error deleting voucher:", error);
            handleApiErrors(error);
          }
        }
      }
    };
  
    const onSubmit = async (data: ItemStockTransferDto) => {
      const isUpdate = !!currentVoucherId;
      try {
        data.voucherDate = formatDateForBackend(data.voucherDate);
        const numericFields: (keyof ItemStockTransferDto)[] = [
          "amount",
          "expense",
          "netAmount",
        ];
        const processedData = convertNullOrEmptyToZero(data, numericFields);
  
        if (Number(data.netAmount) <= 0) {
          toast.error("Net amount must be greater than zero.");
          return;
        }
        if (isUpdate) {
          await agent.BankEntry.saveBankEntry(
            accessId,
            { ...processedData, billNo: processedData.billNo.toString() },
            currentVoucherId
          );
          toast.success("Voucher updated successfully");
        } else {
          await agent.BankEntry.saveBankEntry(accessId, {
            ...processedData,
            billNo: processedData.billNo.toString(),
          });
          toast.success("Voucher created successfully");
        }
        if (isInModal && onSuccessfulSubmit) {
          onSuccessfulSubmit();
        }
  
        fetchEntriesAsPerDate();
        resetForm();
      } catch (error) {
        console.error("Error in onSubmit:", error);
        handleApiErrors(error);
      }
    };
  
    const resetForm = () => {
      const resetValues = {
        bankAccountId: "",
        bankName: "",
        bankEntryType: "",
        accountId: "",
        accountName: "",
        amount: 0,
        expense: 0,
        netAmount: 0,
        chequeNumber: "",
        chequeDate: "",
        remarks: "",
        voucherId: null,
      };
      setCurrentVoucherId("");
      reset(resetValues);
      setTimeout(() => {
        if (voucherDateRef.current) {
          voucherDateRef.current.focus();
          voucherDateRef.current.select();
        }
      }, 0);
    };
  
    function handleEdit(row: ItemStockTransferDto): void {
      if (row.voucherId) {
        setCurrentVoucherId(row.voucherId);
        setValue("voucherDate", formatDateForFrontend(row.voucherDate));
        setValue("bankEntryType", row.bankEntryType ?? "");
        setValue("bankAccountId", row.bankAccountId);
        setValue("bankName", row.bankName);
        setValue("accountId", row.accountId);
        setValue("accountName", row.accountName ?? "");
        setValue("chequeNumber", row.chequeNumber);
        setValue("chequeDate", row.chequeDate);
        setValue("amount", row.amount);
        setValue("expense", row.expense);
        setValue("netAmount", row.netAmount);
        setValue("remarks", row.remarks ?? "");
        setTimeout(() => {
          if (voucherDateRef.current) {
            voucherDateRef.current.focus();
            voucherDateRef.current.select();
          }
        }, 100);
      }
    }
  
    useEffect(() => {
      const getVoucherById = async () => {
        if (voucherId == undefined || !isInModal) return;
        try {
          const voucher = await agent.BankEntry.getBankEntryById(
            accessId,
            voucherId
          );
          if (voucher) {
            setCurrentVoucherId(voucherId);
            const newVoucherDate = new Date(voucher.voucherDate);
            setLastVoucherDate(newVoucherDate);
            await fetchAccounts(newVoucherDate);
            setAccountOptions((prevOptions) => {
              const selectedAccountOption = prevOptions.find(
                (option) => option.accountID === voucher.accountId
              );
              if (selectedAccountOption) {
                setValue("accountId", selectedAccountOption.accountID);
              }
              return prevOptions;
            });
            setBankAccountOptions((prevOptions) => {
              const selectedBankAccount = prevOptions.find(
                (option) => option.accountID === voucher.bankAccountId
              );
              if (selectedBankAccount) {
                setValue("bankAccountId", selectedBankAccount.accountID);
              }
              return prevOptions;
            });
            setValue("bankEntryType", voucher.bankEntryType);
            setValue("amount", voucher.amount);
            setValue("expense", voucher.expense);
            setValue("netAmount", voucher.netAmount);
            setValue("chequeNumber", voucher.chequeNumber);
            setValue("chequeDate", voucher.chequeDate);
            setValue("remarks", voucher.remarks ?? "");
            setValue("voucherDate", formatDateForFrontend(newVoucherDate));
            setTimeout(() => {
              if (voucherDateRef.current) {
                voucherDateRef.current.focus();
                voucherDateRef.current.select();
              }
            }, 100);
          }
        } catch (error) {
          console.error("Error fetching voucher details:", error);
          toast.error("Failed to fetch voucher details.");
        }
      };
      getVoucherById();
    }, [accessId, voucherId]);
  
    useEffect(() => {
      fetchEntriesAsPerDate();
    }, [voucherDate]);
  
    return (
      <>
        <CommonCard header="Item Stock Transfer" size="100%">
          <FormNavigator
            onSubmit={handleSubmit(onSubmit)}
            isModalOpen={isInModal}
          >
            <Row>
              <Col xs={12} md={2}>
                <CustomDateInputBox
                  autoFocus
                  label="Date"
                  name="voucherDate"
                  validationRules={{
                    required: "Date is required.",
                  }}
                  register={register}
                  setValue={setValue}
                  error={errors.voucherDate}
                  financialYear={financialYear}
                  defaultDate={lastVoucherDate}
                  WarningForAdvanceEntry={true}
                  inputRef={voucherDateRef}
                />
              </Col>
              
              <Col xs={10} md={3}>
                <CustomDropdown
                  label="From - Item Name"
                  name="ItemName"
                  options={itemDropDownList}
                  control={control}
                  isCreatable
                  onCreateButtonClick={() => {
                    setShowItemModal(true);
                  }}
                  dropDownWidth="800px"
                  onChangeCallback={(selectedOption: OptionType | null) => {
                    if (selectedOption) {
                      setValue("ItemName", selectedOption.value);
                    } else {
                      setValue("ItemName", "");
                    }
                  }}
                  hideDropdownIcon
                  hideClearIcon
                  isInTable
                />
              </Col>
              <Col xs={10} md={3}>
                <CustomDropdown
                  label="To - Item Name"
                  name="ItemName"
                  options={itemDropDownList}
                  control={control}
                  isCreatable
                  onCreateButtonClick={() => {
                    setShowItemModal(true);
                  }}
                  dropDownWidth="800px"
                  onChangeCallback={(selectedOption: OptionType | null) => {
                    if (selectedOption) {
                      setValue("ItemName", selectedOption.value);
                    } else {
                      setValue("ItemName", "");
                    }
                  }}
                  hideDropdownIcon
                  hideClearIcon
                  isInTable
                />
              </Col>
              <Col xs={4} md={2}>
                <CustomInput
                  label="Qty."
                  name="amount"
                  register={register}
                  allowedChars="numericDecimal"
                />
              </Col>
              <Col xs={4} md={2}>
                <CustomInput
                  label="Stock Value"
                  name="amount"
                  register={register}
                  allowedChars="numericDecimal"
                />
              </Col>
             
            </Row>
            <Row>
              <Row>
                <Col xs={8} md={6}>
                  <CustomInput
                    name="remarks"
                    label="Remarks/Reasons"
                    register={register}
                    allowedChars="all"
                    disabled={false}
                  />
                </Col>
  
              <Col
                xs={15}
                md={3}
                className="d-flex align-items-end justify-content-end justify-content-md-start mt-2 mt-md-4"
              >
                <CustomButton
                  type="submit"
                  text={currentVoucherId ? "Update" : "Save"}
                  className="mb-2 w-100"
                  isSubmitting={isSubmitting}
                />
                {currentVoucherId && (
                  <CustomButton
                    text="Delete"
                    variant="danger"
                    className="mb-2 w-100 m-2"
                    onClick={() => handleDelete()}
                  />
                )}
              </Col>
              </Row>
            </Row>
          </FormNavigator>
          <CommonTable
            data={entriesList}
            columns={columns}
            onRowClick={(row) => row.voucherId && handleEdit(row)}
            showSrNo
          />
          <Row className="justify-content-end">
            <Col xs={4} md={5} className="d-flex">
              <CustomInput
                name="totalAmount"
                value={formatNumberIST(totals.totalAmount)}
                disabled={true}
                className="m-1"
                allowedChars="numericDecimal"
              />
              <CustomInput
                name="totalExpenses"
                value={formatNumberIST(totals.totalExpenses)}
                disabled={true}
                className="m-1"
                allowedChars="numericDecimal"
              />
              <CustomInput
                name="totalNetAmount"
                value={formatNumberIST(totals.totalNetAmount)}
                disabled={true}
                className="m-1"
                allowedChars="numericDecimal"
              />
            </Col>
          </Row>
        </CommonCard>
  
        <CommonModal
        show={ShowItemModal}
        onHide={() => setShowItemModal(false)}
        size="xl"
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ItemForm
            isModalOpen={ShowItemModal}
            onCloseModalAfterSave={() => {
              fetchAccounts(voucherDate);
              setShowItemModal(false);
            }}
          />
        </Suspense>
      </CommonModal>
      </>
    );
  }
  
  export default CreditSaleEntry;
  