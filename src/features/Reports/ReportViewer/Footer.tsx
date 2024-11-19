import React from 'react';
import { Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const footerData = {
  terms: "1. We are not responsible for loss and damage occured by Transport in Transit. 2. Interest @18% will be charged if payment is not made within 7 days.",
  companyName: "M/S A.M. AGRO FOOD PRODUCTS",
  signatory: "Auth. Signatory",
  page: "Page 1 of 1"
};

const Footer: React.FC = () => {
  return (
    <div style={{ padding: '10px', marginTop: '20px' }}>
      <Row>
        <Col style={{ borderRight: '1px solid black', paddingRight: '10px' }}>
          <p style={{ margin: '0', fontSize: '14px' }}><strong>Terms & Conditions:</strong></p>
          <p style={{ margin: '0', fontSize: '14px' }}>{footerData.terms}</p>
        </Col>
        <Col style={{ textAlign: 'right', paddingLeft: '10px' }}>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>{footerData.companyName}</p>
        </Col>
      </Row>
      <Row style={{ marginTop: '10px' }}>
        <Col style={{ textAlign: 'right' }}>
          <p style={{ margin: '0', fontSize: '14px' }}>{footerData.signatory}</p>
          <p style={{ margin: '0', fontSize: '14px' }}>{footerData.page}</p>
        </Col>
      </Row>
    </div>
  );
};

export default Footer;
