import React, { useState } from 'react';
import { Modal, Row, Col, Form } from 'react-bootstrap';
import { CustomInput, FormNavigator } from '../../../app/components/Components';
import { TransportDetailDto } from './SalesPurchaseCommonVoucherDto';
import { useForm } from 'react-hook-form';

interface TransportDetailsModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (data: TransportDetailDto) => void;
    initialData: TransportDetailDto;


}

const TransportAndShippingDetailModal: React.FC<TransportDetailsModalProps> = ({ show,
    onHide,
    onSave,
    initialData }) => {
    const { register, reset } = useForm<TransportDetailDto>({
        defaultValues: initialData
    });
    const [formData, setFormData] = useState<TransportDetailDto>(initialData);

    React.useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const handleSaveAndClose = () => {
        onSave(formData);
        onHide();
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key == 'Tab') {
            event.preventDefault();
            handleSaveAndClose();
        }
    };

    return (
        <Modal show={show} onHide={handleSaveAndClose} size='lg'>
            <Modal.Header closeButton>
                <Modal.Title style={{ fontSize: '18px' }}>Transport & Shipping Details</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <FormNavigator isModalOpen={true}>
                    <Row>
                        <Col md={12} xs={12}>
                            <CustomInput label="Transporter Name" name="transporterName" register={register}
                                onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber}
                                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Driver Name" name="driverName" value={formData.driverName}
                                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="GR Number" name="grNo" value={formData.grNo}
                                onChange={(e) => setFormData({ ...formData, grNo: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="GR Date" name="grDate" value={formData.grDate}
                                onChange={(e) => setFormData({ ...formData, grDate: e.target.value })} />
                        </Col>
                    </Row>
                    <Form.Text className="text-muted" style={{ fontSize: '12px' }}>
                        <i>Note: If Shipping details are empty Billed to Account details will be mentioned on bill.</i>
                    </Form.Text>
                    <Row>
                        <Col md={12} xs={12}>
                            <CustomInput label="Complete Shipping Address" name="deliveryAddress" value={formData.deliveryAddress}
                                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Shipping Firm Name" name="deliveryFirmName" value={formData.deliveryFirmName}
                                onChange={(e) => setFormData({ ...formData, deliveryFirmName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="GST Number" name="deliveryFirmGSTNo" value={formData.deliveryFirmGSTNo}
                                onChange={(e) => setFormData({ ...formData, deliveryFirmGSTNo: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Contact Person Name" name="deliveryFirmContactPersonName" value={formData.deliveryFirmContactPersonName}
                                onChange={(e) => setFormData({ ...formData, deliveryFirmContactPersonName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Contact Person Mobile Number" name="deliveryFirmPersonMobileNumber" value={formData.deliveryFirmPersonMobileNumber}
                                onChange={(e) => setFormData({ ...formData, deliveryFirmPersonMobileNumber: e.target.value })} />
                        </Col>
                        <Col md={12} xs={12}>
                            <CustomInput label="Broker Name" name="brokerName" value={formData.brokerName}
                                onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
                                onKeyDown={handleKeyPress} />
                        </Col>
                    </Row>
                </FormNavigator>
            </Modal.Body>
        </Modal>
    );
};

export default TransportAndShippingDetailModal;
