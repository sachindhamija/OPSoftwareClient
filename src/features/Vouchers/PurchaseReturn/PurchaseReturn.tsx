import { Suspense, useEffect, useRef, useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";
import { selectCurrentFinancialYear } from "../../Masters/FinancialYear/financialYearSlice";
import {
  VoucherTypeEnum,
  getVoucherTypeString,
} from "../VoucherCommon/voucherTypeEnum";
import { FieldValues, useFieldArray, useForm } from "react-hook-form";
import {
  CustomerDetailDto,
  ItemPurchaseReturnsalePurchaseVoucherDto,
  ItemsInVoucherDto,
  OtherChargesDto,
  TransportDetailDto,
  defaultBillSummary,
  defaultCustomerDetails,
  defaultItems,
  defaultTransportDetails,
} from "./PurchaseReturnsalePurchaseVoucherDto";
import getLastVoucherDate from "../../../app/hooks/useLastVoucherDate";
import toast from "react-hot-toast";
import FormNavigator from "../../../app/components/FormNavigator";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import CommonCard from "../../../app/components/CommonCard";
import { Button, Col, Row, Table } from "react-bootstrap";
import agent from "../../../app/api/agent";
import { OptionType } from "../../../app/models/optionType";
import {
  CustomDropdown,
  CustomDateInputBox,
  CommonModal,
  CustomInput,
} from "../../../app/components/Components";
import SaleBillBookForm from "../../Masters/BillBook/SaleBillBookForm";
import {
  formatDateForBackend,
  validateDate,
} from "../../../app/utils/dateUtils";
import { AccountDtoForDropDownList } from "../../Masters/Account/accountDto";
import AccountForm from "../../Masters/Account/AccountForm";
import ItemForm from "../../Masters/Item/ItemForm";
import { fetchItemListForDropdown } from "../../../app/utils/itemUtils";
import { ItemDetailDto } from "../../Masters/Item/ItemDto";
import "./salepurchase.scss";
import TransportAndShippingDetailModal from "./ReturnPurchaseTransportAndShippingDetailModal";
import CustomerDetailModal from "./ReturnPurchaseCustomerDetailModal";
import OtherChargesModal from "./ReturnPurchaseOtherChargesModal";
import { Modal } from "react-bootstrap";

import { setLoading } from "../../../app/layout/loadingSlice";
import SerialNumberModal from "./PurchaseReturnSerialNumberModal";
import { SerialNumberDto } from "../../Masters/SerialNumberSetting/SerialNumberDto";
interface SalePurchaseFormProps {
  voucherType: VoucherTypeEnum;
  voucherId?: string;
  isInModal?: boolean;
  onSuccessfulSubmit?: () => void;
}

interface Supplier {
  value: string;
  label: string;
  barcode: string;
  itemName: string;
  itemQty: number;
  itemColor: string;
  itemSize: string;
  basePrice: number;
  totalPrice: number;
}

export function PurchaseReturn({
  voucherType,
  voucherId = undefined,
  isInModal = false,
  onSuccessfulSubmit,
}: SalePurchaseFormProps) {
  const dispatch = useAppDispatch();
  const accessId = getAccessIdOrRedirect();
  const financialYear = useAppSelector(selectCurrentFinancialYear);
  const [voucher, setVoucher] = useState<any | null>(null);
  const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);
  const [billBookList, setBillBookList] = useState<OptionType[]>([]);
  const [showBillBookModal, setShowBillBookModal] = useState(false);
  const [selectedTaxType, setSelectedTaxType] = useState<string>("");
  const [allAccounts, setAllAccounts] = useState<AccountDtoForDropDownList[]>(
    []
  );
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  // const [displayedAccounts, setDisplayedAccounts] = useState<
  //   AccountDtoForDropDownList[]
  // >([]);
  const [itemDropDownList, setItemDropDownList] = useState<OptionType[]>([]);
  // const [showInclusiveRateInput, setShowInclusiveRateInput] = useState<
  //   number | null
  // >(null);
  // const [inclusiveRate, setInclusiveRate] = useState("");
  // const [focusInclusiveRateInput, setFocusInclusiveRateInput] = useState<
  //   string | null
  // >(null);
  // const [useAltQty, setUseAltQty] = useState<boolean>(false);
  // const [useFree] = useState<boolean>(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [transportDetails, setTransportDetails] = useState<TransportDetailDto>(
    defaultTransportDetails
  );
  const updateParentStateOfTransportDetails = (data: TransportDetailDto) => {
    setTransportDetails(data);
  };

  const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
  const [showOtherChargesModal, setShowOtherChargesModal] = useState(false);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetailDto>(
    defaultCustomerDetails
  );

  const [showModal, setShowModal] = useState(false);

  const handleShowBill = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const [otherCharges, setOtherCharges] = useState<OtherChargesDto[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<SerialNumberDto[]>([]);
  const [showSerialNumberModal, setShowSerialNumberModal] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    mode: "all",
    defaultValues: {
      items: [defaultItems],
    },
  });
  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "items",
  // });
  const { fields, append } = useFieldArray({
    control,
    name: "items",
  });
  const watchedItems = watch("items");
  const items: ItemsInVoucherDto[] = watchedItems;
  const handleSaveSerialNumbers = (values: ItemsInVoucherDto[]) => {
    setValue(`items`, values);
  };
  const updateParentStateOfCustomerDetail = (data: CustomerDetailDto) => {
    setCustomerDetail(data);
  };
  const updateParentStateOfOtherCharges = (data: OtherChargesDto[]) => {
    setOtherCharges(data);
  };
  const fetchSerialNumbers = async () => {
    dispatch(setLoading(true));
    try {
      const fetchedSerialNumbers = await agent.SerialNumber.getAll(accessId);
      setSerialNumbers(fetchedSerialNumbers);
    } catch (error) {
      console.error("Error fetching serial numbers", error);
      // toast.error('Error fetching serial numbers');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const [, setItems] = useState<Supplier[]>([]);

  const handleAddItems = () => {
    setItems(dummySuppliers);
    handleClose();
  };
  
  // const handleSupplierSelect = (supplier) => {
  //   setSelectedSupplier(supplier);
  // };
  
  // const handleAddItems = () => {
  //   if (selectedSupplier) {
  //     setItems([...items, selectedSupplier]);
  //     handleClose();
  //   } else {
  //     alert("Please select a supplier to add.");
  //   }
  // };
  
  //Dummy Data (Fetch from Backend)
  const dummySuppliers: Supplier[] = [
    {
      value: "supplier1",
      label: "Darshan Sharma",
      barcode: "1234567890",
      itemName: "Biscuit",
      itemQty: 10,
      itemColor: "Brown",
      itemSize: "Medium",
      basePrice: 5,
      totalPrice: 50,
    },
    {
      value: "supplier2",
      label: "Aditya Bhai",
      barcode: "0987654321",
      itemName: "Tea",
      itemQty: 20,
      itemColor: "Golden",
      itemSize: "Small",
      basePrice: 10,
      totalPrice: 200,
    },
    {
      value: "supplier3",
      label: "Daksh Sir",
      barcode: "1122334455",
      itemName: "Sugar",
      itemQty: 30,
      itemColor: "White",
      itemSize: "Large",
      basePrice: 2,
      totalPrice: 60,
    },
  ];
  
  useEffect(() => {
    fetchSerialNumbers();
  }, [dispatch]);
  useEffect(() => {}, [serialNumbers]);
  useEffect(() => {
    if (
      otherCharges.length > 0 &&
      (otherCharges[0].grossAmount > 0 || otherCharges[0].chargesPercentage > 0)
    ) {
      calculateBillSummary();
    }
  }, [otherCharges]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  };

  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  // const [, setSelectedSupplier] = useState<Supplier | null>(
  //   null
  // );
  const [,setShowSupplierModal] = useState(false);

  useEffect(() => {
    setSupplierList(dummySuppliers);
  }, []);

  // const handleSupplierChange = (selectedOption: Supplier | null) => {
  //   if (selectedOption != null) {
  //     setSelectedSupplier(selectedOption);
  //     console.log("Selected Supplier Details:", selectedOption);
  //     setValue("supplierId", selectedOption.value);
  //   }
  // };

  const [billSummary, setBillSummary] = useState(defaultBillSummary);
  const [focusRemarks, setFocusRemarks] = useState(false);
  const [focusBillNo, setFocusBillNo] = useState(false);
  useEffect(() => {
    if (focusRemarks) {
      const remarksInput = document.getElementById("remarks");
      if (remarksInput) {
        remarksInput.focus();
        setFocusRemarks(false);
      }
    }
  }, [focusRemarks]);
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "t") {
        event.preventDefault();
        setShowTransportModal(true);
      }
    };

    // Add the event listener to the window object
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    calculateBillSummary();
  }, [watchedItems]);

  // const paymentMode = watch("paymentMode", "");
  const voucherDate = watch("voucherDate");
  const getVoucherById = async (voucherId: string) => {
    const resp = await agent.Vouchers.getVoucherById(accessId, voucherId);
    setVoucher(resp);
  };
  useEffect(() => {
    if (voucher) {
      setTransportDetails({
        transporterName: voucher?.voucherMasterExtended?.transporterName,
        vehicleNumber: voucher?.voucherMasterExtended?.vehicleNumber,
        driverName: voucher?.voucherMasterExtended?.driverName,
        grNo: voucher?.voucherMasterExtended?.grNo,
        grDate: voucher?.voucherMasterExtended?.grDate,
        brokerName: voucher?.voucherMasterExtended?.brokerName,
        deliveryAddress: voucher?.voucherMasterExtended?.deliveryAddress,
        deliveryFirmName: voucher?.voucherMasterExtended?.deliveryFirmName,
        deliveryFirmGSTNo: voucher?.voucherMasterExtended?.deliveryFirmGSTNo,
        deliveryFirmContactPersonName:
          voucher?.voucherMasterExtended?.deliveryFirmContactPersonName,
        deliveryFirmPersonMobileNumber:
          voucher?.voucherMasterExtended?.deliveryFirmPersonMobileNumber,
      });

      // Update the customerDetail state
      setCustomerDetail({
        customerName: voucher?.voucherMasterExtended?.customerName,
        customerAddress: voucher?.voucherMasterExtended?.customerAddress,
        customerContactNo: voucher?.voucherMasterExtended?.customerContactNo,
        customerGSTNo: voucher?.voucherMasterExtended?.customerGSTNo,
        customerPAN: voucher?.voucherMasterExtended?.customerPAN,
        customerAadhar: voucher?.voucherMasterExtended?.customerAadhar,
      });
      setOtherCharges(voucher.voucherOtherCharges);
      setValue("billBookId", voucher?.voucherMasterExtended?.billBookId);
      setValue("voucherDate", voucher.voucherDate);
      setValue("voucherId", voucher.voucherId);
      setValue("paymentMode", voucher?.voucherMasterExtended?.paymentMode);
      setValue("accountId", voucher.voucherDetails[0]?.accountId);
      setValue("voucherNo", voucher.voucherNumber);
      setValue("remarks", voucher.remarks);
      const itemsToAdd =
        Math.max(0, voucher.voucherItemDetails.length - fields.length) +
        (fields.length === 1 ? 1 : 0);
      for (let i = 0; i < itemsToAdd; i++) {
        append(defaultItems);
      }

      voucher.voucherItemDetails.forEach(
        (item: ItemsInVoucherDto, index: number) => {
          setValue(`items[${index}].itemId`, item.itemId);
          setValue(`items[${index}].mainQty`, item.mainQty);
          setValue(`items[${index}].altQty`, item.altQty);
          setValue(`items[${index}].free`, item.free);
          setValue(`items[${index}].rate`, item.rateWithoutGST);
          setValue(`items[${index}].pricePer`, item.pricePer);
          setValue(`items[${index}].basicAmount`, item.grossAmount);
          setValue(
            `items[${index}].discountPercentage`,
            item.discountPercentage
          );
          setValue(`items[${index}].discountAmount`, item.discountAmount);
          setValue(`items[${index}].iGST`, item.igst);
          setValue(`items[${index}].sGST`, item.sgst);
          setValue(`items[${index}].cGST`, item.cgst);
          setValue(`items[${index}].netAmount`, item.netAmount);
          setValue(
            `items[${index}].itemDetail.salePurAccountID`,
            item?.item?.salePurAccountID
          );
          setValue(
            `items[${index}].serialNumberValues`,
            item.serialNumberValues
          );
        }
      );
    }
  }, [voucher]);
  const loadBillBookOptions = async () => {
    try {
      const response = await agent.BillBook.getAllBillBooks(accessId);
      const formattedOptions = response.map((billBook: BillBookDto) => ({
        label: `${billBook.bookName} | ${billBook.taxType}`,
        value: billBook.billBookId,
      }));

      setBillBookList(formattedOptions);
    } catch (error) {
      console.error("Error fetching measurements:", error);
    }
  };

  useEffect(() => {
    loadBillBookOptions();
  }, [accessId]);

  const handleBillBookChange = async (selectedOption: OptionType | null) => {
    if (selectedOption != null) {
      const selectedBillBook = billBookList.find(
        (billBook) => billBook.value === selectedOption.value
      );
      if (selectedBillBook) {
        const taxTypePart = selectedBillBook.label.split("|")[1]?.trim();
        const taxType = taxTypePart.includes("Exclusive")
          ? "Exclusive"
          : "Inclusive";
        setSelectedTaxType(taxType);
      } else {
        setSelectedTaxType("Inclusive");
      }
      setValue("billBookId", selectedOption.value);
      const voucherNo = watch("voucherNo");
      if (voucherNo) return;
      try {
        const lastVoucherInfo =
          await agent.SalePurchase.getLastVoucherInfoBySaleBillBookId(
            accessId,
            selectedOption.value
          );
        const { LastVoucherPrefix } = lastVoucherInfo;
        let { LastVoucherNumber } = lastVoucherInfo;
        LastVoucherNumber = String(parseInt(LastVoucherNumber) || 0);
        const nextVoucherNumber = parseInt(LastVoucherNumber) + 1;
        const fullVoucherNumber = `${
          LastVoucherPrefix || ""
        }${nextVoucherNumber}`;
        setValue("voucherNo", fullVoucherNumber);
      } catch (error) {
        console.error("Error fetching last voucher info:", error);
        const fullVoucherNumber = `1`;
        setValue("voucherNo", fullVoucherNumber);
      }
    }
  };

  const fetchAccounts = async (currentVoucherDate: Date | string) => {
    if (!financialYear) return Promise.resolve();
    const financialYearFrom = financialYear.financialYearFrom;
    try {
      const accounts =
        await agent.SalePurchase.getAccountsForDropDownListSalePurchase(
          accessId,
          financialYearFrom.toString(),
          formatDateForBackend(currentVoucherDate)
        );
      setAllAccounts(accounts);
      return Promise.resolve();
    } catch (error) {
      toast.error("Failed to fetch accounts for dropdown.");
      console.error(error);
      return Promise.reject();
    }
  };
  const fetchData = async () => {
    if (
      voucherDate &&
      validateDate(voucherDate) &&
      financialYear?.financialYearFrom
    ) {
      fetchAccounts(voucherDate);
      const options = await fetchItemListForDropdown(
        accessId,
        financialYear.financialYearFrom,
        voucherDate
      );
      setItemDropDownList(options);
    }
  };
  useEffect(() => {
    fetchData().then(() => {
      if (
        accessId &&
        financialYear &&
        voucherType !== undefined &&
        voucherId == undefined
      ) {
        // this condition is to create a new voucher
        getLastVoucherDate(accessId, voucherType, financialYear)
          .then((date) => {
            setLastVoucherDate(date);
          })
          .catch((error) => {
            console.error("Error fetching last voucher date:", error);
            toast.error("Failed to fetch last voucher date.");
          });
      } else if (
        accessId &&
        financialYear &&
        voucherType !== undefined &&
        voucherId != undefined
      ) {
        getVoucherById(voucherId);
      }
    });
  }, [accessId, voucherDate, financialYear, voucherType]);

  const fetchItemDetails = async (itemId: number, index: number) => {
    setValue(`items[${index}]`, {
      mainQty: "",
      altQty: "",
      rate: "",
      basicAmount: "",
      discountPercentage: "",
      discountAmount: "",
      cGST: "",
      sGST: "",
      iGST: "",
      netAmount: "",
      free: "",
      pricePer: "",
      itemDetail: {},
      serialNumberValues: serialNumbers,
    });

    try {
      const itemDetails: ItemDetailDto = await agent.Item.getItemDetailById(
        accessId,
        itemId
      );
      setValue(`items[${index}].itemDetail`, itemDetails);
      setValue(`items[${index}].itemId`, itemDetails.itemId);
      setValue(
        `items[${index}].itemDetail.mainUnitName`,
        itemDetails.mainUnitName
      );

      const pricePerOptionsForItem = [
        { value: "main", label: itemDetails.mainUnitName || "" },
      ];

      if (voucherType == VoucherTypeEnum.ItemSale) {
        const matchingOption = pricePerOptionsForItem.find((option) =>
          option.label.includes(itemDetails.applySalesPriceOn as string)
        );
        const pricePerValue = matchingOption ? matchingOption.value : "main";
        setValue(`items[${index}].pricePer`, pricePerValue);
        setValue(`items[${index}].rate`, itemDetails.salePrice);
        setValue(
          `items[${index}].discountPercentage`,
          itemDetails.itemDiscountOnSalePercentage
        );
      } else if (voucherType == VoucherTypeEnum.ItemPurchase) {
        const matchingOption = pricePerOptionsForItem.find((option) =>
          option.label.includes(itemDetails.applyPurchasePriceOn as string)
        );
        const pricePerValue = matchingOption ? matchingOption.value : "main";
        setValue(`items[${index}].pricePer`, pricePerValue);
        setValue(`items[${index}].rate`, itemDetails.purchasePrice);
        setValue(
          `items[${index}].discountPercentage`,
          itemDetails.itemDiscountOnPurchasePercentage
        );
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      toast.error("Failed to fetch item details.");
      const fallbackPricePer =
        getValues(`items[${index}].itemDetail.mainUnitName`) || "main";
      setValue(`items[${index}].pricePer`, fallbackPricePer);
    }
  };

  const calculateBillSummary = () => {
    let totalMainQty = 0;
    let totalAltQty = 0;
    let totalBasicAmount = 0;
    let totalDiscount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalTax = 0;
    let netBillAmount = 0;

    items.forEach((item) => {
      totalMainQty += parseFloat(item.mainQty?.toString() || "0");
      totalAltQty += parseFloat(item.altQty?.toString() || "0");
      totalBasicAmount += parseFloat(item.basicAmount?.toString() || "0");
      totalDiscount += parseFloat(item.discountAmount?.toString() || "0");
      totalCGST += parseFloat(item.cGST?.toString() || "0");
      totalSGST += parseFloat(item.sGST?.toString() || "0");
      totalIGST += parseFloat(item.iGST?.toString() || "0");
      totalTax +=
        parseFloat(item.cGST?.toString() || "0") +
        parseFloat(item.sGST?.toString() || "0") +
        parseFloat(item.iGST?.toString() || "0");
      netBillAmount += parseFloat(item.netAmount?.toString() || "0");
    });
    let roundedNetBillAmount = Math.round(netBillAmount);
    const totalRoundOff = parseFloat(
      (netBillAmount - roundedNetBillAmount).toFixed(2)
    );
    const totalCharges: number = otherCharges.reduce((total, item) => {
      if (item.addedOrSubtracted === "-") {
        roundedNetBillAmount -= item.grossAmount;
      } else if (item.addedOrSubtracted === "+") {
        roundedNetBillAmount += item.grossAmount;
      }

      return item.addedOrSubtracted === "-"
        ? total - item.grossAmount
        : item.addedOrSubtracted === "+"
        ? total + item.grossAmount
        : 0;
    }, 0);

    setBillSummary({
      totalMainQty,
      totalAltQty,
      totalBasicAmount,
      totalDiscount,
      totalCGST,
      totalSGST,
      totalIGST,
      totalTax,
      totalCharges,
      totalRoundOff,
      netBillAmount: roundedNetBillAmount,
    });
  };

  const onSubmit = async (data: FieldValues) => {
    try {
      if (voucherType == undefined) {
        toast.error("Invalid Voucher Type. Data cannot be saved.");
        return;
      }
      const finalData = convertFieldValuesToDto(data);

      if (voucherType == VoucherTypeEnum.ItemSale) {
        if (voucherId || voucher) {
          // update the invoice
          await agent.SalePurchase.updateVoucher(accessId, finalData);
          toast.success("Voucher updated successfully");
        } else {
          await agent.SalePurchase.saveVoucher(accessId, finalData, "");
          toast.success("Voucher created successfully");
          reset();
          setTransportDetails(defaultTransportDetails);
          setCustomerDetail(defaultCustomerDetails);
          setBillSummary(defaultBillSummary);
        }
        if (isInModal && onSuccessfulSubmit) {
          onSuccessfulSubmit();
        }
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      handleApiErrors(error);
    }
  };

  const convertFieldValuesToDto = (
    data: FieldValues
  ): ItemPurchaseReturnsalePurchaseVoucherDto => {
    if (!data.billBookId) {
      toast.error("Please select a bill book.");
      throw new Error("Bill book is required.");
    }
    if (!data.voucherDate) {
      toast.error("Please select a voucher date.");
      throw new Error("Voucher date is required.");
    }
    if (!data.paymentMode) {
      toast.error("Please select a payment mode.");
      throw new Error("Payment mode is required.");
    }

    if (!billSummary.netBillAmount) {
      toast.error("Net invoice value cannot be null.");
      throw new Error("Net invoice value is required.");
    }
    const processedItems = processItems(data.items);
    if (processedItems.length === 0) {
      toast.error("No items in the invoice. Data cannot be saved.");
      throw new Error("No items in the invoice.");
    }

    if (!data.accountId) {
      toast.error("Please select an account.");
      throw new Error("Account selection is required.");
    }

    const selectedAccount = allAccounts.find(
      (acc) => acc.accountID === data.accountId
    );
    if (!selectedAccount) {
      toast.error("Invalid account selection. Please select a valid account.");
      throw new Error("Invalid account selection.");
    }

    const itemSalePurchaseDto: ItemPurchaseReturnsalePurchaseVoucherDto = {
      voucherId: data.voucherId,
      voucherTypeId: voucherType,
      billBookId: data.billBookId,
      voucherDate: formatDateForBackend(data.voucherDate),
      paymentMode: data.paymentMode,
      accountId: selectedAccount.accountID,
      accountName: selectedAccount.accountName,
      voucherNoPrefix: data.voucherNoPrefix,
      voucherNo: data.voucherNo,
      remarks: data.remarks,
      netInvoiceValue: billSummary.netBillAmount,
      totalSGST: billSummary.totalSGST ?? 0,
      totalCGST: billSummary.totalCGST ?? 0,
      totalIGST: billSummary.totalIGST ?? 0,
      totalRoundOff: billSummary.totalRoundOff ?? 0,
      totalCharges: billSummary.totalCharges ?? 0,
      items: processedItems,
      transportDetailDto: transportDetails,
      customerDetailDto: customerDetail,
      voucherOtherCharges: otherCharges,
    };

    return itemSalePurchaseDto;
  };

  const processItems = (items: ItemsInVoucherDto[]): ItemsInVoucherDto[] => {
    const processedItems = items.map((item, index) => {
      let rateWithoutGST = item.rate || 0;
      let rateIncludingGST = item.rate || 0;
      const taxRate = item.itemDetail?.gstSlab?.igst;
      if (selectedTaxType === "Inclusive" && taxRate) {
        rateWithoutGST = rateIncludingGST / (1 + taxRate / 100);
      } else if (selectedTaxType === "Exclusive" && taxRate) {
        rateIncludingGST = rateWithoutGST * (1 + taxRate / 100);
      }
      const newItem: ItemsInVoucherDto = {
        itemId: item.itemId,
        salePurAccountID: item.itemDetail?.salePurAccountID,
        batchId: item.batchId ? item.batchId : null,
        mainQty: item.mainQty || 0,
        altQty: item.altQty || 0,
        free: item.free || 0,
        rateWithoutGST: rateWithoutGST,
        rateIncludingGST: rateIncludingGST,
        pricePer: item.pricePer,
        basicAmount: item.basicAmount || 0,
        discountPercentage: item.discountPercentage || 0,
        discountAmount: item.discountAmount || 0,
        additionalDiscount: item.additionalDiscount || 0,
        sGST: item.sGST || 0,
        cGST: item.cGST || 0,
        iGST: item.iGST || 0,
        additionalTax1: item.additionalTax1 || 0,
        additionalTax2: item.additionalTax2 || 0,
        netAmount: item.netAmount || 0,
        serialNumberValues: item.serialNumberValues,
        value: undefined
      };

      if (
        (item.itemId === 0 || item.itemId === null) &&
        index !== items.length - 1
      ) {
        throw new Error(
          "All items must be selected. One item is missing, please recheck the invoice."
        );
      }

      return newItem;
    });

    // Remove the last row if it's empty (itemId is 0 and net value==0 or null)
    const lastItemIndex = processedItems.length - 1;
    if (
      processedItems.length > 0 &&
      (processedItems[lastItemIndex].itemId === 0 ||
        processedItems[lastItemIndex].itemId === null ||
        parseFloat(processedItems[lastItemIndex].netAmount.toString()) === 0 ||
        processedItems[lastItemIndex].netAmount === null)
    ) {
      processedItems.pop();
    }

    return processedItems;
  };
  if (voucherId && !voucher) return null;
  return (
    <>
      <CommonCard
        header={
          voucherType == undefined ? "" : getVoucherTypeString(voucherType)
        }
        size="100%"
        showControlPanelButton
      >
        <FormNavigator
          onSubmit={handleSubmit(onSubmit)}
          isModalOpen={isInModal}
        >
          <Row className="gx-2">
            <Col xs={8} md={3} className="custom-col-billBook">
              <CustomDropdown
                name="supplierId"
                label="Supplier"
                options={supplierList}
                control={control}
                onCreateButtonClick={() => {
                  setShowSupplierModal(true);
                }}
                dropDownWidth="400px"
                hideDropdownIcon
                hideClearIcon
              />
            </Col>

            <Col xs={12} md={2} className="custom-col-reduced">
              <CustomInput
                label="Bill No"
                name="voucherNo"
                register={register}
                maxLength={12}
                isTextCenter
                autoFocus={focusBillNo}
              />
            </Col>

            {/* <Col xs={12} md={2} className="custom-col-reduced">
              <CustomInput
                label="Select Bill No"
                name="voucherNo"
                register={register}
                maxLength={12}
                isTextCenter
                autoFocus={focusBillNo}
              />
            </Col> */}

            <Col xs={12} md={2} className="custom-col-reduced">
              <CustomInput
                label="POS"
                name="voucherNo"
                register={register}
                maxLength={12}
                isTextCenter
                autoFocus={focusBillNo}
              />
            </Col>

            <Col xs={12} md={2} className="custom-col-reduced">
              <CustomInput label="Address" name="voucherNo" />
            </Col>
            <Col xs={12} md={2} className="custom-col-billBook">
              <CustomDropdown
                name="billBookId"
                label="GST Type"
                options={billBookList}
                control={control}
                onCreateButtonClick={() => {
                  setShowBillBookModal(true);
                }}
                onChangeCallback={handleBillBookChange}
                badgeText={selectedTaxType}
                dropDownWidth="400px"
                hideDropdownIcon
                hideClearIcon
              />
            </Col>
            <Col xs={12} md={2} className="custom-col-reduced">
              <CustomInput
                label="Item Center"
                name="voucherNo"
                register={register}
                maxLength={12}
                isTextCenter
                autoFocus={focusBillNo}
              />
            </Col>

            <Col xs={11} sm={5} md={2} className="custom-col-date">
              <CustomDateInputBox
                label="Bill Date"
                name="voucherDate"
                register={register}
                setValue={setValue}
                error={errors.voucherDate}
                financialYear={financialYear}
                defaultDate={voucher ? voucher.voucherDate : lastVoucherDate}
              />
            </Col>
            <Col xs={12} md={2} className="custom-col-reduced">
              <CustomInput
                label="Mobile No"
                name="voucherNo"
                register={register}
                maxLength={10}
                isTextCenter
                autoFocus={focusBillNo}
              />
            </Col>
          </Row>
          <Row className="justify-content-center my-4">
            <Col xs="auto">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleShowBill}
              >
                Show Bill
              </button>
            </Col>
          </Row>

          <Modal show={showModal} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Bill Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className="gx-2">
                <Col xs={8} md={3} className="custom-col-reduced">
                  <CustomInput label="SKU" name="voucherNo" isTextCenter />
                </Col>
                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Item Name"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>
                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Unit"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>
                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Item Color"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>
                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Item Size"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>

                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Qty"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>

                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Base Price"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>

                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Dis %"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>

                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Dis. Amt"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>
                <Col xs={8} md={3} className="custom-col-billBook">
                  <CustomDropdown
                    name="billBookId"
                    label="Total"
                    options={billBookList}
                    control={control}
                    onCreateButtonClick={() => {
                      setShowBillBookModal(true);
                    }}
                    onChangeCallback={handleBillBookChange}
                    badgeText={selectedTaxType}
                    dropDownWidth="400px"
                    hideDropdownIcon
                    hideClearIcon
                  />
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleAddItems}>
                Add Items
              </Button>
            </Modal.Footer>
          </Modal>
          <div className="scrollable-table-container" ref={scrollContainerRef}>
            <Table bordered hover className="mt-2 custom-sale-table">
              <thead className="custom-sale-thead">
                <tr>
                  <th style={{ textAlign: "center" }}>Item Name</th>
                  <th style={{ textAlign: "center" }}> SKU/Barcode</th>
                  <th style={{ textAlign: "center" }}>Unit</th>
                  <th style={{ textAlign: "center" }}>Item Color</th>
                  <th style={{ textAlign: "center" }}>Item Size</th>
                  <th style={{ textAlign: "center" }}>Purchased (Qty)</th>
                  <th style={{ textAlign: "center" }}>Return (Qty)</th>
                  <th style={{ textAlign: "center" }}>Base Price</th>
                  <th style={{ textAlign: "center" }}>Our Price</th>
                  <th style={{ textAlign: "center" }}>Discount(%)</th>
                  <th style={{ textAlign: "center" }}>Discount Amt</th>
                  <th style={{ textAlign: "center" }}>Total</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td>
                      <CustomDropdown
                        name={`items[${index}].itemId`}
                        options={itemDropDownList}
                        control={control}
                        isCreatable
                        onCreateButtonClick={() => {
                          setShowItemModal(true);
                        }}
                        dropDownWidth="400px"
                        onChangeCallback={(
                          selectedOption: OptionType | null
                        ) => {
                          if (selectedOption) {
                            setTimeout(
                              () =>
                                fetchItemDetails(selectedOption.value, index),
                              0
                            );
                          }
                        }}
                        hideDropdownIcon
                        hideClearIcon
                        isInTable
                        onFocus={
                          index === fields.length - 1
                            ? scrollToBottom
                            : undefined
                        }
                      />
                    </td>
                    <td>
                      <CustomInput name={`items[${index}].itemId`} />
                    </td>
                    <td>
                      <CustomDropdown
                        name={`items[${index}].itemId`}
                        options={itemDropDownList}
                        control={control}
                        isCreatable
                        onCreateButtonClick={() => {
                          setShowItemModal(true);
                        }}
                        dropDownWidth="800px"
                        onChangeCallback={(
                          selectedOption: OptionType | null
                        ) => {
                          if (selectedOption) {
                            setTimeout(
                              () =>
                                fetchItemDetails(selectedOption.value, index),
                              0
                            );
                          }
                        }}
                        hideDropdownIcon
                        hideClearIcon
                        isInTable
                        onFocus={
                          index === fields.length - 1
                            ? scrollToBottom
                            : undefined
                        }
                      />
                    </td>
                    <td>
                      <CustomDropdown
                        name={`items[${index}].itemId`}
                        options={itemDropDownList}
                        control={control}
                        isCreatable
                        onCreateButtonClick={() => {
                          setShowItemModal(true);
                        }}
                        dropDownWidth="800px"
                        onChangeCallback={(
                          selectedOption: OptionType | null
                        ) => {
                          if (selectedOption) {
                            setTimeout(
                              () =>
                                fetchItemDetails(selectedOption.value, index),
                              0
                            );
                          }
                        }}
                        hideDropdownIcon
                        hideClearIcon
                        isInTable
                        onFocus={
                          index === fields.length - 1
                            ? scrollToBottom
                            : undefined
                        }
                      />
                    </td>
                    <td>
                      <CustomDropdown
                        name={`items[${index}].itemId`}
                        options={itemDropDownList}
                        control={control}
                        isCreatable
                        onCreateButtonClick={() => {
                          setShowItemModal(true);
                        }}
                        dropDownWidth="800px"
                        onChangeCallback={(
                          selectedOption: OptionType | null
                        ) => {
                          if (selectedOption) {
                            setTimeout(
                              () =>
                                fetchItemDetails(selectedOption.value, index),
                              0
                            );
                          }
                        }}
                        hideDropdownIcon
                        hideClearIcon
                        isInTable
                        onFocus={
                          index === fields.length - 1
                            ? scrollToBottom
                            : undefined
                        }
                      />
                    </td>
                    <td>
                      <CustomInput name={`items[${index}].itemId`} />
                    </td>
                    <td>
                      <CustomInput name={`items[${index}].itemId`} />
                    </td>
                    <td>
                      <CustomInput name={`items[${index}].itemId`} />
                    </td>
                    <td>
                      <CustomInput name={`items[${index}].itemId`} />
                    </td>
                    <td>
                      <CustomInput name={`items[${index}].itemId`} />
                    </td>
                    <td>
                      <CustomInput name={`items[${index}].itemId`} />
                    </td>
                    <td>
                      <CustomInput name={`items[${index}].itemId`} />
                    </td>
                    <td>
                      <button type="button" className="btn btn-danger">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="form-footer">
            <div className="remarks-and-actions">
              <Row>
                <Col sm={12}>
                  <CustomInput
                    label="Remarks"
                    name="remarks"
                    register={register}
                    autoFocus={focusRemarks}
                  />
                </Col>
              </Row>
            </div>

            <div className="bill-summary">
              <Table>
                <tbody>
                  <tr>
                    <td>Total Exclude Tax</td>
                    <td className="text-end">{billSummary.totalMainQty}</td>
                  </tr>
                  <tr>
                    <td>Total GST</td>
                    <td className="text-end">
                      {billSummary.totalAltQty.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>Grand Total</td>
                    <td className="text-end">
                      {billSummary.totalBasicAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </FormNavigator>
      </CommonCard>
      <CommonModal
        show={showBillBookModal}
        onHide={() => {
          setShowBillBookModal(false);
        }}
        size="xl"
      >
        <Suspense fallback={<div>Loading...</div>}>
          <SaleBillBookForm
            onSaveSuccess={() => {
              loadBillBookOptions();
              setShowBillBookModal(false);
            }}
            isModalOpen={showBillBookModal}
          />
        </Suspense>
      </CommonModal>
      <CommonModal
        show={showAccountModal}
        onHide={() => {
          setShowAccountModal(false);
        }}
        size="xl"
      >
        <Suspense fallback={<div>Loading...</div>}>
          <AccountForm
            isModalOpen={showAccountModal}
            onCloseModalAfterSave={() => {
              fetchAccounts(voucherDate);
              setShowAccountModal(false);
            }}
          />
        </Suspense>
      </CommonModal>

      <CommonModal
        show={showItemModal}
        onHide={() => {
          setShowItemModal(false);
        }}
        size="xl"
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ItemForm
            isModalOpen={showItemModal}
            onCloseModalAfterSave={async () => {
              if (financialYear?.financialYearFrom) {
                const options = await fetchItemListForDropdown(
                  accessId,
                  financialYear?.financialYearFrom,
                  voucherDate
                );
                setItemDropDownList(options);
              }
              setShowItemModal(false);
            }}
          />
        </Suspense>
      </CommonModal>

      {showTransportModal && (
        <TransportAndShippingDetailModal
          show={showTransportModal}
          onHide={() => {
            setShowTransportModal(false);
            setTimeout(() => {
              setFocusRemarks(true);
            }, 10);
          }}
          onSave={updateParentStateOfTransportDetails}
          initialData={transportDetails}
        />
      )}
      {showCustomerDetailModal && (
        <CustomerDetailModal
          show={showCustomerDetailModal}
          onHide={() => {
            setShowCustomerDetailModal(false);
            setTimeout(() => {
              setFocusBillNo(true);
            }, 10);
          }}
          onSave={updateParentStateOfCustomerDetail}
          initialData={customerDetail}
        />
      )}
      {showOtherChargesModal && (
        <OtherChargesModal
          show={showOtherChargesModal}
          summaryAmount={billSummary.netBillAmount}
          voucherDate={voucherDate}
          onHide={() => {
            setShowOtherChargesModal(false);

            setTimeout(() => {
              setFocusRemarks(true);
            }, 10);
          }}
          onSave={updateParentStateOfOtherCharges}
          initialData={otherCharges}
        />
      )}
      {showSerialNumberModal && (
        <SerialNumberModal
          show={showSerialNumberModal}
          onHide={() => setShowSerialNumberModal(false)}
          onSave={handleSaveSerialNumbers}
          currentItemID={null}
          items={items}
        />
      )}
    </>
  );
}
