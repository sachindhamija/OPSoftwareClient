
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CompanyHeader from './InvoiceHeader';
import CustomerInvoiceDetails from './CustomerInvoiceDetails';
import ItemDetails from './ItemDetails';
import TotalAndTaxes from './TotalAndTaxes';
import Footer from './Footer';
import React, { useRef } from 'react';
// const invoiceData = {
//   company: {
//     gstin: "03CDLPR3813C1ZU",
//     pan: "CDLPR3813C",
//     name: "M/S A.M. AGRO FOOD PRODUCTS",
//     address: "NEW GRAIN MARKET JALALABAD (W), PUNJAB-03",
//     contact: "97813-42605, 88725-42605",
//     email: "SAM9814549070@GMAIL.COM",
//     terms: "Credit"
//   },
//   invoice: {
//     number: "76",
//     date: "11-05-2023",
//     grNumber: "GR No.",
//     grDate: "GR Date.",
//     ewayNumber: "EWay No.",
//     ewayDate: "EWay Date",
//     vehicleNumber: "RJ45GA0029",
//     state: "PUNJAB-03",
//     transport: "TRANSPORT"
//   },
//   customer: {
//     name: "SRI SWAMI CHITRATH RICE MILLS",
//     address: "MANDI LADHUKA",
//     contact: "9217293242",
//     gstin: "03ABRFS3288G1ZT",
//     deliveryAt: "GLOBUS SPRITIS LTD VILLAGE SHYAMPUR TEHSIL BEHROR, ALWAR GST NO :(08AAACG2634B1Z6)"
//   },
//   items: [
//     {
//       description: "NAKKU",
//       hsn: "10064000",
//       unit: "QTL",
//       rate: 416.10,
//       quantity: 768.00,
//       discountPercentage: 0.00,
//       discountAmount: 0.00,
//       taxableAmount: 927903.00,
//       tax: 0.00,
//       sgst: 0.00,
//       cgst: 0.00,
//       total: 927903.00
//     },
//     {
//       description: "PHUCK 5%",
//       hsn: "10064000",
//       unit: "QTL",
//       rate: 180.00,
//       quantity: 180.00,
//       discountPercentage: 0.00,
//       discountAmount: 0.00,
//       taxableAmount: 30000.00,
//       tax: 5.00,
//       sgst: 750.00,
//       cgst: 750.00,
//       total: 31500.00
//     }
//   ],
//   totals: {
//     class: [
//       {
//         taxableAmount: 927903.00,
//         sgst: 0.00,
//         cgst: 0.00,
//         totalTax: 0.00,
//         totalAmount: 927903.00
//       },
//       {
//         taxableAmount: 30000.00,
//         sgst: 750.00,
//         cgst: 750.00,
//         totalTax: 1500.00,
//         totalAmount: 31500.00
//       }
//     ],
//     totalAmountBeforeTax: 957903.00,
//     sgst: 750.00,
//     cgst: 750.00,
//     totalTaxAmount: 1500.00,
//     billAmount: 959403.00
//   },
//   footer: {
//     terms: "1. We are not responsible for loss and damage occured by Transport in Transit, 2. Interst @18% will be charged if payment is not made within 7",
//     signatory: "Auth. Signatory",
//     company: "For M/S A.M. AGRO FOOD PRODUCTS",
//     page: "Page 1 of 1"
//   }
// };

