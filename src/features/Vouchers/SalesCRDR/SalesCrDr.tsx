import { useState, useEffect } from "react";
import { Form, Row, Col, Table, Button, Modal } from "react-bootstrap";
import { CommonCard } from "../../../app/components/Components";


// Dummy data for suppliers
const DummySuppliers = [
  {
    id: 1,
    name: "Supplier A",
    billNo: "001",
    date: "2024-08-18",
    amount: 1000,
    received: 500,
    receivable: 500,
    balance: 0,
  },
  {
    id: 2,
    name: "Supplier B",
    billNo: "002",
    date: "2024-08-19",
    amount: 2000,
    received: 1500,
    receivable: 500,
    balance: 0,
  },
  {
    id: 3,
    name: "Supplier C",
    billNo: "003",
    date: "2024-08-20",
    amount: 3000,
    received: 1000,
    receivable: 2000,
    balance: 0,
  },
];

// Payment modes data
const paymentModes = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit" },
  { value: "cheque", label: "Cheque" },
];

// Default supplier object
const defaultSupplier = {
  id: 0,
  name: "",
  billNo: "",
  date: "",
  amount: 0,
  received: 0,
  receivable: 0,
  balance: 0,
};

type Supplier = typeof defaultSupplier;

const SalesCrDr = () => {
  // State for selected supplier
  const [, setSelectedSupplier] = useState<Supplier | null>(null);

  // State for main table suppliers
  const [mainTableSuppliers, setMainTableSuppliers] = useState<Supplier[]>([]);

  // State for selected checkboxes
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<number[]>([]);

  // State for modal visibility
  const [showModal, setShowModal] = useState(false);

  // State for bill number
  const [billNumber, setBillNumber] = useState("");

  // State for filtered suppliers based on bill number
  const [filteredSuppliers, setFilteredSuppliers] =
    useState<Supplier[]>(DummySuppliers);

  // Update filtered suppliers based on bill number
  useEffect(() => {
    if (billNumber.trim() === "") {
      setFilteredSuppliers(DummySuppliers);
    } else {
      setFilteredSuppliers(
        DummySuppliers.filter((supplier) =>
          supplier.billNo.includes(billNumber)
        )
      );
    }
  }, [billNumber]);

  const getTotal = (field: keyof Supplier) =>
    mainTableSuppliers.reduce((acc, curr) => acc + Number(curr[field]), 0);

  // Handle bill number change
  const handleBillNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillNumber(e.target.value);
  };

  // Handle supplier selection
  const handleSupplierChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const supplier = DummySuppliers.find(
      (s) => s.id === parseInt(event.target.value)
    );
    setSelectedSupplier(supplier || defaultSupplier);
    setShowModal(true); // Open modal when a supplier is selected
  };

  // Handle checkbox selection
  const handleCheckboxChange = (supplierId: number) => {
    setSelectedCheckboxes((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  // Handle Add button click
  const handleAddClick = () => {
    const selected = DummySuppliers.filter((s) =>
      selectedCheckboxes.includes(s.id)
    );
    setMainTableSuppliers((prev) => [...prev, ...selected]);
    setSelectedCheckboxes([]); // Clear selected checkboxes
    setSelectedSupplier(null); // Clear selected supplier
    setShowModal(false); // Close modal
  };

  return (
    <>
      <CommonCard header="Sales CR/DR" size="100%">
        <Form>
          <Row className="mb-3">
            <Col md={2}>
              <Form.Group controlId="formBillBookNumber">
                <Form.Label>Bill Book Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Bill Book Number"
                  value={billNumber}
                  onChange={handleBillNumberChange}
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="formPaymentMode">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Control as="select">
                  {paymentModes.map((mode, index) => (
                    <option key={index} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="formDate">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="formSupplier">
                <Form.Label>Supplier</Form.Label>
                <Form.Control as="select" onChange={handleSupplierChange}>
                  <option value="">Select Supplier</option>
                  {filteredSuppliers.map((supplier, index) => (
                    <option key={index} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        </Form>

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <Table bordered hover className="mt-4">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Bill No.</th>
                <th>Party Name</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Received</th>
                <th>Receivable</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {mainTableSuppliers.map((supplier, index) => (
                <tr key={supplier.id}>
                  <td>{index + 1}</td>
                  <td>{supplier.billNo}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.date}</td>
                  <td>{supplier.amount}</td>
                  <td>{supplier.received}</td>
                  <td>
                    <input type="number" value={supplier.receivable} />
                  </td>
                  <td>{supplier.balance}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>


        {/* Modal for displaying supplier table */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Supplier Selection</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>S.No</th>
                  <th>Bill No.</th>
                  <th>Party Name</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Received</th>
                  <th>Receivable</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td style={{ textAlign: "center" }}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedCheckboxes.includes(supplier.id)}
                        onChange={() => handleCheckboxChange(supplier.id)}
                      />
                    </td>
                    <td>{supplier.id}</td>
                    <td>{supplier.billNo}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.date}</td>
                    <td>{supplier.amount}</td>
                    <td>{supplier.received}</td>
                    <td>{supplier.receivable}</td>
                    <td>{supplier.balance}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAddClick}>
              Add Selected
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Footer Table */}
        <div className="form-footer">
          <div className="remarks-and-actions">
            {/* Add any remarks or actions here */}
          </div>
          <div className="bill-summary">
            <table>
              <thead>
                <tr>
                  <th className="custom-col-billBook">Sub Total</th>
                  <th className="custom-col-reduced">Total</th>
                  <th className="custom-col-date">Paid</th>
                  <th className="custom-col-date">Current Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{getTotal("amount") - getTotal("received")}</td>
                  <td>{getTotal("amount")}</td>
                  <td>{getTotal("received")}</td>
                  <td>{getTotal("amount") - getTotal("received")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CommonCard>
    </>
  );
};

export default SalesCrDr;
