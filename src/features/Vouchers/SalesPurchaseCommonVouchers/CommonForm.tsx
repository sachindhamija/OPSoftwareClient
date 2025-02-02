import { Suspense, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/configureStore";
import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";
import { selectCurrentFinancialYear } from "../../Masters/FinancialYear/financialYearSlice";
import { VoucherTypeEnum, getVoucherTypeString } from "../VoucherCommon/voucherTypeEnum";
import { FieldValues, useFieldArray, useForm } from "react-hook-form";
import { CustomerDetailDto, ItemSalePurchaseVoucherDto, ItemsInVoucherDto, OtherChargesDto, TransportDetailDto, defaultBillSummary, defaultCustomerDetails, defaultItems, defaultTransportDetails } from "./SalesPurchaseCommonVoucherDto";
import getLastVoucherDate from "../../../app/hooks/useLastVoucherDate";
import toast from "react-hot-toast";
import FormNavigator from "../../../app/components/FormNavigator";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import CommonCard from "../../../app/components/CommonCard";
import { Button, Col, Row, Table } from "react-bootstrap";
import agent from "../../../app/api/agent";
import { OptionType } from "../../../app/models/optionType";
import { CustomDropdown, CustomDateInputBox, CommonModal, CustomInput, CustomButton } from "../../../app/components/Components";
import SaleBillBookForm from "../../Masters/BillBook/SaleBillBookForm";
import { formatDateForBackend, validateDate } from "../../../app/utils/dateUtils";
import { AccountDtoForDropDownList } from "../../Masters/Account/accountDto";
import { transformAccountToOption } from "../../../app/utils/accountUtils";
import AccountForm from "../../Masters/Account/AccountForm";
import ItemForm from "../../Masters/Item/ItemForm";
import { ItemDetailDto } from "../../Masters/Item/ItemDto";
import './Common.scss'
import { formatNumberIST } from "../../../app/utils/numberUtils";
import TransportAndShippingDetailModal from "./TransportAndShippingDetailModal";
import CustomerDetailModal from "./CustomerDetailModal";
import OtherChargesModal from "./OtherChargesModal";
// import { MdOutlineInsertChartOutlined } from "react-icons/md";
import { setLoading } from '../../../app/layout/loadingSlice';
import SerialNumberModal from "./SerialNumberModal";
import { SerialNumberDto } from "../../Masters/SerialNumberSetting/SerialNumberDto";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ControlOptionDto } from "../VoucherCommon/controlOptionDto";
import ControlPanelForm from "../VoucherCommon/ControlPanelForm";
import EmailForm from "./EmailForm";
import { fetchItemListForDropdown } from "../../../app/utils/itemUtils";

const PAYMENT_MODE_OPTIONS = [
    { label: "Cash", value: "CASH" },
    { label: "Credit", value: "CREDIT" },
    { label: "Bank | UPI", value: "BANK" },
];
interface SalePurchaseFormProps {
    voucherType: VoucherTypeEnum;
    voucherId?: string;
    isInModal?: boolean;
    ledgerVoucherDate?: any;
    onSuccessfulSubmit?: () => void;
}

