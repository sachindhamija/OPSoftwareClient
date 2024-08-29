import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { ItemsInVoucherDto } from './CommonVoucherDto';

const panelStyles = {
  marginBottom: '20px',
  backgroundColor: '#fff',
  border: '1px solid transparent',
  borderRadius: '4px',
  boxShadow: '0 1px 1px rgba(0, 0, 0, .05)',
};

const panelHeadingStyles = {
  padding: '10px 15px',
  borderBottom: '1px solid transparent',
  borderTopLeftRadius: '3px',
  borderTopRightRadius: '3px',
  color: '#fff',
};

const panelBodyStyles = {
  padding: '15px',
  color: 'rgb(41, 43, 44)',
  backgroundColor: 'transparent',
};

const panelInfoStyles = {
  borderColor: '#5bc0de',
};

const panelInfoHeadingStyles = {
  backgroundColor: '#5bc0de',
  borderColor: '#5bc0de',
};
interface InfoPanelProps {
  heading: string;
  children: ReactNode;
}
const InfoPanel: React.FC<InfoPanelProps>= ({ heading, children }) => {
  return (
    <div style={{ ...panelStyles, ...panelInfoStyles }}>
      <div style={{ ...panelHeadingStyles, ...panelInfoHeadingStyles }}>
        {heading}
      </div>
      <div style={panelBodyStyles}>
        {children}
      </div>
    </div>
  );
};

interface SerialNumberModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (serialValues: ItemsInVoucherDto[]) => void;
  currentItemID: string | null;
  items: ItemsInVoucherDto[];
}

const SerialNumberModal: React.FC<SerialNumberModalProps> = ({ show, onHide, onSave, items }) => {
  const [serialValues, setSerialValues] = useState<ItemsInVoucherDto[]>(items);
  const serialValuesRef = useRef(serialValues);

  useEffect(() => {
    setSerialValues(items);
  }, [items]);

  useEffect(() => {
    serialValuesRef.current = serialValues;
  }, [serialValues]);

  const handleInputChange = (index: number, serialNumberId: string, value: string) => {
    setSerialValues(prevValues => {
      const updatedValues = [...prevValues];
      const updatedItem = {
        ...updatedValues[index],
        serialNumberValues: updatedValues[index].serialNumberValues.map(sn =>
          sn.serialNumberID === serialNumberId ? { ...sn, description: value } : sn
        ),
      };
      updatedValues[index] = updatedItem;
      return updatedValues;
    });
  };

  const handleSave = () => {
    const updatedValues = serialValuesRef.current;
    onSave(updatedValues);
    onHide();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleSave();
    }
  };

  useEffect(() => {
    if (show) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [show]);

  return (
    <Modal show={show} onHide={() => {}} backdrop="static" keyboard={false} size="xl">
      <Modal.Header>
        <Modal.Title>Enter Serial Numbers</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflowY: 'scroll', maxHeight: 400 }}>
        {serialValues.filter(x => x.itemId && x.altQty).map((item, index) => (
          <div key={index}>
            <InfoPanel heading={`${item.itemDetail?.itemName}`}>
              <Form.Group as={Row} className="mb-3">
                {item.serialNumberValues.map(sn => (
                  <Col key={sn.serialNumberID} md={6} lg={4} xl={3}>
                    <Form.Label>{sn.serialNumberName}</Form.Label>
                    <Col>
                      <Form.Control
                        type="text"
                        placeholder={`Enter ${sn.serialNumberName}`}
                        value={sn.description ?? ''}
                        onChange={(e) => handleInputChange(index, sn.serialNumberID, e.target.value)}
                      />
                    </Col>
                  </Col>
                ))}
              </Form.Group>
            </InfoPanel>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SerialNumberModal;
