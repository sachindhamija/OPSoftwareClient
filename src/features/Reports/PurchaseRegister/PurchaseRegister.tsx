import CommonCard from '../../../app/components/CommonCard';
import FormNavigator from '../../../app/components/FormNavigator';
import { Col, Row, Table } from 'react-bootstrap';
import {
  CommonModal,
  CustomButton,
  CustomDateInputBox,
} from '../../../app/components/Components';
import { useAppSelector } from '../../../app/store/configureStore';
import { selectCurrentFinancialYear } from '../../Masters/FinancialYear/financialYearSlice';
import { FieldValues, useForm } from 'react-hook-form';
import { formatDateForBackend, formatDateForFrontend, getFirstMonthDates } from '../../../app/utils/dateUtils';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { formatNumberIST } from '../../../app/utils/numberUtils';
// import getLastVoucherDate from '../../../app/hooks/useLastVoucherDate';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';
import agent from '../../../app/api/agent';
import { VoucherTypeEnum } from '../../Vouchers/VoucherCommon/voucherTypeEnum';
import PaymentAndReceiptForm from '../../Vouchers/VoucherCommon/PaymentAndReceiptForm';
import BankEntryForm from '../../Vouchers/BankEntry/BankEntryForm';
import JournalEntryForm from '../../Vouchers/JournalEntry/JournalEntryForm';
import { SalePurchaseForm } from '../../Vouchers/SalesPurchaseCommonVouchers/CommonForm';
import { ItemRegisterDto } from '../SaleRegister/SaleRegister';
import { useNavigate } from 'react-router-dom';

export interface PurchaseRegisterParams {
  fromDate: Date;
  toDate: Date;
}

interface PurchaseRegisterProps {
  isInModal?: boolean;
  onSuccessfulSubmit?: () => void;
  purchaseRegisterParams?: PurchaseRegisterParams | null;
}