export function SalePurchaseForm({ voucherType, voucherId = undefined, isInModal = false,ledgerVoucherDate, onSuccessfulSubmit }: SalePurchaseFormProps) {
    const dispatch = useAppDispatch();
    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const [voucher, setVoucher] = useState<any | null>(null);
    const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);
    const [billBookList, setBillBookList] = useState<OptionType[]>([]);
    const [showBillBookModal, setShowBillBookModal] = useState(false);
    const [selectedTaxType, setSelectedTaxType] = useState<string>('');
    const [allAccounts, setAllAccounts] = useState<AccountDtoForDropDownList[]>([]);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [displayedAccounts, setDisplayedAccounts] = useState<AccountDtoForDropDownList[]>([]);
    const [itemDropDownList, setItemDropDownList] = useState<OptionType[]>([]);
    const [showInclusiveRateInput, setShowInclusiveRateInput] = useState<number | null>(null);
    const [inclusiveRate, setInclusiveRate] = useState("");
    const [focusInclusiveRateInput, setFocusInclusiveRateInput] = useState<string | null>(null);
    const [useAltQty, setUseAltQty] = useState<boolean>(false);
    const [useFree] = useState<boolean>(false);
    const [showTransportModal, setShowTransportModal] = useState(false);
    const [transportDetails, setTransportDetails] = useState<TransportDetailDto>(defaultTransportDetails);
    const updateParentStateOfTransportDetails = (data: TransportDetailDto) => {
        setTransportDetails(data);
    };
    
    const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
    const [showOtherChargesModal, setShowOtherChargesModal] = useState(false);
    const [customerDetail, setCustomerDetail] = useState<CustomerDetailDto>(defaultCustomerDetails);

    const [otherCharges, setOtherCharges] = useState<OtherChargesDto[]>([]);
    const [serialNumbers, setSerialNumbers] = useState<SerialNumberDto[]>([]);
    const [showSerialNumberModal, setShowSerialNumberModal] = useState(false);
    const { register, handleSubmit, setValue, getValues, watch, control, reset, formState: { errors } } = useForm<FieldValues>({
        mode: "all",
        defaultValues: {
            billBookId: null,
            voucherDate: null, 
            paymentMode: null,
            items: [defaultItems]
        }
    });
    const [invoiceHtml, setInvoiceHtml] = useState<any>(null);
    const [showControlPanelModal, setShowControlPanelModal] = useState(false);
	const [invoiceAfterSave, setInvoiceAfterSave] = useState(true);
	const [originalCopyInvoice, setOriginalCopyInvoice] = useState(true);
	const [officeCopyInvoice, setOfficeCopyInvoice] = useState(true);
	const [customerCopyInvoice, setCustomerCopyInvoice] = useState(true);
	const [duplicateCopyInvoice, setDuplicateCopyInvoice] = useState(true);
	const [isSundayAllowed, setIsSundayAllowed] = useState(false);
	const [hideBank, setHideBank] = useState(false);
	const [isCashDefault, setIsCashDefault] = useState(false);
	const [isCreditDefault, setIsCreditDefault] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isMainQty, setIsMainQty] = useState(true);
    const [isRateSale, setIsRateSale] = useState(true);
    const [isDiscount, setIsDiscount] = useState(true);
    const [isDiscountPercentage, setIsDiscountPercentage] = useState(true);
    const [isBillNumberExists, setIsBillNumberExists] = useState(false);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });
    

    useEffect(() => {
		fetchControlOptions();
	}, [accessId]);

    const watchedItems = watch('items');    
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
            console.error('Error fetching serial numbers', error);
            // toast.error('Error fetching serial numbers');
        } finally {
            dispatch(setLoading(false));
        }
    };
    
    useEffect(() => {
        fetchSerialNumbers();
    }, [dispatch]);
    useEffect(()=>{
       
    },[serialNumbers])
    useEffect(() => {
        if (otherCharges.length > 0 && (otherCharges[0].grossAmount > 0 || otherCharges[0].chargesPercentage > 0)) {
            calculateBillSummary();
        }
    }, [otherCharges]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    const [billSummary, setBillSummary] = useState(defaultBillSummary);
    const [focusRemarks, setFocusRemarks] = useState(false);
    const [focusBillNo, setFocusBillNo] = useState(false);
    useEffect(() => {
        if (focusRemarks) {
            const remarksInput = document.getElementById('remarks'); // Get the element
            if (remarksInput) {  // Check if the element is not null
                remarksInput.focus(); // Safely call focus
                setFocusRemarks(false);  // Reset focus state to prevent re-focusing on subsequent renders
            }
        }
    }, [focusRemarks]);
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            // if ((event.ctrlKey) && event.key === 't') {
            //     event.preventDefault();
            //     setShowTransportModal(true);
            // }
            if ((isMac && event.metaKey && event.key === 'p') ||
                (!isMac && event.ctrlKey && event.key === 'p')) {
                 console.log("Print shortcut pressed");
                event.preventDefault(); 
                setShowPrintModal(true);
            }
            if ((isMac && event.metaKey && event.key === 't') ||
            (!isMac && event.ctrlKey && event.key === 't')) {
             console.log("transport shortcut pressed");
            event.preventDefault(); 
            setShowTransportModal(true);
        }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const [pricePerOptions, setPricePerOptions] = useState<{ [key: number]: OptionType[] }>({});
    const [askForCustomerDetailWhenCash] = useState<boolean>(true);

    const [partyGST, setPartyGST] = useState('');
    const [isAccountOutOfState, setIsAccountOutOfState] = useState<boolean>(false);
    

    

    const handleDeleteRow = (index: number) => {
        if (window.confirm("Are you sure you want to delete this row?")) {
            remove(index);
            if (fields.length === 1) {
                append(defaultItems); // Append a new row only if there are no other rows left
            }
        }
    };
    const deleteVoucher = () => {
        if (window.confirm("Are you sure you want to delete this row?")) {
            agent.SalePurchase.deleteVoucher(accessId, (voucherId ?? '')).then(() => {
                if (onSuccessfulSubmit)
                    onSuccessfulSubmit();
                toast.success('Voucher deleted successfully');
            })
        }
    }
    useEffect(() => {
        calculateBillSummary();
    }, [watchedItems]);

    const paymentMode = watch('paymentMode', '');
    var voucherDate = "";
    if(!ledgerVoucherDate){
        voucherDate = watch("voucherDate");
    }else{
        voucherDate = ledgerVoucherDate;
    }
    const getVoucherById = async (voucherId: string) => {
        const resp = await agent.Vouchers.getVoucherById(accessId, voucherId);
        setVoucher(resp)
    }
    useEffect(() => {

        if (voucher) {
            setTransportDetails({
                transporterName: voucher?.voucherMasterExtended?.transporterName,
                transporterId: voucher?.voucherMasterExtended?.transporterId,
                vehicleNumber: voucher?.voucherMasterExtended?.vehicleNumber,
                vehicleId: voucher?.voucherMasterExtended?.vehicleId,
                driverName: voucher?.voucherMasterExtended?.driverName,
                grNo: voucher?.voucherMasterExtended?.grNo,
                grDate: voucher?.voucherMasterExtended?.grDate,
                brokerName: voucher?.voucherMasterExtended?.brokerName,
                deliveryAddress: voucher?.voucherMasterExtended?.deliveryAddress,
                deliveryFirmName: voucher?.voucherMasterExtended?.deliveryFirmName,
                deliveryFirmGSTNo: voucher?.voucherMasterExtended?.deliveryFirmGSTNo,
                deliveryFirmContactPersonName: voucher?.voucherMasterExtended?.deliveryFirmContactPersonName,
                deliveryFirmPersonMobileNumber: voucher?.voucherMasterExtended?.deliveryFirmPersonMobileNumber,

                eInvoiceNumber: voucher?.voucherMasterExtended?.eInvoiceNumber,
                eInvoiceDate: voucher?.voucherMasterExtended?.eInvoiceDate,
                eWayBillNo: voucher?.voucherMasterExtended?.eWayBillNo,
                eWayBillDate: voucher?.voucherMasterExtended?.eWayBillDate,
                firmName: voucher?.voucherMasterExtended?.firmName,
                gstNo: voucher?.voucherMasterExtended?.gstNo,
                contactPersonName: voucher?.voucherMasterExtended?.contactPersonName,
                contactPersonMobileNo: voucher?.voucherMasterExtended?.contactPersonMobileNo,
                placeOfSupply: voucher?.voucherMasterExtended?.placeOfSupply,
                mode: voucher?.voucherMasterExtended?.mode,
                vehicleType: voucher?.voucherMasterExtended?.vehicleType,
                chargesPaidOrToPaid: voucher?.voucherMasterExtended?.chargesPaidOrToPaid,

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
            setOtherCharges(voucher.voucherOtherCharges)
            setValue('billBookId', voucher?.voucherMasterExtended?.billBookId);
            setValue('voucherDate', voucher.voucherDate);
            setValue('voucherId', voucher.voucherId);
            setValue('paymentMode', voucher?.voucherMasterExtended?.paymentMode);
            setValue('accountId', voucher.voucherDetails[0]?.accountId);
            setValue('voucherNo', voucher.voucherNumber);
            setValue('remarks', voucher.remarks);
            const itemsToAdd = Math.max(0, voucher.voucherItemDetails.length - fields.length) + (fields.length === 1 ? 1 : 0);
            for (let i = 0; i < itemsToAdd; i++) {
                append(defaultItems);
            }
            
            voucher.voucherItemDetails.forEach((item: ItemsInVoucherDto, index: number) => {
                setValue(`items[${index}].itemId`, item.itemId);
                setValue(`items[${index}].mainQty`, item.mainQty);
                setValue(`items[${index}].altQty`, item.altQty);
                setValue(`items[${index}].free`, item.free);
                setValue(`items[${index}].rate`, item.rateWithoutGST);
                setValue(`items[${index}].pricePer`, item.pricePer);
                setValue(`items[${index}].basicAmount`, item.grossAmount);
                setValue(`items[${index}].discountPercentage`, item.discountPercentage);
                setValue(`items[${index}].discountAmount`, item.discountAmount);
                setValue(`items[${index}].iGST`, item.igst);
                setValue(`items[${index}].sGST`, item.sgst);
                setValue(`items[${index}].cGST`, item.cgst);
                setValue(`items[${index}].netAmount`, item.netAmount);
                setValue(`items[${index}].itemDetail.salePurAccountID`, item?.item?.salePurAccountID);
                setValue(`items[${index}].serialNumberValues`,item.serialNumberValues);
            });
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
            const selectedBillBook = billBookList.find(billBook => billBook.value === selectedOption.value);
            if (selectedBillBook) {
                const taxTypePart = selectedBillBook.label.split('|')[1]?.trim();
                const taxType = taxTypePart.includes("Exclusive") ? "Exclusive" : "Inclusive";
                setSelectedTaxType(taxType);
            } else {
                setSelectedTaxType("Inclusive");
            }
            setValue("billBookId", selectedOption.value);
            //const voucherNo = watch("voucherNo");
            //if (voucherNo) return;
            try {
                const lastVoucherInfo = await agent.SalePurchase.getLastVoucherInfoBySaleBillBookId(accessId, selectedOption.value);
                //const { LastVoucherPrefix } = lastVoucherInfo.lastVoucherPrefix || 0 ;
                //let { LastVoucherNumber } = lastVoucherInfo.lastVoucherNumber;
                //LastVoucherNumber = String(parseInt(lastVoucherInfo.lastVoucherNumberr) || 0);
                const nextVoucherNumber = parseInt(lastVoucherInfo.lastVoucherNumber || '0') + 1;
                const fullVoucherNumber = `${lastVoucherInfo.lastVoucherPrefix || ''}${nextVoucherNumber}`;
                setValue("voucherNo", fullVoucherNumber);
            } catch (error) {
                console.error("Error fetching last voucher info:", error);
                const fullVoucherNumber = `1`;
                setValue("voucherNo", fullVoucherNumber);
            }

            if (isCashDefault) {
                setValue("paymentMode", "CASH");
            } else if (isCreditDefault) {
                setValue("paymentMode", "CREDIT");
            }
            
        }
    };
    const handleAccountChange = async (selectedOption: OptionType | null) => {
        if (selectedOption != null) {
            const selectedAccount = allAccounts.find(account => account.accountID === selectedOption.value);
            if (selectedAccount) {
                const isOutsideState = selectedAccount.partyType.includes('Out of State');
                setIsAccountOutOfState(isOutsideState);
                const partyTypeWithGST = `${selectedAccount.gstNo || ''} ${selectedAccount.partyType}`;
                setPartyGST(partyTypeWithGST || '');
            }
            setValue("accountId", selectedOption.value);
        }
    };

    const fetchAccounts = async (currentVoucherDate: Date | string) => {
        if (!financialYear) return Promise.resolve();
        const financialYearFrom = financialYear.financialYearFrom;
        try {
            const accounts = await agent.SalePurchase.getAccountsForDropDownListSalePurchase(
                accessId,
                financialYearFrom.toString(),
                formatDateForBackend(currentVoucherDate),
            );
            setAllAccounts(accounts);
            return Promise.resolve();
        } catch (error) {
            toast.error('Failed to fetch accounts for dropdown.');
            console.error(error);
            return Promise.reject();
        }
    };
    const fetchData = async () => {
        if (voucherDate && validateDate(voucherDate) && financialYear?.financialYearFrom) {
            fetchAccounts(voucherDate);
            const options = await fetchItemListForDropdown(accessId, financialYear.financialYearFrom, voucherDate);
            setItemDropDownList(options);
        }
    };
    useEffect(() => {
        
        fetchData().then(() => {

            if (accessId && financialYear && voucherType !== undefined && voucherId == undefined) { // this condition is to create a new voucher
                getLastVoucherDate(accessId, voucherType, financialYear)
                    .then(date => {
                        setLastVoucherDate(date);
                    })
                    .catch(error => {
                        console.error('Error fetching last voucher date:', error);
                        toast.error('Failed to fetch last voucher date.');
                    });

            }
            else if (accessId && financialYear && voucherType !== undefined && voucherId != undefined) {
                getVoucherById(voucherId)
            }
        });

    }, [accessId, voucherDate, financialYear, voucherType, selectedTaxType]);

    sessionStorage.setItem(
        'voucherId',JSON.stringify(voucherId)
    );

	const fetchControlOptions = async () => {
		try {
			if (voucherType != undefined) {
				const options: ControlOptionDto[] =
					await agent.ControlOptions.list(accessId, voucherType);
				options.forEach((option) => {
					switch (option.controlOption) {
						case 'Do you want to print invoice after Save?':
							setInvoiceAfterSave(option.controlValue === 'Y');
							break;
						case 'Do you want to print Original Copy of Invoice?':
							setOriginalCopyInvoice(option.controlValue === 'Y');
							break;
						case 'Do you want to print Office Copy of Invoice?':
							setOfficeCopyInvoice(option.controlValue === 'Y');
							break;
						case 'Do you want to print Customer Copy of Invoice?':
							setCustomerCopyInvoice(option.controlValue === 'Y');
							break;
						case 'Do you want to print Duplicate Copy of Invoice?':
							setDuplicateCopyInvoice(option.controlValue === 'Y');
							break;
                        case 'Allow Entries on Sunday for Sales':
                            setIsSundayAllowed(option.controlValue === 'Y');
                            break;
                        case 'Hide Bank form payment mode':
                            setHideBank(option.controlValue === 'Y');
                            break;
                        case 'Set Cash Default for payment mode':
                            setIsCashDefault(option.controlValue === 'Y');
                            break;
                        case 'Set Credit Default for payment mode':
                            setIsCreditDefault(option.controlValue === 'Y');
                            break;
 						case 'Use Main Quantity in Sales':
							setIsMainQty(option.controlValue === 'Y');
							break;
						case 'Use Main Quantity in Sales':
							setIsMainQty(option.controlValue === 'Y');
							break;
						case 'Apply Rate in Sales':
							setIsRateSale(option.controlValue === 'Y');
							break;
						case 'Apply Discount in Sales':
							setIsDiscount(option.controlValue === 'Y');
							break;
						case 'Apply Discount Percentage in Sales':
							setIsDiscountPercentage(option.controlValue === 'Y');
							break;
						default:
							break;
					}
				});
			}
		} catch (error) {
			toast.error('Failed to load control options.');
		}
	};

    useEffect(() => {
        invoiceHtmlData(false);
    }, [voucherId, invoiceHtml]);

    const invoiceHtmlData = async (isNewSave: Boolean) =>{
        const fetchVoucher = async () => {
          try {
            const voucherdata = await agent.SalePurchase.getVoucherById(accessId, voucherId ?? "");
            const customerName = voucherdata.customerDetailDto?.customerName || "";
            const customerAddress = voucherdata.customerDetailDto?.customerAddress || "";
            const customerGSTNo = voucherdata.customerDetailDto?.customerGSTNo || "";
            const customerPAN = voucherdata.customerDetailDto?.customerPAN || "";
            //const customerAadhar = voucherdata.customerDetailDto?.customerAadhar || "";
            
            const transportDetailsInvoice = voucherdata.transportDetailDto || {};
            
            const formattedVoucherDate = new Date(voucherdata.voucherDate).toLocaleDateString();
            
            const totalAmountBeforeTax = voucherdata.items?.reduce((sum: number, item: any) => sum + item.basicAmount, 0) || 0;
            const totalGST = voucherdata.items?.reduce((sum: number, item: any) => sum + item.sgst + item.cgst + item.igst, 0) || 0;
            const totalAmount = totalAmountBeforeTax + totalGST;

            const companyInfo = await agent.Company.getCompanyDetail(accessId);
            setInvoiceHtml(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
        
                body {
                font-family: "Arial", sans-serif;
                background-color: #f4f6f9;
                margin: 0;
                padding: 0;
                }
                .invoice-container {
                padding: 20px;
                border: 2px solid black;
                }
                .main-container {
                max-width: 794px;
                margin: auto;
                background: white;
                padding: 30px;
                }
                .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                align-items: start;
                }
                .header .left,
                .header .right {
                width: 48%;
                }
                .header .center {
                width: 48%;
                text-align: center;
                }
                .header .center h1 {
                font-size: 30px;
                color: #333;
                margin: 0;
                font-weight: bold;
                }
                .header .center p {
                font-size: 16px;
                color: #555;
                margin: 5px 0;
                }
                .header .left {
                font-size: 14px;
                text-align: left;
                }
                .header .right {
                font-size: 14px;
                text-align: right;
                }
                .party-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                font-size: 14px;
                border: 1px solid black;
                }
                .party-details .left-column,
                .party-details .right-column {
                width: 48%;
                padding: 15px;
                }
                .right-column {
                padding-left: 25px;
                display: flex;
                border-left: #333 solid 1px;
                justify-content: space-between;
                }
                .right-column .box {
                width: 48%;
                padding: 15px;
                }
                table {
                    width: 100%; /* Ensure the table fits within the container */
                    table-layout: fixed; /* Fixed column widths to prevent overflow */
                    margin: 20px 0;
                }

                table, th, td {
                    border: 1px solid #ddd; /* Uniform border for table elements */
                }

                th, td {
                    padding: 10px; /* Slightly smaller padding for better fit */
                    text-align: left; /* Left-align text for readability */
                    word-wrap: break-word; /* Ensure long text wraps within the cell */
                    overflow-wrap: break-word; /* Additional wrap support for browsers */
                }

                th {
                    background-color: #f5f5f5; /* Light background for headers */
                    font-weight: bold;
                    color: #333;
                    text-align: center; /* Center header text */
                }

                td {
                    color: #555; /* Softer text color for better contrast */
                    text-align: center; /* Center-align table content */
                }
                .strong {
                margin-bottom: 10px;
                }
                td {
                color: #555;
                }
                .totals td {
                font-size: 16px;
                font-weight: bold;
                padding-top: 10px;
                }
                .summary-section {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
                }
                .summary-section .left,
                .summary-section .right {
                width: 48%;
                }
                .summary-section table {
                width: 100%;
                margin-top: 10px;
                }
                .summary-section td {
                padding: 8px;
                text-align: left;
                }
                .bill-amount {
                margin-top: 30px;
                font-size: 22px;
                font-weight: bold;
                text-align: right;
                color: #333;
                }
                .terms-conditions {
                font-size: 14px;
                line-height: 1.6;
                }
                .terms-conditions h3 {
                font-size: 16px;
                color: #333;
                margin-bottom: 10px;
                }
                .terms-conditions ul {
                list-style-type: none;
                padding-left: 0;
                }
                .terms-conditions li {
                margin-bottom: 8px;
                color: #555;
                }
        
                .termsANDsignatory {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #ddd;
                }
        
                .terms-conditions {
                width: 48%;
                }
        
                .signatory {
                width: 48%;
                text-align: right;
                font-size: 14px;
                font-weight: bold;
                color: #333;
                }
        
                .TaxInvoiceContainer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                }
        
                .TaxInvoice {
                text-align: center;
                font-size: 24px;
                margin-left: 80px;
                font-weight: bold;
                flex: 1;
                color: #333;
                }
        
                .original-copy {
                text-align: right;
                    font-weight: bold;
                color: #333;
                }
            </style>
                </head>
                <body>
                <div class="main-container">
                    <div class="TaxInvoiceContainer">
                    <p class="TaxInvoice">Tax Invoice</p>
                    <p class="original-copy">{COPYTYPE}</p>
                    </div>
        
                    <div class="invoice-container">
                    <div class="header">
                        <div class="left">
                        <strong>GSTIN No:${companyInfo?.gstNo}</strong><br />
                        <strong>PAN No:${companyInfo?.panNo}</strong>
                        </div>
                        <div class="center">
                        <h1>${companyInfo?.companyName}</h1>
                        <p>${companyInfo?.address1},${companyInfo?.city},${companyInfo?.district}</p>
                        </div>
                        <div class="right">
                        <strong>Tel: ${companyInfo?.mobileNo}, ${companyInfo?.mobileNo2}</strong><br />
                        <strong>${companyInfo?.email}</strong>
                        </div>
                    </div>
        
                    <div class="party-details">
                        <div class="left-column">
                        <div class="strong">
                            <strong>Party Name:</strong> ${customerName || "N/A"}<br />
                        </div>
                        <div class="strong">
                            <strong>Address:</strong> ${customerAddress || "N/A"}<br />
                        </div>
                        <div class="strong">
                            <strong>GSTIN:${customerGSTNo || "N/A"}</strong><br />
                        </div>
                        <strong>Phone:</strong><br />
                        <div class="strong">
                            <strong>GST NO:</strong> ${customerPAN || "N/A"}<br />
                        </div>
                        <div class="strong">
                            <strong>Delivery At:</strong> ${transportDetailsInvoice.deliveryAddress || "N/A"}<br />
                        </div>
                        </div>
                        <div class="right-column">
                        <div class="box">
                            <div class="strong"><strong>INVOICE NO:</strong> ${voucherdata.voucherNo}<br /></div>
                            <div class="strong"><strong>GR No.:</strong> ${transportDetailsInvoice.grNo || "N/A"}<br /></div>
                            <div class="strong"><strong>GR Date:</strong> ${transportDetailsInvoice.grDate || "N/A"}<br /></div>
                            <div class="strong">
                            <strong>Vehicle No.:</strong> ${transportDetailsInvoice.vehicleNumber || "N/A"}<br />
                            </div>
                            <div class="strong"><strong>Transport:</strong> ${transportDetailsInvoice.transporterName || "N/A"}<br /></div>
                        </div>
                        <div class="box">
                            <div class="strong"><strong>Date:</strong> ${formattedVoucherDate}<br /></div>
                            <div class="strong"><strong>EWay No.:</strong> ${transportDetailsInvoice.ewayBillNo || "N/A"}<br /></div>
                            <div class="strong"><strong>EWay Date:</strong> ${transportDetailsInvoice.ewayDate || "N/A"}<br /></div>
                            <div class="strong"><strong>State:</strong> ${transportDetailsInvoice.state || "N/A"}<br /></div>
                        </div>
                        </div>
                    </div>
                    <table style="zoom:75%">
                        <thead>
                        <tr>
                            <th>S.N</th>
                            <th>Item Description</th>
                            <th>HSN</th>
                            <th>QTY</th>
                            <th>UOM</th>
                            <th>Rate</th>
                            <th>Discount (%) & Amt</th>
                            <th>Taxable Amt</th>
                            <th>Tax</th>
                            <th>IGST</th>
                            <th>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${voucherdata.items?.map((item: any, index: number) => {
                            return `
                            <tr key="${item.itemId}">
                                <td>${index + 1}</td>  
                                <td>${item.itemDescription || "N/A"}</td>
                                <td>${item.hsnCode || "N/A"}</td>
                                <td>${item.mainQty || 0}</td> 
                                <td>${item.uom || "N/A"}</td>
                                <td>${item.pricePer || 0}</td> 
                                <td>${item.discountPercentage || 0}% / ${item.discountAmount || 0}</td> 
                                <td>${item.basicAmount || 0}</td> 
                                <td>${item.sgst || 0}</td>
                                <td>${item.igst || 0}</td> 
                                <td>${item.netAmount || 0}</td> 
                            </tr>
                            `;
                        }).join("")}
                            <tr>
                            <td colspan="7" style="text-align: right; font-weight: bold">
                                Total:
                            </td>
                            <td>${voucherdata.items.reduce((sum: number, item: any) => sum + (item.basicAmount || 0), 0)?.toFixed(2)}</td>
                            <td>${voucherdata.items.reduce((sum: number, item: any) => sum + (item.sgst || 0), 0)?.toFixed(2)}</td>
                            <td>${voucherdata.items.reduce((sum: number, item: any) => sum + (item.igst || 0), 0)?.toFixed(2)}</td>
                            <td>${voucherdata.items.reduce((sum: number, item: any) => sum + (item.netAmount || 0), 0)?.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="summary-section">
                        <div class="left">
                        <table>
                            <th>Class</th>
                            <th>Taxable Amt.</th>
                            <th>@IGST</th>
                            <th>Total Amt.</th>
        
                            <tr>
                            <td>0.00%</td>
                            <td>${totalAmountBeforeTax?.toFixed(2)}</td>
                            <td>0.00</td>
                            <td>${totalAmountBeforeTax?.toFixed(2)}</td>
                            </tr>
                            <tr>
                            <td>5.00%</td>
                            <td>${totalGST?.toFixed(2)}</td>
                            <td>${totalGST?.toFixed(2)}</td>
                            <td>${(totalAmountBeforeTax + totalGST)?.toFixed(2)}</td>
                            </tr>
                        </table>
                        </div>
        
                        <div class="right">
                        <table>
                            <tr>
                            <td>Total Amount Before Tax:</td>
                            <td>${totalAmountBeforeTax?.toFixed(2)}</td>
                            </tr>
                            <tr>
                            <td>Less: Discount Amount:</td>
                            <td>0.00</td>
                            </tr>
                            <tr>
                            <td>Add: IGST:</td>
                            <td>${totalGST?.toFixed(2)}</td>
                            </tr>
                            <tr>
                            <td>Total Tax Amount (GST):</td>
                            <td>${totalGST?.toFixed(2)}</td>
                            </tr>
                        </table>
                        </div>
                    </div>
        
                    <div class="bill-amount"><strong>Bill Amount:</strong> ${totalAmount?.toFixed(2)}</div>
        
                    <div class="termsANDsignatory">
                        <div class="terms-conditions">
                        <h3>Terms & Conditions:</h3>
                        <ul>
                            <li>1. We are not responsible for loss and damage caused by transport in transit.</li>
                            <li>2. Interest @ 18% will be charged if payment is not made within 7 days.</li>
                            <li>3. Goods once sold will not be taken back.</li>
                            <li>4. I am liable to pay tax on the above and authorized to sign this invoice.</li>
                        </ul>
                        </div>
        
                        <div class="signatory">
                        <p>For ${companyInfo?.companyName}</p>
                        <p>Authorized Signatory</p>
                        </div>
                    </div>
                    </div>
                </div>
                </body>
            </html>
            `)
            if (isNewSave) {
                await printInvoice(true, `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
        
                body {
                font-family: "Arial", sans-serif;
                background-color: #f4f6f9;
                margin: 0;
                padding: 0;
                }
                .invoice-container {
                padding: 20px;
                border: 2px solid black;
                }
                .main-container {
                max-width: 794px;
                margin: auto;
                background: white;
                padding: 30px;
                }
                .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                align-items: start;
                }
                .header .left,
                .header .right {
                width: 48%;
                }
                .header .center {
                width: 48%;
                text-align: center;
                }
                .header .center h1 {
                font-size: 30px;
                color: #333;
                margin: 0;
                font-weight: bold;
                }
                .header .center p {
                font-size: 16px;
                color: #555;
                margin: 5px 0;
                }
                .header .left {
                font-size: 14px;
                text-align: left;
                }
                .header .right {
                font-size: 14px;
                text-align: right;
                }
                .party-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                font-size: 14px;
                border: 1px solid black;
                }
                .party-details .left-column,
                .party-details .right-column {
                width: 48%;
                padding: 15px;
                }
                .right-column {
                padding-left: 25px;
                display: flex;
                border-left: #333 solid 1px;
                justify-content: space-between;
                }
                .right-column .box {
                width: 48%;
                padding: 15px;
                }
                table {
                    width: 100%; /* Ensure the table fits within the container */
                    table-layout: fixed; /* Fixed column widths to prevent overflow */
                    margin: 20px 0;
                }

                table, th, td {
                    border: 1px solid #ddd; /* Uniform border for table elements */
                }

                th, td {
                    padding: 10px; /* Slightly smaller padding for better fit */
                    text-align: left; /* Left-align text for readability */
                    word-wrap: break-word; /* Ensure long text wraps within the cell */
                    overflow-wrap: break-word; /* Additional wrap support for browsers */
                }

                th {
                    background-color: #f5f5f5; /* Light background for headers */
                    font-weight: bold;
                    color: #333;
                    text-align: center; /* Center header text */
                }

                td {
                    color: #555; /* Softer text color for better contrast */
                    text-align: center; /* Center-align table content */
                }
                .strong {
                margin-bottom: 10px;
                }
                td {
                color: #555;
                }
                .totals td {
                font-size: 16px;
                font-weight: bold;
                padding-top: 10px;
                }
                .summary-section {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
                }
                .summary-section .left,
                .summary-section .right {
                width: 48%;
                }
                .summary-section table {
                width: 100%;
                margin-top: 10px;
                }
                .summary-section td {
                padding: 8px;
                text-align: left;
                }
                .bill-amount {
                margin-top: 30px;
                font-size: 22px;
                font-weight: bold;
                text-align: right;
                color: #333;
                }
                .terms-conditions {
                font-size: 14px;
                line-height: 1.6;
                }
                .terms-conditions h3 {
                font-size: 16px;
                color: #333;
                margin-bottom: 10px;
                }
                .terms-conditions ul {
                list-style-type: none;
                padding-left: 0;
                }
                .terms-conditions li {
                margin-bottom: 8px;
                color: #555;
                }
        
                .termsANDsignatory {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #ddd;
                }
        
                .terms-conditions {
                width: 48%;
                }
        
                .signatory {
                width: 48%;
                text-align: right;
                font-size: 14px;
                font-weight: bold;
                color: #333;
                }
        
                .TaxInvoiceContainer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                }
        
                .TaxInvoice {
                text-align: center;
                font-size: 24px;
                margin-left: 80px;
                font-weight: bold;
                flex: 1;
                color: #333;
                }
        
                .original-copy {
                text-align: right;
                    font-weight: bold;
                color: #333;
                }
            </style>
                </head>
                <body>
                <div class="main-container">
                    <div class="TaxInvoiceContainer">
                    <p class="TaxInvoice">Tax Invoice</p>
                    <p class="original-copy">{COPYTYPE}</p>
                    </div>
        
                    <div class="invoice-container">
                    <div class="header">
                        <div class="left">
                        <strong>GSTIN No:${companyInfo?.gstNo}</strong><br />
                        <strong>PAN No:${companyInfo?.panNo}</strong>
                        </div>
                        <div class="center">
                        <h1>${companyInfo?.companyName}</h1>
                        <p>${companyInfo?.address1},${companyInfo?.city},${companyInfo?.district}</p>
                        </div>
                        <div class="right">
                        <strong>Tel: ${companyInfo?.mobileNo}, ${companyInfo?.mobileNo2}</strong><br />
                        <strong>${companyInfo?.email}</strong>
                        </div>
                    </div>
        
                    <div class="party-details">
                        <div class="left-column">
                        <div class="strong">
                            <strong>Party Name:</strong> ${customerName || "N/A"}<br />
                        </div>
                        <div class="strong">
                            <strong>Address:</strong> ${customerAddress || "N/A"}<br />
                        </div>
                        <div class="strong">
                            <strong>GSTIN:${customerGSTNo || "N/A"}</strong><br />
                        </div>
                        <strong>Phone:</strong><br />
                        <div class="strong">
                            <strong>GST NO:</strong> ${customerPAN || "N/A"}<br />
                        </div>
                        <div class="strong">
                            <strong>Delivery At:</strong> ${transportDetailsInvoice.deliveryAddress || "N/A"}<br />
                        </div>
                        </div>
                        <div class="right-column">
                        <div class="box">
                            <div class="strong"><strong>INVOICE NO:</strong> ${voucherdata.voucherNo}<br /></div>
                            <div class="strong"><strong>GR No.:</strong> ${transportDetailsInvoice.grNo || "N/A"}<br /></div>
                            <div class="strong"><strong>GR Date:</strong> ${transportDetailsInvoice.grDate || "N/A"}<br /></div>
                            <div class="strong">
                            <strong>Vehicle No.:</strong> ${transportDetailsInvoice.vehicleNumber || "N/A"}<br />
                            </div>
                            <div class="strong"><strong>Transport:</strong> ${transportDetailsInvoice.transporterName || "N/A"}<br /></div>
                        </div>
                        <div class="box">
                            <div class="strong"><strong>Date:</strong> ${formattedVoucherDate}<br /></div>
                            <div class="strong"><strong>EWay No.:</strong> ${transportDetailsInvoice.ewayBillNo || "N/A"}<br /></div>
                            <div class="strong"><strong>EWay Date:</strong> ${transportDetailsInvoice.ewayDate || "N/A"}<br /></div>
                            <div class="strong"><strong>State:</strong> ${transportDetailsInvoice.state || "N/A"}<br /></div>
                        </div>
                        </div>
                    </div>
                    <table style="zoom:75%">
                        <thead>
                        <tr>
                            <th>S.N</th>
                            <th>Item Description</th>
                            <th>HSN</th>
                            <th>QTY</th>
                            <th>UOM</th>
                            <th>Rate</th>
                            <th>Discount (%) & Amt</th>
                            <th>Taxable Amt</th>
                            <th>Tax</th>
                            <th>IGST</th>
                            <th>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${voucherdata.items?.map((item: any, index: number) => {
                            return `
                            <tr key="${item.itemId}">
                                <td>${index + 1}</td>  
                                <td>${item.itemDescription || "N/A"}</td>
                                <td>${item.hsnCode || "N/A"}</td>
                                <td>${item.mainQty || 0}</td> 
                                <td>${item.uom || "N/A"}</td>
                                <td>${item.pricePer || 0}</td> 
                                <td>${item.discountPercentage || 0}% / ${item.discountAmount || 0}</td> 
                                <td>${item.basicAmount || 0}</td> 
                                <td>${item.sgst || 0}</td>
                                <td>${item.igst || 0}</td> 
                                <td>${item.netAmount || 0}</td> 
                            </tr>
                            `;
                        }).join("")}
                            <tr>
                            <td colspan="7" style="text-align: right; font-weight: bold">
                                Total:
                            </td>
                            <td>${voucherdata.items.reduce((sum: number, item: any) => sum + (item.basicAmount || 0), 0)?.toFixed(2)}</td>
                            <td>${voucherdata.items.reduce((sum: number, item: any) => sum + (item.sgst || 0), 0)?.toFixed(2)}</td>
                            <td>${voucherdata.items.reduce((sum: number, item: any) => sum + (item.igst || 0), 0)?.toFixed(2)}</td>
                            <td>${voucherdata.items.reduce((sum: number, item: any) => sum + (item.netAmount || 0), 0)?.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="summary-section">
                        <div class="left">
                        <table>
                            <th>Class</th>
                            <th>Taxable Amt.</th>
                            <th>@IGST</th>
                            <th>Total Amt.</th>
        
                            <tr>
                            <td>0.00%</td>
                            <td>${totalAmountBeforeTax?.toFixed(2)}</td>
                            <td>0.00</td>
                            <td>${totalAmountBeforeTax?.toFixed(2)}</td>
                            </tr>
                            <tr>
                            <td>5.00%</td>
                            <td>${totalGST?.toFixed(2)}</td>
                            <td>${totalGST?.toFixed(2)}</td>
                            <td>${(totalAmountBeforeTax + totalGST)?.toFixed(2)}</td>
                            </tr>
                        </table>
                        </div>
        
                        <div class="right">
                        <table>
                            <tr>
                            <td>Total Amount Before Tax:</td>
                            <td>${totalAmountBeforeTax?.toFixed(2)}</td>
                            </tr>
                            <tr>
                            <td>Less: Discount Amount:</td>
                            <td>0.00</td>
                            </tr>
                            <tr>
                            <td>Add: IGST:</td>
                            <td>${totalGST?.toFixed(2)}</td>
                            </tr>
                            <tr>
                            <td>Total Tax Amount (GST):</td>
                            <td>${totalGST?.toFixed(2)}</td>
                            </tr>
                        </table>
                        </div>
                    </div>
        
                    <div class="bill-amount"><strong>Bill Amount:</strong> ${totalAmount?.toFixed(2)}</div>
        
                    <div class="termsANDsignatory">
                        <div class="terms-conditions">
                        <h3>Terms & Conditions:</h3>
                        <ul>
                            <li>1. We are not responsible for loss and damage caused by transport in transit.</li>
                            <li>2. Interest @ 18% will be charged if payment is not made within 7 days.</li>
                            <li>3. Goods once sold will not be taken back.</li>
                            <li>4. I am liable to pay tax on the above and authorized to sign this invoice.</li>
                        </ul>
                        </div>
        
                        <div class="signatory">
                        <p>For ${companyInfo?.companyName}</p>
                        <p>Authorized Signatory</p>
                        </div>
                    </div>
                    </div>
                </div>
                </body>
            </html>
            `,false,false);
            }            
        } catch (error) {
            console.error("Error fetching voucher:", error);
          }
        };
        if(voucherId !== null && voucherId !== undefined){
            fetchVoucher();
        }
   
    }


    useEffect(() => {
        let filteredAccounts: AccountDtoForDropDownList[] = [];
        setValue('accountId', '');
        setPartyGST('');
        if (paymentMode?.toLowerCase().includes("cash")) {
            const cashAccount = allAccounts.find(acc => acc.accountName === "CASH");
            const otherAccounts = allAccounts.filter(acc => acc.accountName !== "CASH");
            if (cashAccount) {
                filteredAccounts = [cashAccount, ...otherAccounts];
                setValue('accountId', cashAccount.accountID);
                if (askForCustomerDetailWhenCash && cashAccount) {
                    setFocusBillNo(true);
                    setTimeout(() => {
                        if (!voucher && !voucherId) // avoid opening in edit mode
                        setShowCustomerDetailModal(true);
                        setFocusBillNo(false);
                    }, 100);

                }
            } else {
                filteredAccounts = otherAccounts;
            }
        } else if (paymentMode?.toLowerCase().includes("credit")) {
            filteredAccounts = allAccounts.filter(account => account.accountGroupName === 'CUSTOMER' || account.accountGroupName === 'SUNDRY CREDITORS' || account.accountGroupName === 'SUNDRY DEBTORS');
        } else if (paymentMode?.toLowerCase().includes("upi") || paymentMode?.toLowerCase().includes("bank")) {
            filteredAccounts = allAccounts.filter(account => account.accountGroupName === 'BANK ACCOUNTS' || account.accountGroupName === 'SECURED LOANS');
        }
        setDisplayedAccounts(filteredAccounts);
        const dropdownElement = document.querySelector('[name="accountId"]');
        if (dropdownElement) {
            dropdownElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, [paymentMode, allAccounts, setValue]);
    //}, [paymentMode, setValue]);


    const fetchItemDetails = async (itemId: number, index: number, selectedOption: string) => {

    
        const gstSlabMatch = selectedOption.match(/GSTSlab:\s*([\d.]+%)/);
        const gstSlabValue = gstSlabMatch ? parseFloat(gstSlabMatch[1]) : null; // Convert "3%" to 3
    
        const billBookId = watch("billBookId");
        if (!billBookId) {
            toast.error("Select bill book first.");
            setValue(`items[${index}].itemId`, null); 
            remove(index);
            if (fields.length === 1) {
                append(defaultItems); 
            }
            return;
        }

        if (selectedTaxType === "Inclusive" && (!gstSlabValue || gstSlabValue <= 0)) {
            toast.error("Inclusive type doesn't include items without tax.");
            setValue(`items[${index}].itemId`, null);
            remove(index);
            if (fields.length === 1) {
                append(defaultItems); 
            }
            return;        }
    
        if (selectedTaxType === "Exclusive" && gstSlabValue && gstSlabValue > 0) {
            toast.error("Exclusive type doesn't include items with tax.");
            setValue(`items[${index}].itemId`, null); 
            remove(index);
            if (fields.length === 1) {
                append(defaultItems); 
            }
            return;
        }
        
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
            serialNumberValues:serialNumbers,
        });
        setPricePerOptions(prevOptions => ({
            ...prevOptions,
            [index]: []
        }))

        try {
            const itemDetails: ItemDetailDto = await agent.Item.getItemDetailById(accessId, itemId);
            setValue(`items[${index}].itemDetail`, itemDetails);
            setValue(`items[${index}].itemId`, itemDetails.itemId);
            setValue(`items[${index}].itemDetail.mainUnitName`, itemDetails.mainUnitName);

            const pricePerOptionsForItem = [{ value: 'main', label: itemDetails.mainUnitName || '' }];
            if (itemDetails.alternateUnitName && itemDetails.mainUnitName !== itemDetails.alternateUnitName) {
                setUseAltQty(true);
                pricePerOptionsForItem.push({ value: 'alt', label: itemDetails.alternateUnitName || '' });
            }
            setPricePerOptions(prevOptions => ({
                ...prevOptions,
                [index]: pricePerOptionsForItem
            }));

            if (voucherType == VoucherTypeEnum.ItemSale) {
                const matchingOption = pricePerOptionsForItem.find(option => option.label.includes(itemDetails.applySalesPriceOn as string));
                const pricePerValue = matchingOption ? matchingOption.value : 'main';
                setValue(`items[${index}].pricePer`, pricePerValue);
                setValue(`items[${index}].rate`, itemDetails.salePrice);
                setValue(`items[${index}].discountPercentage`, itemDetails.itemDiscountOnSalePercentage);
            }
            else if (voucherType == VoucherTypeEnum.ItemPurchase) {
                const matchingOption = pricePerOptionsForItem.find(option => option.label.includes(itemDetails.applyPurchasePriceOn as string));
                const pricePerValue = matchingOption ? matchingOption.value : 'main';
                setValue(`items[${index}].pricePer`, pricePerValue);
                setValue(`items[${index}].rate`, itemDetails.purchasePrice);
                setValue(`items[${index}].discountPercentage`, itemDetails.itemDiscountOnPurchasePercentage);

            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            toast.error('Failed to fetch item details.');
            const fallbackPricePer = getValues(`items[${index}].itemDetail.mainUnitName`) || 'main';
            setValue(`items[${index}].pricePer`, fallbackPricePer);

        }
    };

    const calculateItemRow = (index: number, fieldName: string, value: string) => {
        if (fieldName != "pricePer") {
            setValue(`items[${index}].${fieldName}`, value);
        }

        setTimeout(() => {
            const item: ItemsInVoucherDto = getValues(`items[${index}]`);
            let pricePer = item.pricePer;
            if (fieldName == 'pricePer') {
                pricePer = value;
            }
            const { rate, discountAmount: enteredDiscountAmount, itemDetail } = item;
            let { mainQty, altQty, discountPercentage } = item;
            const taxRate = itemDetail && itemDetail.gstSlab?.igst || 0;
            const conversion = itemDetail && itemDetail.conversion || 1;

            mainQty = parseFloat(mainQty.toString()) || 0;
            discountPercentage = parseFloat(discountPercentage.toString()) || 0;
            altQty = mainQty * conversion;
            const qty = pricePer === 'alt' ? altQty : mainQty;

            const rateValue = rate && parseFloat(rate.toString()) || 0;
            let basicAmount = qty * rateValue;
            let discountAmount = enteredDiscountAmount;

            if (fieldName === 'discountPercentage') {
                discountAmount = basicAmount * (parseFloat(discountPercentage.toString()) / 100);
                setValue(`items[${index}].discountAmount`, discountAmount.toFixed(2));
            } else if (fieldName === 'discountAmount') {
                const calculatedDiscountPercentage = (discountAmount / basicAmount) * 100;
                setValue(`items[${index}].discountPercentage`, calculatedDiscountPercentage.toFixed(2));
            }
            else if (discountPercentage > 0) {
                discountAmount = basicAmount * (parseFloat(discountPercentage.toString()) / 100);
                setValue(`items[${index}].discountAmount`, discountAmount.toFixed(2));
            }

            basicAmount -= discountAmount;
            basicAmount = parseFloat(basicAmount.toFixed(2));

            let iGST = 0, cGST = 0, sGST = 0;
            let taxAmount = 0, netAmount = 0;
            if (selectedTaxType === "Inclusive" && basicAmount > 0) {
                const amountBeforeTax = basicAmount / (1 + (taxRate / 100));
                taxAmount = basicAmount - amountBeforeTax;
                netAmount = basicAmount;
                basicAmount = amountBeforeTax;
            } else if (basicAmount > 0) {
                taxAmount = basicAmount * (taxRate / 100);
                netAmount = basicAmount + taxAmount;
            }

            if (isAccountOutOfState) {
                iGST = taxAmount;
            } else {
                cGST = sGST = taxAmount / 2;
                cGST = parseFloat(cGST.toFixed(2));
                sGST = parseFloat(sGST.toFixed(2));
            }
            netAmount = parseFloat((basicAmount + cGST + sGST + iGST).toFixed(2));

            setValue(`items[${index}].altQty`, altQty.toFixed(2));
            setValue(`items[${index}].basicAmount`, basicAmount.toFixed(2));
            setValue(`items[${index}].netAmount`, netAmount.toFixed(2));
            setValue(`items[${index}].iGST`, iGST.toFixed(2));
            setValue(`items[${index}].sGST`, sGST.toFixed(2));
            setValue(`items[${index}].cGST`, cGST.toFixed(2));
            setValue(`items[${index}].netAmount`, netAmount.toFixed(2));

            if (item.itemId && item.basicAmount > 0) {
                const items = getValues('items');
                if (index === items.length - 1) {
                    append(defaultItems);
                }
            }

        }, 0);

        setTimeout(() => {
            calculateBillSummary();
        }, 0);
    };
    const [showBillNumberExistsPopup, setShowBillNumberExistsPopup] = useState(false);
    const [showValidationPopup, setShowValidationPopup] = useState(false);
    const [existingVoucher, setExistingVoucher] = useState();

    const checkIfBillNumberExists = async (value: string) => {
        const billBookId = watch("billBookId");
        if (!billBookId) {
            toast.error("Bill Book ID is required to check if the bill number exists.");
            return;
        }
    
        var voucherExists = await agent.SalePurchase.checkIfBillNumberExists(accessId, billBookId, value);
        if (voucherExists.totalRoundOff > 0) {
            setExistingVoucher(voucherExists)
            setIsBillNumberExists(true);
            setShowBillNumberExistsPopup(true);
        } else {
            setIsBillNumberExists(false);
        }
    }
    
    
    const BillNumberExistsPopup = ({ existingVoucher,show, onHide }: { existingVoucher: ItemSalePurchaseVoucherDto ,show: boolean, onHide: () => void }) => {
        return (
            <CommonModal show={show} onHide={onHide} size="sm">
                <div className="p-4">
                    <h5 className="text-center text-danger mb-4" style={{ fontWeight: "600" }}>
                        Bill Number Already Exists
                    </h5>
                    <p className="text-center">The bill number you entered already exists. Please enter a different bill number.</p>
                    <p className="text-center">Account: {existingVoucher.accountName}.</p>
                    <p className="text-center">Total: {existingVoucher.totalRoundOff}.</p>
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="outline-danger"
                            className="btn-sm px-4"
                            onClick={onHide}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </CommonModal>
        );
    };

    const ValidationPopup = ({ show, onHide }: { show: boolean, onHide: () => void }) => {
        return (
            <CommonModal show={show} onHide={onHide} size="sm">
                <div className="p-4">
                    <h5 className="text-center text-danger mb-4" style={{ fontWeight: "600" }}>
                        This field is required
                    </h5>
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="outline-danger"
                            className="btn-sm px-4"
                            onClick={onHide}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </CommonModal>
        );
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
            totalMainQty += parseFloat(item.mainQty?.toString() || '0');
            totalAltQty += parseFloat(item.altQty?.toString() || '0');
            totalBasicAmount += parseFloat(item.basicAmount?.toString() || '0');
            totalDiscount += parseFloat(item.discountAmount?.toString() || '0');
            totalCGST += parseFloat(item.cGST?.toString() || '0');
            totalSGST += parseFloat(item.sGST?.toString() || '0');
            totalIGST += parseFloat(item.iGST?.toString() || '0');
            totalTax += parseFloat(item.cGST?.toString() || '0') + parseFloat(item.sGST?.toString() || '0') + parseFloat(item.iGST?.toString() || '0');
            netBillAmount += parseFloat(item.netAmount?.toString() || '0');
        });
        let roundedNetBillAmount = Math.round(netBillAmount);
        const totalRoundOff = parseFloat((netBillAmount - roundedNetBillAmount).toFixed(2));
        const totalCharges: number = otherCharges.reduce((total, item) => {
            if (item.addedOrSubtracted === '-') {
                roundedNetBillAmount -= item.grossAmount;
            } else if (item.addedOrSubtracted === '+') {
                roundedNetBillAmount += item.grossAmount;
            }

            return ((item.addedOrSubtracted === '-') ? (total - item.grossAmount) : (item.addedOrSubtracted === '+') ? (total + item.grossAmount) : 0);
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
            if (isBillNumberExists) {
                toast.error('Bill Number already exists.');
                return;
            }
            const finalData = convertFieldValuesToDto(data);
            const today = new Date();
            if (!isSundayAllowed) {
                const isSunday = today.getDay() === 0;
                if (isSunday) {
                    toast.error("Voucher cannot be saved on Sundays.");
                    return;
                }
            }

            today.setHours(0, 0, 0, 0);
            if (data.voucherDate) {
                const [day, month, year] = data.voucherDate.split("-").map(Number);
                const parsedVoucherDate = new Date(year, month - 1, day);
                if (parsedVoucherDate > today) {
                    toast.error('The voucher date cannot be in the future.');
                    return;
                }
            }
            if (voucherType == VoucherTypeEnum.ItemSale) {
                if (voucherId || voucher) {
                    // update the invoice   
                    await agent.SalePurchase.updateVoucher(accessId, finalData);
                    toast.success('Voucher updated successfully');
                    reset()
                    setTransportDetails(defaultTransportDetails);
                    setCustomerDetail(defaultCustomerDetails);
                    setBillSummary(defaultBillSummary);
                }
                else {
                    var newVoucherId = await agent.SalePurchase.saveVoucher(accessId, finalData, "");
                    debugger;
                    reset({
                        billBookId: "",
                        voucherDate: "",
                        paymentMode: "",
                        items: [defaultItems],
                    });
                    setTransportDetails(defaultTransportDetails);
                    setCustomerDetail(defaultCustomerDetails);
                    setBillSummary(defaultBillSummary);
                    voucherId = newVoucherId;
                    sessionStorage.setItem('voucherId',JSON.stringify(newVoucherId));
                    toast.success('Voucher created successfully');
                    if (invoiceAfterSave && window.confirm("Do you want to print the invoice?")) {                        
                        await invoiceHtmlData(true)
                    }else{
                        reset({
                            billBookId: "",
                            voucherDate: "",
                            paymentMode: "",
                            items: [defaultItems],
                        });
                        setTransportDetails(defaultTransportDetails);
                        setCustomerDetail(defaultCustomerDetails);
                        setBillSummary(defaultBillSummary);
                    }
                }
                if (isInModal && onSuccessfulSubmit) {
                    onSuccessfulSubmit();
                }
            }

        } catch (error) {
            console.error('Error in onSubmit:', error);
            handleApiErrors(error);
        }
    };

    const convertFieldValuesToDto = (data: FieldValues): ItemSalePurchaseVoucherDto => {
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

        const selectedAccount = allAccounts.find(acc => acc.accountID === data.accountId);
        if (!selectedAccount) {
            toast.error("Invalid account selection. Please select a valid account.");
            throw new Error("Invalid account selection.");
        }

        const itemSalePurchaseDto: ItemSalePurchaseVoucherDto = {
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
    }

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
                batchId: (item.batchId ? item.batchId : null),
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
                serialNumberValues:item.serialNumberValues || []
            };

            if ((item.itemId === 0 || item.itemId === null) && index !== items.length - 1) {
                throw new Error("All items must be selected. One item is missing, please recheck the invoice.");
            }

            return newItem;
        });

        // Remove the last row if it's empty (itemId is 0 and net value==0 or null)
        const lastItemIndex = processedItems.length - 1;
        if (processedItems.length > 0 && ((processedItems[lastItemIndex].itemId === 0 || processedItems[lastItemIndex].itemId === null) || (parseFloat(processedItems[lastItemIndex].netAmount.toString()) === 0 || processedItems[lastItemIndex].netAmount === null))) {
            processedItems.pop();
        }


        return processedItems;
    };
    
    const printInvoice = async (isNewSave : boolean, html: string, isPrintPDF : boolean, isPrintEmail: boolean) => {
        if (!voucherId) {
            handleSubmit(async (data) => {
                onSubmit(data);
            })();
        } else if (isNewSave) {
            if (isPrintPDF) {
            if (originalCopyInvoice) await generateAndDownloadInvoice("Original Copy", invoiceHtml);
            if (officeCopyInvoice) await generateAndDownloadInvoice("Office Copy", invoiceHtml);
            if (customerCopyInvoice) await generateAndDownloadInvoice("Customer Copy", invoiceHtml);
            if (duplicateCopyInvoice) await generateAndDownloadInvoice("Duplicate Copy", invoiceHtml);
            } else {
                if (originalCopyInvoice) await generateAndPrintInvoice("Original Copy", html);
                if (officeCopyInvoice) await generateAndPrintInvoice("Office Copy", html);
                if (customerCopyInvoice) await generateAndPrintInvoice("Customer Copy", html);
                if (duplicateCopyInvoice) await generateAndPrintInvoice("Duplicate Copy", html);
            }
        } else if (isPrintPDF) {
            if (originalCopyInvoice) await generateAndDownloadInvoice("Original Copy", invoiceHtml);
            if (officeCopyInvoice) await generateAndDownloadInvoice("Office Copy", invoiceHtml);
            if (customerCopyInvoice) await generateAndDownloadInvoice("Customer Copy", invoiceHtml);
            if (duplicateCopyInvoice) await generateAndDownloadInvoice("Duplicate Copy", invoiceHtml);
        }
        else if(isPrintEmail){
            setShowEmailModal(true);
        } 
        else {
            if (originalCopyInvoice) await generateAndPrintInvoice("Original Copy", invoiceHtml);
            if (officeCopyInvoice) await generateAndPrintInvoice("Office Copy", invoiceHtml);
            if (customerCopyInvoice) await generateAndPrintInvoice("Customer Copy", invoiceHtml);
            if (duplicateCopyInvoice) await generateAndPrintInvoice("Duplicate Copy", invoiceHtml);
        }
    };
    
    const generateAndDownloadInvoice = async (copyType: string, invoiceHtml: string) => {
        const container = document.createElement("div");
        container.style.width = "794px";
        container.style.margin = "auto";
        container.innerHTML = invoiceHtml.replace("{COPYTYPE}", copyType);
        document.body.appendChild(container);
    
        const canvas = await html2canvas(container, { scale: 2 });
        document.body.removeChild(container);
    
        const pdf = new jsPDF("p", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    
        pdf.setProperties({
            title: copyType,
        });
    
        // Use the save method to download the PDF directly
        const fileName = `${copyType.replace(/\s+/g, "_")}_Invoice.pdf`;
        pdf.save(fileName);
    };
    
    
    const generateAndPrintInvoice = async (copyType: string, invoiceHtml:string) => {
        const container = document.createElement("div");
        container.style.width = "794px";
        container.style.margin = "auto";
        container.innerHTML = invoiceHtml.replace("{COPYTYPE}", copyType);
        document.body.appendChild(container);
    
        const canvas = await html2canvas(container, { scale: 2 });
        document.body.removeChild(container);
    
        const pdf = new jsPDF("p", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    
        pdf.setProperties({
            title: copyType,
        });
    
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
    };    


    if (voucherId && !voucher) return null;
    return (
        <>
            <CommonCard header={voucherType == undefined ? "" : getVoucherTypeString(voucherType)}
                        size="100%"
                        onControlPanelClick={() => {
						setShowControlPanelModal(true);
					}}
                    showControlPanelButton >
                <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isInModal}>
                    <Row className="gx-2">
                        <Col xs={12} md={3} className="custom-col-billBook">
                            <CustomDropdown
                                // defaultValue={voucher?.voucherMasterExtended?.billBookId}
                                name="billBookId"
                                label="Bill Book [F3-New]"
                                options={billBookList}
                                control={control}
                                onCreateButtonClick={() => { setShowBillBookModal(true); }}
                                onChangeCallback={handleBillBookChange}
                                badgeText={selectedTaxType}
                                dropDownWidth="400px"
                                hideDropdownIcon
                                hideClearIcon
                            />
                        </Col>
                        <Col xs={11} sm={5} md={2} className="custom-col-date">
                            <CustomDateInputBox

                                label="Date"
                                name="voucherDate"
                                validationRules={{ required: 'Date is required.' }}
                                register={register}
                                setValue={setValue}
                                error={errors.voucherDate}
                                financialYear={financialYear}
                                defaultDate={(voucher ? (voucher.voucherDate) : (lastVoucherDate))}

                            />
                        </Col>
                        <Col xs={11} sm={5} md={2} className="custom-col-reduced">
                            <CustomDropdown
                                name="paymentMode"
                                label="Payment Mode"
                                options={hideBank ? PAYMENT_MODE_OPTIONS.filter(option => option.value !== "BANK") : PAYMENT_MODE_OPTIONS}
                                control={control}
                                hideDropdownIcon
                                onChangeCallback={()=>{
                                    setValue('accountId', '');
                                    setPartyGST(''); 
                                }}
                                hideClearIcon
                                disabled={isBillNumberExists}
                                //defaultValue={ isCashDefault ? PAYMENT_MODE_OPTIONS.find(option => option.value === "CASH"): isCreditDefault ? PAYMENT_MODE_OPTIONS.find(option => option.value === "CREDIT") : undefined}
                            />
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                        <CustomDropdown
                            label="Account Name"
                            name="accountId"
                            options={displayedAccounts.map(transformAccountToOption)}
                            control={control}
                            error={errors.accountId}
                            validationRules={{ required: 'Account Name is required.' }}
                            isCreatable
                            onCreateButtonClick={() => { setShowAccountModal(true); }}
                            dropDownWidth="800px"
                            onChangeCallback={handleAccountChange}
                            badgeText={partyGST}
                            hideDropdownIcon
                            hideClearIcon
                            key={paymentMode}
                            disabled={(askForCustomerDetailWhenCash && paymentMode?.toLowerCase().includes("cash")) || isBillNumberExists}
                            // defaultValue={voucher?.voucherDetails?.accountId}
                        />
                        </Col>
                        <Col xs={12} md={2} className="custom-col-reduced">
                            <CustomInput
                                label="Bill Number"
                                name="voucherNo"
                                register={register}
                                maxLength={12}
                                isTextCenter
                                autoFocus={focusBillNo}
                                onChange={(e) => checkIfBillNumberExists(e.target.value)}
                                // defaultValue={voucher?.voucherNumber}
                            />
                        </Col>
                    </Row>
                    <div className="scrollable-table-container" ref={scrollContainerRef}>
                        <Table bordered hover className="mt-2 custom-sale-table">
                            <thead className="custom-sale-thead">
                                <tr>
                                    <th style={{ width: '4%', textAlign: 'center' }}>SrNo</th>
                                    <th style={{ width: '20%', textAlign: 'center' }}>Item Name [F3-New]</th>
                                    <th style={{ width: '10%', textAlign: 'center' }}>Main Qty</th>

                                    {useAltQty && (
                                        <th style={{ width: '10%', textAlign: 'center' }}>Alt Qty</th>
                                    )}

                                    {useFree && (<th>Free</th>)}

                                    <th style={{ width: '10%', textAlign: 'center' }}>
                                        {selectedTaxType === 'Exclusive' ? 'Rate Without GST' : 'Rate With GST'}</th>

                                    {useAltQty && (
                                        <th style={{ width: '8%', textAlign: 'center' }}>Price Per</th>
                                    )}

                                    <th style={{ width: '10%', textAlign: 'center' }}>Basic Amount</th>
                                    <th style={{ width: '8%', textAlign: 'center' }}>Discount %</th>
                                    <th style={{ width: '10%', textAlign: 'center' }}>Discount Amt</th>

                                    {isAccountOutOfState == true ? (
                                        <th style={{ width: '10%', textAlign: 'center' }}>IGST</th>
                                    ) : (
                                        <>
                                            <th style={{ width: '10%', textAlign: 'center' }}>SGST</th>
                                            <th style={{ width: '10%', textAlign: 'center' }}>CGST</th>
                                        </>
                                    )}
                                    <th style={{ width: '10%', textAlign: 'center' }}>Amount</th>
                                    <th style={{ width: '3%', textAlign: 'center' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                            {fields.map((field, index) => {
                                const mainQty = watch(`items[${index}].mainQty`); // Watch mainQty
                                const rate = watch(`items[${index}].rate`); // Watch rate

                                const disableFieldsAfterMainQty = !mainQty || parseFloat(mainQty) === 0;
                                const disableFieldsAfterRate = !rate || parseFloat(rate) === 0;

                                return (
                                    <tr key={field.id}>
                                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td>
                                            <CustomDropdown
                                                name={`items[${index}].itemId`}
                                                options={itemDropDownList}
                                                control={control}
                                                isCreatable
                                                onCreateButtonClick={() => { setShowItemModal(true); }}
                                                dropDownWidth="800px"
                                                onChangeCallback={(selectedOption: OptionType | null) => {
                                                    if (selectedOption) {
                                                        setTimeout(() => fetchItemDetails(selectedOption.value, index, selectedOption.label), 0);
                                                    }
                                                }}
                                                hideDropdownIcon
                                                hideClearIcon
                                                isInTable
                                                onFocus={index === fields.length - 1 ? scrollToBottom : undefined}
                                                disabled={isBillNumberExists}
                                            />
                                        </td>

                                        <td>
                                            <CustomInput
                                                name={`items[${index}].mainQty`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onChange={(e) => calculateItemRow(index, 'mainQty', e.target.value)}
                                                disabled={!isMainQty || isBillNumberExists}
                                            />
                                        </td>
                                        {/* Alternate Qty */}
                                        {useAltQty && (
                                            <td>
                                                <CustomInput
                                                    name={`items[${index}].altQty`}
                                                    register={register}
                                                    allowedChars="numericDecimal"
                                                    onChange={(e) => calculateItemRow(index, 'altQty', e.target.value)}
                                                    disabled={disableFieldsAfterMainQty || isBillNumberExists}
                                                />
                                            </td>
                                        )}

                                        {useFree && (
                                            <td>
                                                <CustomInput
                                                    name={`items[${index}].free`}
                                                    register={register}
                                                    allowedChars="numericDecimal"
                                                    disabled={disableFieldsAfterMainQty || isBillNumberExists}
                                                />
                                            </td>
                                        )}

                                        <td>
                                            <CustomInput
                                                name={`items[${index}].rate`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onChange={(e) => {
                                                    calculateItemRow(index, 'rate', e.target.value);
                                                    const rateValue = parseFloat(e.target.value) || 0;
                                                    // Set fields to read-only if rate is 0
                                                    setValue(`items[${index}].isRateZero`, rateValue === 0);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'F3' && selectedTaxType === 'Exclusive') {
                                                        e.preventDefault();
                                                        setShowInclusiveRateInput(index);
                                                        setFocusInclusiveRateInput(`items[${index}].inclusiveRate`);
                                                    }
                                                }}
                                                disabled={disableFieldsAfterMainQty || !isRateSale || isBillNumberExists}
                                            />
                                             {showInclusiveRateInput === index && (
                                                <CustomInput
                                                    className="mt-2"
                                                    name={`items[${index}].inclusiveRate`}
                                                    register={register}
                                                    allowedChars="numericDecimal"
                                                    value={inclusiveRate}
                                                    onChange={(e) => setInclusiveRate(e.target.value)}
                                                    onBlur={() => {
                                                        const itemDetails = getValues(`items[${index}].itemDetail`) as ItemDetailDto;
                                                        const taxRate = parseFloat(itemDetails.gstSlab?.igst?.toString() || "0");
                                                        const inclusiveRateValue = parseFloat(inclusiveRate) || 0;
                                                        const exclusiveRate = inclusiveRateValue / (1 + taxRate / 100);
                                                        setValue(`items[${index}].rate`, exclusiveRate.toFixed(2));
                                                        calculateItemRow(index, 'rate', exclusiveRate.toFixed(2));
                                                        setShowInclusiveRateInput(null);
                                                        setInclusiveRate("");
                                                        setFocusInclusiveRateInput(null);
                                                    }}
                                                    autoFocus={focusInclusiveRateInput === `items[${index}].inclusiveRate`}
                                                    disabled={isBillNumberExists}
                                                />
                                            )}

                                        </td>
                                        {/* Price Per */}
                                        {useAltQty && (
                                            <td>
                                                <div data-skip-focus="true">
                                                    <CustomDropdown
                                                        name={`items[${index}].pricePer`}
                                                        control={control}
                                                        options={pricePerOptions[index] || []}
                                                        hideClearIcon={true}
                                                        hideDropdownIcon={true}
                                                        onChangeCallback={(selectedOption: OptionType | null) => {
                                                            if (selectedOption)
                                                                calculateItemRow(index, 'pricePer', selectedOption.value);
                                                        }}
                                                        dropDownWidth="100px"
                                                        isInTable
                                                        disabled={isBillNumberExists}
                                                    />
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <CustomInput
                                                name={`items[${index}].basicAmount`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                disabled={disableFieldsAfterMainQty || disableFieldsAfterRate || getValues(`items[${index}].isRateZero`)}
                                            />
                                        </td>

                                        <td>
                                            <CustomInput
                                                name={`items[${index}].discountPercentage`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onChange={(e) => calculateItemRow(index, 'discountPercentage', e.target.value)}
                                                maxLength={2}
                                                disabled={disableFieldsAfterMainQty || disableFieldsAfterRate || !isDiscountPercentage || getValues(`items[${index}].isRateZero`) }
                                            />
                                        </td>

                                        <td>
                                            <CustomInput
                                                name={`items[${index}].discountAmount`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onChange={(e) => calculateItemRow(index, 'discountAmount', e.target.value)}
                                                disabled={disableFieldsAfterMainQty || disableFieldsAfterRate || !isDiscount || getValues(`items[${index}].isRateZero`)}
                                            />
                                        </td>

                                        {isAccountOutOfState == true ? (
                                            <td>
                                                <CustomInput
                                                    name={`items[${index}].iGST`}
                                                    register={register}
                                                    allowedChars="numericDecimal"
                                                    disabled={disableFieldsAfterMainQty || disableFieldsAfterRate}
                                                />
                                            </td>
                                        ) : (
                                            <>
                                                <td>
                                                    <CustomInput
                                                        name={`items[${index}].sGST`}
                                                        register={register}
                                                        allowedChars="numericDecimal"
                                                        disabled={disableFieldsAfterMainQty || disableFieldsAfterRate}
                                                    />
                                                </td>
                                                <td>
                                                    <CustomInput
                                                        name={`items[${index}].cGST`}
                                                        register={register}
                                                        allowedChars="numericDecimal"
                                                        disabled={disableFieldsAfterMainQty || disableFieldsAfterRate}
                                                    />
                                                </td>
                                            </>
                                        )}

                                        <td>
                                            <CustomInput
                                                name={`items[${index}].netAmount`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                disabled={disableFieldsAfterMainQty || disableFieldsAfterRate}
                                            />
                                        </td>
                                        <td>
                                            {/* <div data-skip-focus="true">
                                                <CustomButton text="Add Serial" onClick={() => { setCurrentItemID(index); setShowSerialNumberModal(true); }} />
                                            </div> */}
                                            <div data-skip-focus="true">
                                                <CustomButton text="X" variant="none" onClick={() => handleDeleteRow(index)} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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
                            <Row className="mt-2 p-0 gx-1">
                                <Col><CustomButton size="sm" variant="outline-info" text="Transport Info (Ctrl+T)" className="w-100"
                                    onClick={() => {
                                        setShowTransportModal(true);
                                    }} /></Col>
                                <Col><CustomButton size="sm" variant="outline-info" text="Customer Detail (F2)" className="w-100"
                                    onClick={() => {
                                        setShowCustomerDetailModal(true);
                                    }}
                                /></Col>
                                <Col><CustomButton size="sm" variant="outline-info" text="Charges/Discount (F2)" className="w-100" onClick={() => {
                                    setShowOtherChargesModal(true);
                                }} /></Col>
                                <Col><CustomButton size="sm" variant="outline-info" text="Serial Number" className="w-100" onClick={() => {
                                    setShowSerialNumberModal(true);
                                }} /></Col>
                                <Col><CustomButton size="sm" variant="success" type="submit" text="Save Invoice (Ctrl+S)" className="w-100" /></Col>
                                <Col><CustomButton size="sm" onClick={() => {
                                    printInvoice(false, "", false, false)
                                    }} variant="success" text="Print Invoice (Ctrl+P)" className="w-100" /></Col>
                                <Col>{voucher && voucherId && <CustomButton size="sm" variant="outline-danger" text="Final Delete (Ctrl+D)" className="w-100" onClick={() => deleteVoucher()} />}</Col>

                            </Row>
                        </div>

                        <div className="bill-summary">
                            <Table>
                                <tbody>
                                    <tr>
                                        <td >Main Qty</td>
                                        <td className="text-end">{(billSummary.totalMainQty)}</td>
                                        <td >SGST</td>
                                        <td className="text-end">{billSummary.totalSGST.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td >Alt Qty</td>
                                        <td className="text-end">{billSummary.totalAltQty.toFixed(2)}</td>
                                        <td >CGST</td>
                                        <td className="text-end">{billSummary.totalCGST.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td >Basic Amt</td>
                                        <td className="text-end">{billSummary.totalBasicAmount.toFixed(2)}</td>
                                        <td >IGST</td>
                                        <td className="text-end">{billSummary.totalIGST.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td >Discount</td>
                                        <td className="text-end">{billSummary.totalDiscount.toFixed(2)}</td>
                                        <td >Total Tax</td>
                                        <td className="text-end">{billSummary.totalTax.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td ></td>
                                        <td></td>
                                        <td >Charges</td>
                                        <td className="text-end">{billSummary.totalCharges.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td ></td>
                                        <td></td>
                                        <td >Round Off</td>
                                        <td className="text-end">{billSummary.totalRoundOff.toFixed(2)}</td>
                                    </tr>

                                    <tr>
                                        <td colSpan={2}>Bill Amount (Rs.):</td>
                                        <td className="fw-bold" colSpan={2} style={{ textAlign: 'end', fontSize: '1.25rem' }}>{formatNumberIST(billSummary.netBillAmount)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>

                </FormNavigator >
            </CommonCard >
            <CommonModal show={showBillBookModal} onHide={() => { setShowBillBookModal(false); }} size='xl'>
                <Suspense fallback={<div>Loading...</div>}>
                    <SaleBillBookForm onSaveSuccess={() => { loadBillBookOptions(); setShowBillBookModal(false); }} isModalOpen={showBillBookModal} />
                </Suspense>
            </CommonModal>
            <CommonModal 
                    show={showAccountModal} 
                    onHide={() => {
                        fetchAccounts(voucherDate);                         
                        setShowAccountModal(false);
                        }
                    }
                    size='xl'>
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

            <CommonModal show={showItemModal} onHide={() => { setShowItemModal(false); }} size='xl'>
                <Suspense fallback={<div>Loading...</div>}>
                    <ItemForm
                        isModalOpen={showItemModal}
                        onCloseModalAfterSave={async () => {
                            if (financialYear?.financialYearFrom) {
                                const options = await fetchItemListForDropdown(accessId, financialYear?.financialYearFrom, voucherDate);
                                setItemDropDownList(options);
                            }
                            setShowItemModal(false);
                        }}
                    />
                </Suspense>
            </CommonModal>

            <CommonModal
				show={showControlPanelModal}
				onHide={() => {
                    fetchControlOptions();
					setShowControlPanelModal(false);
				}}
				size="sm"
			>
				<Suspense fallback={<div>Loading...</div>}>
					<ControlPanelForm
						voucherType={voucherType}
						onSaveSuccess={() => {
							fetchControlOptions();
							setShowControlPanelModal(false);
						}}
						isModalOpen={showControlPanelModal}
					/>
				</Suspense>
			</CommonModal>

            <CommonModal
                show={showPrintModal}
                onHide={() => {
                    fetchControlOptions();
                    setShowPrintModal(false);
                }}
                size="sm"
            >
                <div
                    className="p-4"
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <h5
                        className="text-center text-primary mb-4"
                        style={{ fontWeight: "600" }}
                    >
                        Bill of Supply - Printer Options
                    </h5>
                    <div className="container">
                        <div className="row justify-content-center mb-3">
                            <div className="col-auto">
                                <Button
                                    variant="primary"
                                    className="btn-sm px-4"
                                    onClick={() => printInvoice(false, "", false, false)}
                                >
                                    Preview
                                </Button>
                            </div>
                        </div>
                        <div className="row justify-content-center mb-3">
                            <div className="col-auto">
                                <Button
                                    variant="primary"
                                    className="btn-sm px-4"
                                    onClick={() => printInvoice(false, "", true,false)}
                                >
                                    PDF
                                </Button>
                            </div>
                        </div>
                        <div className="row justify-content-center mb-3">
                            <div className="col-auto">
                                <Button
                                    variant="primary"
                                    className="btn-sm px-4"
                                    onClick={() => printInvoice(false, "", false, true)}
                                >
                                    Email
                                </Button>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                variant="outline-danger"
                                className="btn-sm px-4"
                                onClick={() => setShowPrintModal(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </CommonModal>

            <CommonModal
					show={showEmailModal}
					onHide={() => 
						{
							setShowEmailModal(false);
						}
					}>
					<Suspense fallback={<div>Loading...</div>}>
						<EmailForm onSaveSuccess={() => 
							{
								setShowEmailModal(false);
							 }} isModalOpen={showEmailModal} invoiceHtml={invoiceHtml}
                             originalCopyInvoice ={originalCopyInvoice} officeCopyInvoice ={officeCopyInvoice}
                             customerCopyInvoice ={customerCopyInvoice} duplicateCopyInvoice ={duplicateCopyInvoice}
                               
                               />
					</Suspense>
			</CommonModal>

            {existingVoucher && (
                <BillNumberExistsPopup
                    existingVoucher={existingVoucher}
                    show={showBillNumberExistsPopup}
                    onHide={() => setShowBillNumberExistsPopup(false)}
                />
            )}

            <ValidationPopup
                show={showValidationPopup}
                onHide={() => setShowValidationPopup(false)}
            />


            {showTransportModal &&
                <TransportAndShippingDetailModal
                    show={showTransportModal}

                    onHide={() => {
                        setShowTransportModal(false)
                        setTimeout(() => {
                            setFocusRemarks(true);
                        }, 10);
                    }}
                    onSave={updateParentStateOfTransportDetails}
                    initialData={transportDetails}
                    
                />
            }
            {showCustomerDetailModal &&
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
            }
            {showOtherChargesModal &&
                <OtherChargesModal show={showOtherChargesModal}
                summaryAmount={billSummary.netBillAmount}
                    voucherDate={voucherDate}
                    onHide={() => {
                        setShowOtherChargesModal(false);
                        
                        setTimeout(() => {
                            setFocusRemarks(true);
                        }, 10);
                    }}
                    onSave={updateParentStateOfOtherCharges}
                    initialData={otherCharges} />
            }
            {showSerialNumberModal && <SerialNumberModal
            
                show={showSerialNumberModal}
                onHide={() => setShowSerialNumberModal(false)}
                onSave={handleSaveSerialNumbers}
                currentItemID={null}
                items={items}
            />}            

        </>
    )

}