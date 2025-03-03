import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import agent from "../api/agent";
import CustomButton from "../components/CustomButton";
import Dropdown from "react-bootstrap/esm/Dropdown";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import {
  clearCurrentFinancialYear,
  getCurrentFinancialYear,
  updateAndFetchCurrentFinancialYear,
} from "../../features/Masters/FinancialYear/financialYearSlice";
import { toCustomDateFormat } from "../utils/dateUtils";
import { Button, Container, DropdownDivider } from "react-bootstrap";
import {
  deleteStoredCompanyInformation,
  getAccessIdOrRedirect,
  getCompanyInformationOrRedirect,
} from "../../features/Masters/Company/CompanyInformation";
import { FinancialYearDto } from "../../features/Masters/FinancialYear/financialYearDto";
import { CommonModal } from "../components/Components";
import FinancialYearForm from "../../features/Masters/FinancialYear/FinancialYearForm";
import "./Header.scss";

function CompanyHeader() {
  const [companyName, setCompanyName] = useState("");
  const navigate = useNavigate();
  const accessId = getAccessIdOrRedirect();
  const dispatch = useAppDispatch();
  const [allFinancialYears, setAllFinancialYears] = useState<
    FinancialYearDto[]
  >([]);
  const [showFYYearModal, setShowFYYearModal] = useState(false);
  const { currentFinancialYear } = useAppSelector(
    (state) => state.financialYear
  );

  // Inside your functional component
  const [showMastersDropdown, setShowMastersDropdown] = useState(false);
  const [showVouchersDropdown, setShowVouchersDropdown] = useState(false);
  const [showReportsDropdown, setShowReportsDropdown] = useState(false);
  const [showCommissionAgentDropdown, setShowCommissionAgentDropdown] =
    useState(false);

  // Event handlers to toggle dropdown visibility
  const handleMastersDropdownHover = () => setShowMastersDropdown(true);
  const handleMastersDropdownLeave = () => setShowMastersDropdown(false);

  const handleVouchersDropdownHover = () => setShowVouchersDropdown(true);
  const handleVouchersDropdownLeave = () => setShowVouchersDropdown(false);

  const handleReportsDropdownHover = () => setShowReportsDropdown(true);
  const handleReportsDropdownLeave = () => setShowReportsDropdown(false);

  const handleCommissionAgentDropdownHover = () =>
    setShowCommissionAgentDropdown(true);
  const handleCommissionAgentDropdownLeave = () =>
    setShowCommissionAgentDropdown(false);

  const formatCompanyName = (name: string) => {
    if (name.length > 50) {
      const words = name.split(" ");
      return words.length >= 2 ? words[0] + " " + words[1] : name;
    }
    return name;
  };
  useEffect(() => {
    if (!accessId) {
      return;
    }
    const getCompanyDetails = async () => {
      try {
        const response = await agent.Company.getCompanyName(accessId);
        setCompanyName(formatCompanyName(response));
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };
    getCompanyDetails();
  }, [accessId]);


    var companyinfo = getCompanyInformationOrRedirect();
  
  useEffect(() => {
    if (!currentFinancialYear) {
      dispatch(getCurrentFinancialYear());
    }
  }, [accessId]);

  async function getAllFinancialYears() {
    try {
      const response = await agent.FinancialYear.getAllFinancialYears(accessId);
      setAllFinancialYears(response);
    } catch (error) {
      console.error("Error fetching all financial years:", error);
    }
  }
  useEffect(() => {
    getAllFinancialYears();
  }, [accessId]);

  const handleExitCompany = () => {
    deleteStoredCompanyInformation();
    dispatch(clearCurrentFinancialYear());
    navigate("/select-company");
  };

  const handleSelectFinancialYear = (newFinancialYear: Date) => {
    dispatch(updateAndFetchCurrentFinancialYear(newFinancialYear));
  };

  const isCurrentFinancialYear = (financialYear: FinancialYearDto) => {
    return (
      currentFinancialYear &&
      financialYear.financialYearFrom === currentFinancialYear.financialYearFrom
    );
  };
  const handleEditFinancialYear = (financialYear: FinancialYearDto) => {
    navigate("/edit-financial-year", { state: { financialYear } });
  };

  return (
    <Container className="d-flex justify-content-between align-items-center header-container">
      <Nav className="flex-grow-1 align-items-center">
        <Nav.Link className="nav-item" as={Link} to={`/dashboard/${accessId}`}>
          <CustomButton size="sm" variant="success" text={companyName} />
        </Nav.Link>
        <Dropdown as="div" className="dropdown-on-hover">
          <Dropdown.Toggle
            as={Nav.Link}
            id="dropdown-autoclose-true"
            className="dropdown-toggle"
            onMouseEnter={handleMastersDropdownHover}
            onMouseLeave={handleMastersDropdownLeave}
          >
            Masters
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={`custom-dropdown-menu ${
              showMastersDropdown ? "" : "hidden"
            }`}
            onMouseEnter={handleMastersDropdownHover}
            onMouseLeave={handleMastersDropdownLeave}
          >
            <Dropdown.Item as={Link} to={"/account"}>
              Account
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/account-List"}>
              Account List
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/account-group"}>
              Account Group
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/city"}>
              City
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/item-company"}>
              Item Company
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/item-category"}>
              Item Category
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/item-godown"}>
              Item Godown
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/item-unit"}>
              Item Units
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/gst-slab"}>
              GST Slab
            </Dropdown.Item>
            <Dropdown.Divider />
            {companyinfo?.natureOfBusiness != "1" && (
            <Dropdown.Item as={Link} to={"/itemV2"}>
              New Item <span style={{ marginLeft: "100px" }}>[Ctrl+I]</span>
            </Dropdown.Item>
					  )}
            <Dropdown.Item as={Link} to={"/item"}>
              New Item <span style={{ marginLeft: "100px" }}>[Ctrl+I]</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/item-list"}>
              Item List <span style={{ marginLeft: "118px" }}>[Alt+I]</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/sale-billbook"}>
              Sale BillBook
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/batch"}>
               Batch
            </Dropdown.Item>
            <Dropdown.Divider />
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown as="div" className="dropdown-on-hover">
          <Dropdown.Toggle
            as={Nav.Link}
            id="dropdown-autoclose-true"
            className="dropdown-toggle"
            onMouseEnter={handleVouchersDropdownHover}
            onMouseLeave={handleVouchersDropdownLeave}
          >
            Vouchers
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={`custom-dropdown-menu ${
              showVouchersDropdown ? "" : "hidden"
            }`}
            onMouseEnter={handleVouchersDropdownHover}
            onMouseLeave={handleVouchersDropdownLeave}
          >
            <Dropdown.Item as={Link} to={"/Voucher/Payment"}>
              Payment <span style={{ marginLeft: "140px" }}>F5</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/Receipt"}>
              Receipt <span style={{ marginLeft: "150px" }}>F6</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/BankEntry"}>
              Bank Entry <span style={{ marginLeft: "120px" }}>F7</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/JournalEntry"}>
              Journal Entry <span style={{ marginLeft: "100px" }}>F8</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/CreditSaleEntry"}>
              Credit Sale Entry{" "}
              <span style={{ marginLeft: "60px" }}>Alt+C</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/StockShortageEntry"}>
              Stock Shortage Entry
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/ItemStockTransfer"}>
              Item Stock Transfer
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown as="div" className="dropdown-on-hover">
          <Dropdown.Toggle
            as={Nav.Link}
            id="dropdown-autoclose-true"
            className="dropdown-toggle"
            onMouseEnter={handleVouchersDropdownHover}
            onMouseLeave={handleVouchersDropdownLeave}
          >
            Sale/Pur
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={`custom-dropdown-menu ${
              showVouchersDropdown ? "" : "hidden"
            }`}
            onMouseEnter={handleVouchersDropdownHover}
            onMouseLeave={handleVouchersDropdownLeave}
          >
            <Dropdown.Item as={Link} to={"/Voucher/Sale"}>
              Sale Voucher <span style={{ marginLeft: "110px" }}>F9</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/Purchase"}>
              Purchase Voucher <span style={{ marginLeft: "60px" }}>F10</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/SalesReturn"}>
              Sales Return
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/PurchaseReturn"}>
              Purchase Return
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/DebitNote"}>
              Debit Note
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Voucher/CreditNote"}>
              Credit Note
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown as="div" className="dropdown-on-hover">
          <Dropdown.Toggle
            id="dropdown-autoclose-true"
            as={Nav.Link}
            className="dropdown-toggle"
            onMouseEnter={handleReportsDropdownHover}
            onMouseLeave={handleReportsDropdownLeave}
          >
            Reports
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={`custom-dropdown-menu ${
              showReportsDropdown ? "" : "hidden"
            }`}
            onMouseEnter={handleReportsDropdownHover}
            onMouseLeave={handleReportsDropdownLeave}
          >
            <Dropdown.Item as={Link} to={"/Report/Ledger"}>
              Ledger <span style={{ marginLeft: "120px" }}>[Ctrl+L]</span>
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/Report/SaleRegister"}>
            Sale Register
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/Report/PurchaseRegister"}>
            Purchase Register
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/Report/SaleReturnRegister"}>
            Sale Return Register
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/Report/PurchaseReturnRegister"}>
            Purchase Return Register
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/Report/CreditNoteRegister"}>
            Credit Note Register
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/Report/DebitNoteRegister"}>
            Debit Note Register
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Report/TrialBalance"}>
              Trial Balance <span style={{ marginLeft: "68px" }}>[Ctrl+G]</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Report/invoice-report-item"}>
              Invoice Report
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown as="div" className="dropdown-on-hover">
          <Dropdown.Toggle
            as={Nav.Link}
            id="dropdown-autoclose-true"
            className="dropdown-toggle"
            onMouseEnter={handleCommissionAgentDropdownHover}
            onMouseLeave={handleCommissionAgentDropdownLeave}
          >
            Commission Agent
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={`custom-dropdown-menu ${
              showCommissionAgentDropdown ? "" : "hidden"
            }`}
            onMouseEnter={handleCommissionAgentDropdownHover}
            onMouseLeave={handleCommissionAgentDropdownLeave}
          >
            <Dropdown.Item as={Link} to={"/IJForm"}>
              I-J Form <span style={{ marginLeft: "120px" }}>[Ctrl+J]</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/mandi"}>
              Mandi
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/commissionagent-item"}>
              Item
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown as="div" className="dropdown-on-hover">
          <Dropdown.Toggle
            id="dropdown-autoclose-true"
            as={Nav.Link}
            className="dropdown-toggle"
            onMouseEnter={handleReportsDropdownHover}
            onMouseLeave={handleReportsDropdownLeave}
          >
            Tools
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={`custom-dropdown-menu ${
              showReportsDropdown ? "" : "hidden"
            }`}
            onMouseEnter={handleReportsDropdownHover}
            onMouseLeave={handleReportsDropdownLeave}
          >
            <Dropdown.Item as={Link} to={"/serial-number-setting"}>
              Serial Number Setting
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/additional-fields-setting"}>
              Additional Fields Setting
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to={"/Password-Delete-Update"}>
              Password for Delete/Update
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown as="div" className="dropdown-on-hover">
          <Dropdown.Toggle
            as={Nav.Link}
            id="dropdown-autoclose-true"
            className="dropdown-toggle"
            onMouseEnter={() => setShowReportsDropdown(true)}
            onMouseLeave={() => setShowReportsDropdown(false)}
          >
            School
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={`custom-dropdown-menu ${
              showReportsDropdown ? "" : "hidden"
            }`}
            onMouseEnter={() => setShowReportsDropdown(true)}
            onMouseLeave={() => setShowReportsDropdown(false)}
          >
            <Dropdown.Item as={Link} to={"/student-admission"}>
              Student Admission
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/student-list"}>
              Student List
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/fee-plan"}>
              Fee Plan{" "}
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/school-class"}>
              Class/Course
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/school-section"}>
              Section Name
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/school-category"}>
              Category Name
            </Dropdown.Item>
            <Dropdown.Item as={Link} to={"/school-feeheading"}>
              Fee Heading
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav>

      <div>
        {currentFinancialYear &&
          currentFinancialYear.financialYearFrom &&
          currentFinancialYear.financialYearTo && (
            <Dropdown as="div" className="dropdown-on-hover">
              <Dropdown.Toggle
                id="dropdown-autoclose-true"
                className="btn btn-sm"
              >
                {new Date(currentFinancialYear.financialYearFrom).getFullYear()}{" "}
                - {new Date(currentFinancialYear.financialYearTo).getFullYear()}
              </Dropdown.Toggle>

              <Dropdown.Menu className="custom-dropdown-menu">
                {allFinancialYears.map(
                  (financialYear: FinancialYearDto, index) => {
                    const financialYearFrom = toCustomDateFormat(
                      new Date(financialYear.financialYearFrom)
                    );
                    const financialYearTo = financialYear.financialYearTo
                      ? toCustomDateFormat(
                          new Date(financialYear.financialYearTo)
                        )
                      : null;
                    const itemStyle = isCurrentFinancialYear(financialYear)
                      ? {
                          backgroundColor: "#f0f0f0 !important",
                          fontWeight: "bold !important",
                        }
                      : {};

                    return (
                      <Dropdown.Item
                        key={index}
                        style={itemStyle}
                        onClick={() =>
                          handleSelectFinancialYear(
                            new Date(financialYear.financialYearFrom)
                          )
                        }
                      >
                        {financialYearFrom}
                        {financialYearTo ? ` to ${financialYearTo}` : ""}
                        <Button
                          onClick={() => handleEditFinancialYear(financialYear)}
                          className="bi bi-pencil-square ms-2"
                          variant="none"
                          size="sm"
                          style={itemStyle}
                        />
                      </Dropdown.Item>
                    );
                  }
                )}
                <DropdownDivider />
                <div className="d-flex align-items-center justify-content-center ">
                  <Dropdown.Item onClick={() => setShowFYYearModal(true)}>
                    <div className="bi bi-plus-lg"> Add New</div>
                  </Dropdown.Item>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          )}
      </div>
      <CustomButton
        text="Exit Company"
        variant="outline-secondary"
        className="m-2"
        onClick={handleExitCompany}
      />
      <CommonModal
        show={showFYYearModal}
        onHide={() => {
          setShowFYYearModal(false);
        }}
        size="sm"
      >
        <Suspense fallback={<div>Loading...</div>}>
          <FinancialYearForm
            onSuccessfulSubmit={async () => {
              await getAllFinancialYears();
              setShowFYYearModal(false);
            }}
          />
        </Suspense>
      </CommonModal>
    </Container>
  );
}

export default CompanyHeader;
