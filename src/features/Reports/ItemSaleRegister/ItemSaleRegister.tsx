import CommonCard from '../../../app/components/CommonCard';
import FormNavigator from '../../../app/components/FormNavigator';
import { Col, Row, Table } from 'react-bootstrap';
import {
  CustomButton,
  CustomDateInputBox,
} from '../../../app/components/Components';
import { useAppSelector } from '../../../app/store/configureStore';
import { selectCurrentFinancialYear } from '../../Masters/FinancialYear/financialYearSlice';
import { FieldValues, useForm } from 'react-hook-form';
import { formatDateForBackend, formatDateForFrontend } from '../../../app/utils/dateUtils';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { formatNumberIST } from '../../../app/utils/numberUtils';
import getLastVoucherDate from '../../../app/hooks/useLastVoucherDate';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';
import agent from '../../../app/api/agent';

export interface ItemSaleRegisterDto {
  date: Date;
  billNo: string;
  cashMode: string;
  name: string;
  gstin: string;
  mainQty: number;
  taxableAct: number;
  dis: number;
  sgst: number;
  cgst: number;
  igst: number;
  othChg: number;
  net: number;
}

interface ItemSaleRegisterProps {
  isInModal?: boolean;
  onSuccessfulSubmit?: () => void;
}

const ItemSaleRegister = ({ isInModal = false }: ItemSaleRegisterProps) => {
  const accessId = getAccessIdOrRedirect();
  const financialYear = useAppSelector(selectCurrentFinancialYear);
  const [itemSaleRegisterEntries, setItemSaleRegisterEntries] = useState<ItemSaleRegisterDto[]>([]);
  const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);

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

  useEffect(() => {
    if (accessId && financialYear && !isInModal) {
      getLastVoucherDate(accessId, null, financialYear)
        .then((date) => setLastVoucherDate(date))
        .catch((error) => {
          console.error('Error fetching last voucher date:', error);
          toast.error('Failed to fetch last voucher date.');
        });
    }
  }, [accessId, financialYear]);

  const { register, handleSubmit, setValue } = useForm<FieldValues>({ mode: 'all' });

  const fetchItemSaleRegisterData = async (fromDate: string, toDate: string) => {
    try {
      if (!financialYear?.financialYearFrom) {
        toast.error('Select financial year.');
        return;
      }
  
      const response = await agent.Reports.ItemSaleRegister(
        accessId,
        formatDateForBackend(fromDate),
        formatDateForBackend(toDate),
        formatDateForBackend(financialYear.financialYearFrom.toString())
      );
  console.log("response")
  console.log(response)
      // Calculate totals
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
  
      setItemSaleRegisterEntries(response);
      setTotals(newTotals);
  
    } catch (error) {
      toast.error('Failed to fetch item sale register data.');
      console.error(error);
    }
  };
  

  const onSubmit = async (data: FieldValues) => {
    await fetchItemSaleRegisterData(data.fromDate, data.toDate);
  };

  return (
    <CommonCard header="Item Sale Register" size="100%">
      <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isInModal}>
        <Row>
          <Col xs={12} md={2}>
            <CustomDateInputBox
              label="From Date"
              name="fromDate"
              validationRules={{ required: 'Date is required.' }}
              register={register}
              setValue={setValue}
              financialYear={financialYear}
              defaultDate={financialYear?.financialYearFrom}
            />
          </Col>
          <Col xs={12} md={2}>
            <CustomDateInputBox
              label="To Date"
              name="toDate"
              validationRules={{ required: 'Date is required.' }}
              register={register}
              setValue={setValue}
              financialYear={financialYear}
              defaultDate={lastVoucherDate}
            />
          </Col>
          <Col xs={2} md={2} className="d-flex align-items-end justify-content-left mt-2">
            <CustomButton text="Show" type="submit" className="mb-2 w-100" />
          </Col>
        </Row>

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
                {itemSaleRegisterEntries.map((entry, index) => (
                  <tr key={index}>
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
  );
};

export default ItemSaleRegister;




























// import CommonCard from '../../../app/components/CommonCard';
// import FormNavigator from '../../../app/components/FormNavigator';
// import { Col, Row, Table } from 'react-bootstrap';
// import {
// 	CustomButton,
// 	CustomDateInputBox,
// } from '../../../app/components/Components';
// import { useAppSelector } from '../../../app/store/configureStore';
// import { selectCurrentFinancialYear } from '../../Masters/FinancialYear/financialYearSlice';
// import { FieldValues, useForm } from 'react-hook-form';
// import {
// 	formatDateForFrontend,
// } from '../../../app/utils/dateUtils';
// import toast from 'react-hot-toast';
// import { useEffect, useState } from 'react';
// import { formatNumberIST } from '../../../app/utils/numberUtils';
// import {
// 	VoucherTypeEnum,
// 	getVoucherTypeString,
// } from '../../Vouchers/VoucherCommon/voucherTypeEnum';
// import getLastVoucherDate from '../../../app/hooks/useLastVoucherDate';
// import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';

// export interface ItemSaleRegisterDto {
// 	voucherId: string;
// 	voucherTypeId: number;
// 	voucherPrefix: string;
// 	voucherNumber: string;
// 	voucherDate: Date;
// 	accountName: string;
// 	debitAmount: number;
// 	creditAmount: number;
// 	remarks: string;
// }
// export interface ItemSaleRegisterParams {
// 	fromDate: Date;
// 	toDate: Date;
// }

// interface ItemSaleRegisterProps {
// 	isInModal?: boolean;
// 	onSuccessfulSubmit?: () => void;
// 	itemSaleRegisterParams?: ItemSaleRegisterParams | null;
// }

// const ItemSaleRegister = ({
// 	isInModal = false,
// 	itemSaleRegisterParams = null,
// }: ItemSaleRegisterProps) => {
// 	const accessId = getAccessIdOrRedirect();
// 	const financialYear = useAppSelector(selectCurrentFinancialYear);
// 	const [itemSaleRegisterEntries, setItemSaleRegisterEntries] = useState<ItemSaleRegisterDto[]>([]);
// 	const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);


// 	// const [fromDate, setFromDate] = useState('');
// 	// const [toDate, setToDate] = useState('');

// 	const [openingBalance, setOpeningBalance] = useState(0);
// 	const [debitTotal, setDebitTotal] = useState(0);
// 	const [creditTotal, setCreditTotal] = useState(0);
// 	const [finalBalance, setFinalBalance] = useState(0);

// 	useEffect(() => {
// 		if (accessId && financialYear && !isInModal) {
// 			getLastVoucherDate(accessId, null, financialYear)
// 				.then((date) => {
// 					setLastVoucherDate(date);
// 				})
// 				.catch((error) => {
// 					console.error('Error fetching last voucher date:', error);
// 					toast.error('Failed to fetch last voucher date.');
// 				});
// 		}
// 	}, [accessId, financialYear]);

// 	const {
// 		register,
// 		handleSubmit,
// 		setValue,
// 		formState: { isSubmitting },
// 	} = useForm<FieldValues>({
// 		mode: 'all',
// 	});

// 	const fetchItemSaleRegisterData = async (
// 		fromDate: string,
// 		toDate: string
// 	) => {
// 		try {
// 			if (financialYear?.financialYearFrom == undefined) {
// 				toast.error('Select financial year.');
// 				return null;
// 			}

// 			//setItemSaleRegisterEntries(response);

// 		} catch (error) {
// 			toast.error('Failed to fetch ItemSale Register report.');
// 			console.error(error);
// 		}
// 	};
// 	const onSubmit = async (data: FieldValues) => {
// 		await fetchItemSaleRegisterData(data.fromDate, data.toDate);
// 	};

// 	useEffect(() => {
// 		const getItemSaleRegisterReportFromTrialBalance = async () => {
// 			if (itemSaleRegisterParams != null && isInModal) {
// 				setLastVoucherDate(itemSaleRegisterParams.toDate);

// 				await fetchItemSaleRegisterData(
// 					itemSaleRegisterParams.fromDate.toString(),
// 					itemSaleRegisterParams.toDate.toString()
// 				);
// 			}
// 		};
// 		getItemSaleRegisterReportFromTrialBalance();
// 	}, [accessId]);

//     useEffect(() => {
// 		let tempDebitTotal = 0;
// 		let tempCreditTotal = 0;
// 		itemSaleRegisterEntries.forEach((entry, index) => {
// 			tempDebitTotal += entry.debitAmount;
// 			tempCreditTotal += entry.creditAmount;
// 			if (index === 0) {
// 				if (entry.voucherTypeId == 7)
// 					setOpeningBalance(entry.debitAmount - entry.creditAmount);
// 			}
// 		});
// 		setDebitTotal(tempDebitTotal);
// 		setCreditTotal(tempCreditTotal);
// 		setFinalBalance(tempDebitTotal - tempCreditTotal);
// 	}, [itemSaleRegisterEntries]);

// 	const calculateRunningBalanceLabel = (currentTotal: number): string => {
// 		return currentTotal > 0
// 			? `${formatNumberIST(Math.abs(currentTotal))} DR`
// 			: currentTotal < 0
// 				? `${formatNumberIST(Math.abs(currentTotal))} CR`
// 				: 'NIL';
// 	};


// 	return (
// 		<>
// 			<CommonCard header="ItemSale Register" size="100%">
// 				<FormNavigator
// 					onSubmit={handleSubmit(onSubmit)}
// 					isModalOpen={isInModal}
// 				>
// 					<Row>
// 						<Col xs={12} md={2}>
// 							<CustomDateInputBox
// 								autoFocus
// 								label="From Date"
// 								name="fromDate"
// 								validationRules={{
// 									required: 'Date is required.',
// 								}}
// 								register={register}
// 								setValue={setValue}
// 								financialYear={financialYear}
// 								defaultDate={financialYear?.financialYearFrom}
// 							/>
// 						</Col>
// 						<Col xs={12} md={2}>
// 							<CustomDateInputBox
// 								autoFocus
// 								label="To Date"
// 								name="toDate"
// 								validationRules={{
// 									required: 'Date is required.',
// 								}}
// 								register={register}
// 								setValue={setValue}
// 								financialYear={financialYear}
// 								defaultDate={lastVoucherDate}
// 							/>
// 						</Col>
// 						<Col
// 							xs={2}
// 							md={2}
// 							className="d-flex align-items-end justify-content-left mt-2"
// 						>
// 							<CustomButton
// 								text="Show"
// 								type="submit"
// 								className="mb-2 w-100"
// 								isSubmitting={isSubmitting}
// 							/>
// 						</Col>
// 					</Row>
// 					<Row>
// 						<div className="custom-table-container">
// 							<Table
// 								striped
// 								bordered
// 								hover
// 								className="mt-3 custom-table"
// 							>
// 								<thead>
// 									<tr>
// 										<th style={{ width: '10%' }}>Date</th>
// 										<th style={{ width: '10%' }}>Type</th>
// 										<th style={{ width: '10%' }}>
// 											Voucher No.
// 										</th>
// 										<th style={{ width: '20%' }}>
// 											Account
// 										</th>
// 										<th style={{ width: '20%' }}>
// 											Remarks
// 										</th>
// 										<th
// 											style={{
// 												width: '10%',
// 												textAlign: 'right',
// 											}}
// 										>
// 											Debit (DR)
// 										</th>
// 										<th
// 											style={{
// 												width: '10%',
// 												textAlign: 'right',
// 											}}
// 										>
// 											Credit (CR)
// 										</th>
// 										<th
// 											style={{
// 												width: '20%',
// 												textAlign: 'right',
// 											}}
// 										>
// 											Balance
// 										</th>
// 									</tr>
// 								</thead>
// 								<tbody>
// 									{(() => {
// 										let runningTotal = 0;
// 										return itemSaleRegisterEntries.map(
// 											(entry, index) => {
// 												runningTotal +=
// 													entry.debitAmount -
// 													entry.creditAmount;
// 												const voucherTypeString =
// 													getVoucherTypeString(
// 														entry.voucherTypeId as VoucherTypeEnum
// 													);
// 												return (
// 													<tr
// 														key={index}
// 													>
// 														<td>
// 															{formatDateForFrontend(
// 																entry.voucherDate
// 															)}
// 														</td>
// 														<td>
// 															{voucherTypeString}
// 														</td>
// 														<td>
// 															{entry.voucherPrefix?.toString()}
// 															{entry.voucherNumber?.toString()}
// 														</td>
// 														<td>
// 															{entry.accountName}
// 														</td>
// 														<td>{entry.remarks}</td>
// 														<td
// 															style={{
// 																textAlign:
// 																	'right',
// 															}}
// 														>
// 															{entry.debitAmount >
// 																0
// 																? formatNumberIST(
// 																	entry.debitAmount
// 																)
// 																: ''}
// 														</td>
// 														<td
// 															style={{
// 																textAlign:
// 																	'right',
// 															}}
// 														>
// 															{entry.creditAmount >
// 																0
// 																? formatNumberIST(
// 																	entry.creditAmount
// 																)
// 																: ''}
// 														</td>
// 														<td
// 															style={{
// 																textAlign:
// 																	'right',
// 															}}
// 														>
// 															{calculateRunningBalanceLabel(
// 																runningTotal
// 															)}
// 														</td>
// 													</tr>
// 												);
// 											}
// 										);
// 									})()}
// 								</tbody>
// 							</Table>
// 						</div>
// 					</Row>
// 					<Row className="justify-content-end mt-3">
// 						<Col xs="auto">
// 							<Table bordered hover className="custom-table">
// 								<tbody>
// 									<tr>
// 										<td>Opening Balance</td>
// 										<td>Debit Total</td>
// 										<td>Credit Total</td>
// 										<td>Closing Balance</td>
// 									</tr>
// 									<tr>
// 										<td className="text-end">
// 											{openingBalance !== 0
// 												? calculateRunningBalanceLabel(
// 													openingBalance
// 												)
// 												: ''}
// 										</td>
// 										<td className="text-end">
// 											{formatNumberIST(debitTotal)} DR
// 										</td>
// 										<td className="text-end">
// 											{formatNumberIST(creditTotal)} CR
// 										</td>
// 										<td className="text-end">
// 											{calculateRunningBalanceLabel(
// 												finalBalance
// 											)}
// 										</td>
// 									</tr>
// 								</tbody>
// 							</Table>
// 						</Col>
// 					</Row>
// 				</FormNavigator>
// 			</CommonCard>
			
// 		</>
// 	);
// };

// export default ItemSaleRegister;