const PurchaseRegister = ({ isInModal = false, purchaseRegisterParams = null, onSuccessfulSubmit }: PurchaseRegisterProps) => {
  const accessId = getAccessIdOrRedirect();
  const financialYear = useAppSelector(selectCurrentFinancialYear);
  const [purchaseRegisterEntries, setPurchaseRegisterEntries] = useState<ItemRegisterDto[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<ItemRegisterDto | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [initialDatesSet, setInitialDatesSet] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FieldValues>({ mode: 'all' });

    const navigate = useNavigate();
  
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        console.log(showFilterModal)
        if (event.key === 'Escape') {
          event.preventDefault();
          setTimeout(() => navigate(-1), 0);
        }
      };
  
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [navigate]);
  
  useEffect(() => {
    if (financialYear?.financialYearFrom && !initialDatesSet) {
      const { startDate, endDate } = getFirstMonthDates(financialYear.financialYearFrom);
      // setFromDate(formatDateForFrontend(startDate));
      // setToDate(formatDateForFrontend(endDate));
      // reset({
      //   fromDate: formatDateForFrontend(startDate),
      //   toDate: formatDateForFrontend(endDate)
      // });
      setInitialDatesSet(true);
      fetchPurchaseRegisterData(startDate, endDate);
    }
  }, [financialYear, initialDatesSet, reset]);

  // useEffect(() => {
  //   if (accessId && financialYear && !isInModal) {
  //     getLastVoucherDate(accessId, null, financialYear)
  //       .then((date) => setLastVoucherDate(date))
  //       .catch((error) => {
  //         console.error('Error fetching last voucher date:', error);
  //         toast.error('Failed to fetch last voucher date.');
  //       });
  //   }
  // }, [accessId, financialYear]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowFilterModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchPurchaseRegisterData = async (fromDate: string, toDate: string) => {
    try {
      if (!financialYear?.financialYearFrom) {
        toast.error('Select financial year.');
        return;
      }

      const response = await agent.Reports.ItemRegister(
        accessId,
        formatDateForBackend(fromDate),
        formatDateForBackend(toDate),
        formatDateForBackend(financialYear.financialYearFrom.toString()),
        VoucherTypeEnum.ItemPurchase
      );

      const newTotals = response.reduce((acc, entry) => ({
        mainQty: acc.mainQty + entry.mainQty,
        taxableAct: acc.taxableAct + entry.taxableAct,
        dis: acc.dis + entry.dis,
        sgst: acc.sgst + entry.sgst,
        cgst: acc.cgst + entry.cgst,
        igst: acc.igst + entry.igst,
        othChg: acc.othChg + entry.othChg,
        net: acc.net + entry.net,
      }), {
        mainQty: 0,
        taxableAct: 0,
        dis: 0,
        sgst: 0,
        cgst: 0,
        igst: 0,
        othChg: 0,
        net: 0,
      });

      setPurchaseRegisterEntries(response);
      setTotals(newTotals);
    } catch (error) {
      toast.error('Failed to fetch purchase register data.');
      console.error(error);
    }
  };

  const [totals, setTotals] = useState({
    mainQty: 0,
    taxableAct: 0,
    dis: 0,
    sgst: 0,
    cgst: 0,
    igst: 0,
    othChg: 0,
    net: 0,
  });

  const handleFilterSubmit = async (data: FieldValues) => {
    setFromDate(data.fromDate);
    setToDate(data.toDate);
    await fetchPurchaseRegisterData(data.fromDate, data.toDate);
    setShowFilterModal(false);
  };

  const handleCloseModal = () => {
    setShowVoucherModal(false);
    setSelectedVoucher(null);
    fetchPurchaseRegisterData(fromDate,toDate);
    if (isInModal && purchaseRegisterParams != null && onSuccessfulSubmit) {
      onSuccessfulSubmit();
    }
  };

  const handleRowClick = (voucher: ItemRegisterDto) => {
    setSelectedVoucher(voucher);
    setShowVoucherModal(true);
  };

  const renderVoucherForm = (voucherTypeId: VoucherTypeEnum, voucherId: string) => {
    const commonProps = {
      voucherId,
      isInModal: true,
      onSuccessfulSubmit: handleCloseModal,
    };

    switch (voucherTypeId) {
      case VoucherTypeEnum.Payment:
      case VoucherTypeEnum.Receipt:
        return <PaymentAndReceiptForm {...commonProps} voucherType={voucherTypeId} />;
      case VoucherTypeEnum.BankEntry:
        return <BankEntryForm {...commonProps} />;
      case VoucherTypeEnum.JournalEntry:
        return <JournalEntryForm {...commonProps} />;
      case VoucherTypeEnum.ItemSale:
      case VoucherTypeEnum.ItemPurchase:
      case VoucherTypeEnum.SalesReturn:
      case VoucherTypeEnum.PurchaseReturn:
      case VoucherTypeEnum.CreditNote:
      case VoucherTypeEnum.DebitNote:
        return <SalePurchaseForm {...commonProps} ledgerVoucherDate={watch('toDate')} voucherType={voucherTypeId} />;
      default:
        return null;
    }
  };

  return (
    <>
      <CommonCard 
        header="Purchase Register" 
        size="100%"
      >
                  <CustomButton 
            text="Filter" 
            onClick={() => setShowFilterModal(true)}
            variant="outline-primary"
            className="ms-2"
          />

        <FormNavigator onSubmit={() => {}} isModalOpen={isInModal}>
          <Row>
            <div className="custom-table-container">
              <Table striped bordered hover className="mt-3 custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bill No.</th>
                    <th>Cash</th>
                    <th>Name</th>
                    <th>GSTin</th>
                    <th>Main Qty</th>
                    <th>Taxable Act</th>
                    <th>Dis</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>IGST</th>
                    <th>Oth Chg</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRegisterEntries.map((entry, index) => (
                    <tr key={index} onClick={() => handleRowClick(entry)}>
                      <td>{formatDateForFrontend(entry.date)}</td>
                      <td>{entry.billNo}</td>
                      <td>{entry.cashMode}</td>
                      <td>{entry.name}</td>
                      <td>{entry.gstin}</td>
                      <td className="text-end">{formatNumberIST(entry.mainQty)}</td>
                      <td className="text-end">{formatNumberIST(entry.taxableAct)}</td>
                      <td className="text-end">{formatNumberIST(entry.dis)}</td>
                      <td className="text-end">{formatNumberIST(entry.sgst)}</td>
                      <td className="text-end">{formatNumberIST(entry.cgst)}</td>
                      <td className="text-end">{formatNumberIST(entry.igst)}</td>
                      <td className="text-end">{formatNumberIST(entry.othChg)}</td>
                      <td className="text-end">{formatNumberIST(entry.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Row>

          <Row className="justify-content-end mt-3">
            <Col xs="auto">
              <Table bordered hover className="custom-table">
                <tbody>
                  <tr>
                    <th>Main Qty</th>
                    <th>Taxable Act</th>
                    <th>Dis</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>IGST</th>
                    <th>Oth Chg</th>
                    <th>Net Total</th>
                  </tr>
                  <tr>
                    <td className="text-end">{formatNumberIST(totals.mainQty)}</td>
                    <td className="text-end">{formatNumberIST(totals.taxableAct)}</td>
                    <td className="text-end">{formatNumberIST(totals.dis)}</td>
                    <td className="text-end">{formatNumberIST(totals.sgst)}</td>
                    <td className="text-end">{formatNumberIST(totals.cgst)}</td>
                    <td className="text-end">{formatNumberIST(totals.igst)}</td>
                    <td className="text-end">{formatNumberIST(totals.othChg)}</td>
                    <td className="text-end">{formatNumberIST(totals.net)}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </FormNavigator>
      </CommonCard>

      <CommonModal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        title="Date Filter"
        size="lg"
      >
        <FormNavigator onSubmit={handleSubmit(handleFilterSubmit)}>
          <Row className="mb-3">
            <Col xs={12}>
              <CustomDateInputBox
                label="From Date"
                name="fromDate"
                validationRules={{ required: 'Date is required.' }}
                register={register}
                setValue={setValue}
                financialYear={financialYear}
                //defaultDate={financialYear}
              />
            </Col>
            <Col xs={12} className="mt-2">
              <CustomDateInputBox
                label="To Date"
                name="toDate"
                validationRules={{ required: 'Date is required.' }}
                register={register}
                setValue={setValue}
                financialYear={financialYear}
                //defaultDate={financialYear}
              />
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2">
            <CustomButton
              text="OK"
              type="submit"
            />
             <CustomButton
              text="Close"
              variant="secondary"
              onClick={() => setShowFilterModal(false)}
            />
          </div>
        </FormNavigator>
      </CommonModal>

      {selectedVoucher && (
        <CommonModal
          show={showVoucherModal}
          onHide={handleCloseModal}
          size="xl"
        >
          {renderVoucherForm(selectedVoucher.voucherTypeId, selectedVoucher.voucherId)}
        </CommonModal>
      )}
    </>
  );
};

export default PurchaseRegister;