const InvoiceReport: React.FC = () => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
      if (printRef.current) {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
  
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // reload to restore original contents
      }
    };
  return (<>
    {/* <Container className="invoice-report mt-4" style={{ border: '1px solid black', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Row className="border-bottom pb-2 mb-4" style={{ borderBottom: '1px solid black' }}>
        <Col style={{ borderRight: '1px solid black' }}>
          <div>
            <p><strong>GSTIN No:</strong> {company.gstin}</p>
            <p><strong>PAN No:</strong> {company.pan}</p>
          </div>
        </Col>
        <Col>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Tel:</strong> {company.contact}</p>
            <p>{company.email}</p>
          </div>
        </Col>
      </Row>
      <Row className="border-bottom pb-2 mb-4" style={{ borderBottom: '1px solid black' }}>
        <Col>
          <h2 className="text-center">{company.name}</h2>
          <p className="text-center">{company.address}</p>
        </Col>
      </Row>
      <Row className="border-bottom pb-2 mb-4" style={{ borderBottom: '1px solid black' }}>
        <Col style={{ borderRight: '1px solid black' }}>
          <div>
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Address:</strong> {customer.address}</p>
            <p><strong>Contact:</strong> {customer.contact}</p>
            <p><strong>GSTIN:</strong> {customer.gstin}</p>
            <p><strong>Delivery At:</strong> {customer.deliveryAt}</p>
          </div>
        </Col>
        <Col>
          <div style={{ textAlign: 'right' }}>
            <p><strong>INVOICE NO.:</strong> {invoice.number}</p>
            <p><strong>DATE:</strong> {invoice.date}</p>
            <p><strong>GR No.:</strong> {invoice.grNumber}</p>
            <p><strong>GR Date:</strong> {invoice.grDate}</p>
            <p><strong>EWay No.:</strong> {invoice.ewayNumber}</p>
            <p><strong>EWay Date:</strong> {invoice.ewayDate}</p>
            <p><strong>Vehicle No.:</strong> {invoice.vehicleNumber}</p>
            <p><strong>State:</strong> {invoice.state}</p>
            <p><strong>Transport:</strong> {invoice.transport}</p>
          </div>
        </Col>
      </Row>
      <Table bordered style={{ border: '1px solid black' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black' }}>S.N</th>
            <th style={{ border: '1px solid black' }}>ITEM DESCRIPTION</th>
            <th style={{ border: '1px solid black' }}>HSN</th>
            <th style={{ border: '1px solid black' }}>UNIT</th>
            <th style={{ border: '1px solid black' }}>QTY</th>
            <th style={{ border: '1px solid black' }}>RATE</th>
            <th style={{ border: '1px solid black' }}>Discount %</th>
            <th style={{ border: '1px solid black' }}>Discount Amt</th>
            <th style={{ border: '1px solid black' }}>Taxable Amt</th>
            <th style={{ border: '1px solid black' }}>TAX</th>
            <th style={{ border: '1px solid black' }}>SGST</th>
            <th style={{ border: '1px solid black' }}>CGST</th>
            <th style={{ border: '1px solid black' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black' }}>{index + 1}</td>
              <td style={{ border: '1px solid black' }}>{item.description}</td>
              <td style={{ border: '1px solid black' }}>{item.hsn}</td>
              <td style={{ border: '1px solid black' }}>{item.unit}</td>
              <td style={{ border: '1px solid black' }}>{item.quantity}</td>
              <td style={{ border: '1px solid black' }}>{item.rate.toFixed(2)}</td>
              <td style={{ border: '1px solid black' }}>{item.discountPercentage.toFixed(2)}</td>
              <td style={{ border: '1px solid black' }}>{item.discountAmount.toFixed(2)}</td>
              <td style={{ border: '1px solid black' }}>{item.taxableAmount.toFixed(2)}</td>
              <td style={{ border: '1px solid black' }}>{item.tax.toFixed(2)}</td>
              <td style={{ border: '1px solid black' }}>{item.sgst.toFixed(2)}</td>
              <td style={{ border: '1px solid black' }}>{item.cgst.toFixed(2)}</td>
              <td style={{ border: '1px solid black' }}>{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Row className="border-top pt-2" style={{ borderTop: '1px solid black' }}>
        <Col style={{ borderRight: '1px solid black' }}>
          <Table bordered style={{ border: '1px solid black' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black' }}>Class</th>
                <th style={{ border: '1px solid black' }}>Taxable Amt</th>
                <th style={{ border: '1px solid black' }}>@SGST</th>
                <th style={{ border: '1px solid black' }}>@CGST</th>
                <th style={{ border: '1px solid black' }}>Total Tax</th>
                <th style={{ border: '1px solid black' }}>Total Amt</th>
              </tr>
            </thead>
            <tbody>
              {totals.class.map((taxClass, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black' }}>{index === 0 ? '0.00%' : '5.00%'}</td>
                  <td style={{ border: '1px solid black' }}>{taxClass.taxableAmount.toFixed(2)}</td>
                  <td style={{ border: '1px solid black' }}>{taxClass.sgst.toFixed(2)}</td>
                  <td style={{ border: '1px solid black' }}>{taxClass.cgst.toFixed(2)}</td>
                  <td style={{ border: '1px solid black' }}>{taxClass.totalTax.toFixed(2)}</td>
                  <td style={{ border: '1px solid black' }}>{taxClass.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Total Amount Before Tax:</strong> {totals.totalAmountBeforeTax.toFixed(2)}</p>
            <p><strong>Add: SGST:</strong> {totals.sgst.toFixed(2)}</p>
            <p><strong>Add: CGST:</strong> {totals.cgst.toFixed(2)}</p>
            <p><strong>Total Tax Amount : GST:</strong> {totals.totalTaxAmount.toFixed(2)}</p>
            <p><strong>Bill Amount:</strong> {totals.billAmount.toFixed(2)}</p>
          </div>
        </Col>
      </Row>
      <Row className="border-top pt-2 mt-2" style={{ borderTop: '1px solid black' }}>
        <Col>
          <p><strong>Terms & Conditions:</strong></p>
          <p>{footer.terms}</p>
        </Col>
        <Col>
          <div style={{ textAlign: 'right' }}>
            <p><strong>{footer.company}</strong></p>
            <p>{footer.signatory}</p>
            <p>{footer.page}</p>
          </div>
        </Col>
      </Row>
      <Button className="mt-3" onClick={handlePrint}>Print</Button>
    </Container> */}
    <div ref={printRef} style={{ border: '1px solid black', fontSize:8 }}>
    
    <CompanyHeader />
    <CustomerInvoiceDetails />
    <ItemDetails />
    <TotalAndTaxes />
    <Footer />
    
    </div>
    <Button onClick={handlePrint} style={{ marginTop: '20px' }}>Print</Button>
    </>
  );
};

export default InvoiceReport;
