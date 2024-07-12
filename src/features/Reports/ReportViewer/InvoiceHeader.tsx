import React from 'react';
import { Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const companyInfo = {
  gstin: "03CDLPR3813C1ZU",
  pan: "CDLPR3813C",
  name: "M/S A.M. AGRO FOOD PRODUCTS",
  address: "NEW GRAIN MARKET JALALABAD (W), PUNJAB-03",
  contact: "97813-42605, 88725-42605",
  email: "SAM9814549070@GMAIL.COM",
  terms: "Credit"
};

const CompanyHeader: React.FC = () => {
  return (
   <div style={{ padding: '10px', borderBottom:'1px solid black'}}>
   <Row>
        <Col>
          <div>
            <span ><strong>GSTIN No:</strong> {companyInfo.gstin}</span><br/>
            <span ><strong>PAN No:</strong> {companyInfo.pan}</span>
          </div>
        </Col>
        <Col style={{ textAlign: 'right', paddingLeft: '10px' }}>
          <div>
            <span ><strong>Tel:</strong> {companyInfo.contact}</span><br/>
            <span >{companyInfo.email}</span>
          </div>
        </Col>
      </Row>
      <Row style={{ textAlign: 'center'}}>
        <Col>
          <h2 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#003366' }}>{companyInfo.name}</h2>
          <span style={{ margin: '0', fontSize: '16px', color: '#003366' }}>{companyInfo.address}</span>
        </Col>
      </Row>
      <Row style={{ textAlign: 'right' }}>
        <Col>
          <span ><strong>Terms:</strong> {companyInfo.terms}</span>
        </Col>
      </Row>
   </div>
  );
};

export default CompanyHeader;
