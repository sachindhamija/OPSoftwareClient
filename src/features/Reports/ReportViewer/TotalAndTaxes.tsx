import React from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const totalsData = {
  classTax: [
    {
      class: "0.00%",
      taxableAmount: 927903.00,
      sgst: 0.00,
      cgst: 0.00,
      totalTax: 0.00,
      totalAmount: 927903.00
    },
    {
      class: "5.00%",
      taxableAmount: 30000.00,
      sgst: 750.00,
      cgst: 750.00,
      totalTax: 1500.00,
      totalAmount: 31500.00
    }
  ],
  totalAmountBeforeTax: 957903.00,
  discountAmount: 0.00,
  sgst: 750.00,
  cgst: 750.00,
  totalTaxAmount: 1500.00,
  billAmount: 959403.00,
  amountInWords: "Nine Lakh Fifty Nine Thousand Four Hundred Three rupees only"
};

const TotalAndTaxes: React.FC = () => {
  return (
    <div style={{ padding: '10px'}}>
      <Row>
        <Col>
          <Table bordered style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>Class</th>
                <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>Taxable Amt</th>
                <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>@SGST</th>
                <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>@CGST</th>
                <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>Total Tax</th>
                <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>Total Amt</th>
              </tr>
            </thead>
            <tbody>
              {totalsData.classTax.map((tax, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>{tax.class}</td>
                  <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>{tax.taxableAmount.toFixed(2)}</td>
                  <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>{tax.sgst.toFixed(2)}</td>
                  <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>{tax.cgst.toFixed(2)}</td>
                  <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>{tax.totalTax.toFixed(2)}</td>
                  <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle' }}>{tax.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col>
          <div style={{ border: '1px solid black', padding: '10px', height: '100%' }}>
            <p style={{ margin: '0', fontSize: '14px', textAlign: 'left' }}><strong>Total Amount Before Tax:</strong> <span style={{ float: 'right' }}>{totalsData.totalAmountBeforeTax.toFixed(2)}</span></p>
            <p style={{ margin: '0', fontSize: '14px', textAlign: 'left' }}><strong>Less: Discount Amount:</strong> <span style={{ float: 'right' }}>{totalsData.discountAmount.toFixed(2)}</span></p>
            <p style={{ margin: '0', fontSize: '14px', textAlign: 'left' }}><strong>Add: SGST:</strong> <span style={{ float: 'right' }}>{totalsData.sgst.toFixed(2)}</span></p>
            <p style={{ margin: '0', fontSize: '14px', textAlign: 'left' }}><strong>Add: CGST:</strong> <span style={{ float: 'right' }}>{totalsData.cgst.toFixed(2)}</span></p>
            <p style={{ margin: '0', fontSize: '14px', textAlign: 'left' }}><strong>Total Tax Amount : GST:</strong> <span style={{ float: 'right' }}>{totalsData.totalTaxAmount.toFixed(2)}</span></p>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div style={{  border: '1px solid black',padding: '10px', height: '100%' }}>
            <p style={{ margin: '0', fontSize: '14px', textAlign: 'left' }}><strong>{totalsData.amountInWords}</strong></p>
          </div>
        </Col>
        <Col>
          <div style={{ border: '1px solid black', padding: '10px', height: '100%', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>
            <p style={{ margin: '0', fontSize: '16px' }}><strong>Bill Amount:</strong> <span style={{ float: 'right' }}>{totalsData.billAmount.toFixed(2)}</span></p>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TotalAndTaxes;
