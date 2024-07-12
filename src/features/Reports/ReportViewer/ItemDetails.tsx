import React from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const items = [
  {
    description: "NAKKU",
    hsn: "10064000",
    unit: "QTL",
    quantity: 768.00,
    rate: 416.10,
    discountPercentage: 0.00,
    discountAmount: 0.00,
    taxableAmount: 927903.00,
    tax: 0.00,
    sgst: 0.00,
    cgst: 0.00,
    total: 927903.00
  },
  {
    description: "PHUCK 5%",
    hsn: "10064000",
    unit: "QTL",
    quantity: 180.00,
    rate: 180.00,
    discountPercentage: 0.00,
    discountAmount: 0.00,
    taxableAmount: 30000.00,
    tax: 5.00,
    sgst: 750.00,
    cgst: 750.00,
    total: 31500.00
  },
];
const totals = {
    discountAmount: 948.00,
    taxableAmount: 957903.00,
    tax: 0.00,
    sgst: 750.00,
    cgst: 750.00,
    total: 959403.00
  };
const ItemDetails: React.FC = () => {
  return (
    <div style={{ padding: '10px'}}>
    <Table bordered style={{ borderCollapse: 'collapse', tableLayout: 'fixed', height: '300px', backgroundColor:'white',padding:0 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>S.N</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>ITEM DESCRIPTION</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>HSN</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>UNIT</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>QTY</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>RATE</th>
            <th colSpan={2} style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>Discount</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>Taxable Amt</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>TAX</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>SGST</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>CGST</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>TOTAL</th>
          </tr>
          <tr>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>%</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>Amt</th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
            <th style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} style={{ height: '20px' }}>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{index + 1}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.description}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.hsn}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.unit}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.quantity}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.rate}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.discountPercentage}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.discountAmount}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.taxableAmount}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.tax}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.sgst}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.cgst}</td>
              <td style={{ border: 'none', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{item.total}</td>
            </tr>
          ))}
          <tr key={'last'}></tr>
         
        </tbody>
        <tfoot>
          <tr style={{ height: '20px', fontWeight: 'bold' }}>
            <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }} colSpan={6}>Total</td>
            <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}></td>
            <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{totals.discountAmount.toFixed(2)}</td>
            <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{totals.taxableAmount.toFixed(2)}</td>
            <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{totals.tax.toFixed(2)}</td>
            <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{totals.sgst.toFixed(2)}</td>
            <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{totals.cgst.toFixed(2)}</td>
            <td style={{ border: '1px solid black', textAlign: 'center', verticalAlign: 'middle',padding:0 }}>{totals.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </Table>
      </div>
  );
};

export default ItemDetails;
