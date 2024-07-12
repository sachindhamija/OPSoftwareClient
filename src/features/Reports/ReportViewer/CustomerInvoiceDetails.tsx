import React from 'react';
import { Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const customerInfo = {
  name: "SRI SWAMI CHITRATH RICE MILLS",
  address: "MANDI LADHUKA",
  contact: "9217293242",
  gstin: "03ABRFS3288G1ZT",
  deliveryAt: "GLOBUS SPRITIS LTD VILLAGE SHYAMPUR TEHSIL BEHROR, ALWAR GST NO :(08AAACG2634B1Z6)"
};

const invoiceInfo = {
  number: "76",
  date: "11-05-2023",
  grNumber: "GR No.",
  grDate: "GR Date.",
  ewayNumber: "EWay No.",
  ewayDate: "EWay Date",
  vehicleNumber: "RJ45GA0029",
  state: "PUNJAB-03",
  transport: "TRANSPORT"
};

const CustomerInvoiceDetails: React.FC = () => {
  return (
    <div style={{ padding: '10px', borderBottom:'1px solid black'}}>
    <Row>
        <Col style={{ borderRight: '1px solid black', paddingRight: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span ><strong>Name:</strong> {customerInfo.name}</span>
            <span ><strong>Address:</strong> {customerInfo.address}</span>
            <span ><strong>Contact:</strong> {customerInfo.contact}</span>
            <span ><strong>GSTIN:</strong> {customerInfo.gstin}</span>
          </div>
          <div>
            <span ><strong>Delivery At:</strong> {customerInfo.deliveryAt}</span>
          </div>
        </Col>
        <Col style={{ paddingLeft: '10px' }}>
          <Row>
            <Col>
              <span ><strong>INVOICE NO.:</strong> {invoiceInfo.number}</span>
              <span ><strong>GR No.:</strong> {invoiceInfo.grNumber}</span>
              <span ><strong>GR Date:</strong> {invoiceInfo.grDate}</span>
              <span ><strong>Vehicle No.:</strong> {invoiceInfo.vehicleNumber}</span>
              <span ><strong>Transport:</strong> {invoiceInfo.transport}</span>
            </Col>
            <Col>
              <span ><strong>DATE:</strong> {invoiceInfo.date}</span>
              <span ><strong>EWay No.:</strong> {invoiceInfo.ewayNumber}</span>
              <span ><strong>EWay Date:</strong> {invoiceInfo.ewayDate}</span>
              <span ><strong>State:</strong> {invoiceInfo.state}</span>
            </Col>
          </Row>
        </Col>
      </Row>
      </div>
  );
};

export default CustomerInvoiceDetails;
