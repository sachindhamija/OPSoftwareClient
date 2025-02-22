import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../layout/App';
import Register from '../../features/UserAccount/Register';
import Login from '../../features/UserAccount/Login';
import Companies from '../../features/Masters/Company/SelectCompany';
import ServerError from '../errors/ServerError';
import NotFound from '../errors/NotFound';
import RequireAuth from './RequireAuth';
import CreateCompany from '../../features/Masters/Company/CompanyForm';
import ForgotPassword from '../../features/UserAccount/ForgotPassword';
import ResetPassword from '../../features/UserAccount/ResetPassword';
import Dashboard from '../../features/Masters/Dashboard/Dashboard';
import FinancialYearForm from '../../features/Masters/FinancialYear/FinancialYearForm';
import AccountGroupForm from '../../features/Masters/AccountGroup/AccountGroupForm';
import CityForm from '../../features/Masters/City/CityForm';
import ItemUnitForm from '../../features/Masters/ItemUnit/ItemUnitForm';
import GSTSlabForm from '../../features/Masters/GSTSlab/GSTSlabForm';
import AccountForm from '../../features/Masters/Account/AccountForm';
import AccountList from '../../features/Masters/Account/AccountList';
import ItemCompanyForm from '../../features/Masters/ItemCompany/ItemCompanyForm';
import ItemCategoryForm from '../../features/Masters/ItemCategory/ItemCategoryForm';
import ItemGodownForm from '../../features/Masters/ItemGodown/ItemGodownForm';
import ItemForm from '../../features/Masters/Item/ItemForm';
import ItemList from '../../features/Masters/Item/ItemList';
import PaymentAndReceiptForm from '../../features/Vouchers/VoucherCommon/PaymentAndReceiptForm';
import JournalEntryForm from '../../features/Vouchers/JournalEntry/JournalEntryForm';
import BankEntryForm from '../../features/Vouchers/BankEntry/BankEntryForm';
import LedgerReport from '../../features/Reports/Ledger/LedgerReport';
import { VoucherTypeEnum } from '../../features/Vouchers/VoucherCommon/voucherTypeEnum';
import TrialBalanceReport from '../../features/Reports/TrialBalance/TrialBalanceReport';
import BillBookForm from '../../features/Masters/BillBook/SaleBillBookForm';
import { SalePurchaseForm } from '../../features/Vouchers/SalesPurchaseCommonVouchers/CommonForm';
import SerialNumberSetting from '../../features/Masters/SerialNumberSetting/SerialNumberSetting';
import AdditionalFieldSetting from '../../features/Masters/AdditionalFieldsSetting/AdditionalFieldSetting';
import IJForm from '../../features/CommissionAgent/IJForm/IJForm';
import MandiForm from '../../features/CommissionAgent/Mandi/MandiForm';
import CommissionAgentItemForm from '../../features/CommissionAgent/CommissionAgentItem/CommissionAgentItemForm';
import InvoiceReport from '../../features/Reports/ReportViewer/InvoiceReport';
import PasswordSetting from '../../features/Masters/Password/Password';
import { PrintInvoicePage } from '../../features/Vouchers/SalesPurchaseCommonVouchers/PrintInvoicePage';
import CreditSaleEntry from '../../features/Vouchers/CreditSaleEntry/CreditSaleEntry';
import ItemShortageEntry from '../../features/Vouchers/ItemShortageEntry/ItemShortageEntry';
import ItemStockTransfer from '../../features/Vouchers/ItemStockTransfer/ItemStockTransfer';
// import StudentAdmission from '../../features/School/StudentAdmission/StudentAdmission';
import StudentList from '../../features/School/StudentList/StudentList';
//import FeePlan from '../../features/Masters/FeePlan/FeePlan';
import ClassForm from '../../features/School/Class/classForm';
import SectionForm from '../../features/School/Section/sectionForm';
import SchoolCategoryForm from '../../features/School/SchoolCategory/schoolCategoryForm';
import FeeHeadingForm from '../../features/School/FeeHeading/feeHeadingForm';
import FeePlanForm from '../../features/School/FeePlan/FeePlanForm';
import SaleRegister from '../../features/Reports/SaleRegister/SaleRegister';
import PurchaseRegister from '../../features/Reports/PurchaseRegister/PurchaseRegister';
import SaleReturnRegister from '../../features/Reports/SaleReturnRegister/SaleReturnRegister';
import PurchaseReturnRegister from '../../features/Reports/PurchaseReturnRegister/PurchaseReturnRegister';
import CreditNoteRegister from '../../features/Reports/CreditNoteRegister/CreditNoteRegister';
import DebitNoteRegister from '../../features/Reports/DebitNoteRegister/DebitNoteRegister';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ path: 'login', element: <Login /> },
			{ path: 'register', element: <Register /> },
			{ path: 'reset-password', element: <ResetPassword /> },
			{ path: 'forgot-password', element: <ForgotPassword /> },
			{ path: 'server-error', element: <ServerError /> },
			{ path: 'not-found', element: <NotFound /> },
			{
				path: '/',
				element: <RequireAuth />,
				children: [
					{
						path: '/',
						element: <Navigate to="/select-company" replace />,
					},
					{ path: 'select-company', element: <Companies /> },
					{ path: 'create-company', element: <CreateCompany /> },
					{ path: 'edit-company', element: <CreateCompany /> },
					{ path: 'dashboard', element: <Dashboard /> },
					{ path: 'add-financial-year', element: <FinancialYearForm />, },
					{ path: 'edit-financial-year', element: <FinancialYearForm />, },
					{ path: 'account-group', element: <AccountGroupForm /> },
					{ path: 'city', element: <CityForm /> },
					{ path: 'item-unit', element: <ItemUnitForm /> },
					{ path: 'gst-slab', element: <GSTSlabForm /> },
					{ path: 'account', element: <AccountForm /> },
					{
						path: 'account/edit/:accountId',
						element: <AccountForm />,
					},
					{ path: 'account-list', element: <AccountList /> },
					{ path: 'item-company', element: <ItemCompanyForm /> },
					{ path: 'item-category', element: <ItemCategoryForm /> },
					{ path: 'item-godown', element: <ItemGodownForm /> },
					{ path: 'item', element: <ItemForm /> },
					{ path: 'item-list', element: <ItemList /> },
					{ path: 'item/edit/:itemID', element: <ItemForm /> },
					{
						path: 'Voucher/Payment',
						element: (
							<PaymentAndReceiptForm
								voucherType={VoucherTypeEnum.Payment}
							/>
						),
					},
					{
						path: 'Voucher/Receipt',
						element: (
							<PaymentAndReceiptForm
								voucherType={VoucherTypeEnum.Receipt}
							/>
						),
					},
					{ path: 'Voucher/BankEntry', element: <BankEntryForm /> },
					{
						path: 'Voucher/JournalEntry',
						element: <JournalEntryForm />,
					},
					{
						path: 'Voucher/Sale',
						element: (
							<SalePurchaseForm
								voucherType={VoucherTypeEnum.ItemSale}
							/>
						),
					},
					{
						path: 'Voucher/Purchase',
						element: (
							<SalePurchaseForm
								voucherType={VoucherTypeEnum.ItemPurchase}
							/>
						),
					},
					{
						path: 'Voucher/SalesReturn',
						element: (
							<SalePurchaseForm
								voucherType={VoucherTypeEnum.SalesReturn}
							/>
						),
					},
					{
						path: 'Voucher/PurchaseReturn',
						element: (
							<SalePurchaseForm
								voucherType={VoucherTypeEnum.PurchaseReturn}
							/>
						),
					},
					{
						path: 'Voucher/DebitNote',
						element: (
							<SalePurchaseForm
								voucherType={VoucherTypeEnum.DebitNote}
							/>
						),
					},
					{
						path: 'Voucher/CreditNote',
						element: (
							<SalePurchaseForm
								voucherType={VoucherTypeEnum.CreditNote}
							/>
						),
					},
					{ path: 'Voucher/CreditSaleEntry', element: <CreditSaleEntry /> },
					{ path: 'Voucher/StockShortageEntry', element: <ItemShortageEntry /> },
					{ path: 'Voucher/ItemStockTransfer', element: <ItemStockTransfer /> },
					{ path: 'Report/Ledger', element: <LedgerReport /> },
					{ path: 'Report/SaleRegister', element: <SaleRegister /> },
					{ path: 'Report/PurchaseRegister', element: <PurchaseRegister /> },
					{ path: 'Report/SaleReturnRegister', element: <SaleReturnRegister /> },
					{ path: 'Report/PurchaseReturnRegister', element: <PurchaseReturnRegister /> },
					{ path: 'Report/CreditNoteRegister', element: <CreditNoteRegister /> },
					{ path: 'Report/DebitNoteRegister', element: <DebitNoteRegister /> },
					{
						path: 'Report/TrialBalance',
						element: <TrialBalanceReport />,
					},
					{ path: 'sale-billbook', element: <BillBookForm /> },
					{ path: 'serial-number-setting', element: <SerialNumberSetting /> },
					{ path: 'additional-fields-setting', element: <AdditionalFieldSetting /> },
					{ path: 'IJForm', element: <IJForm /> },
					{ path: 'mandi', element: <MandiForm /> },
					{ path: 'commissionagent-item', element: <CommissionAgentItemForm /> },
					{ path: 'report/invoice-report-item', element: <InvoiceReport /> },
					{ path: 'Password-Delete-Update', element: <PasswordSetting /> },
					{
						path: 'Voucher/Sale/print-invoice',
						element: (
							<PrintInvoicePage
							/>
						),
					},
//					{ path: 'student-admission', element: <StudentAdmission /> },
					{ path: 'student-list', element: <StudentList /> },
					{ path: 'fee-plan', element: <FeePlanForm /> },
					{ path: 'school-class', element: <ClassForm /> },
					{ path: 'school-section', element: <SectionForm /> },
					{ path: 'school-category', element: <SchoolCategoryForm /> },
					{ path: 'school-feeheading', element: <FeeHeadingForm /> },

				],
			},
			{ path: '*', element: <Navigate replace to="/not-found" /> },
		],
	},
]);
