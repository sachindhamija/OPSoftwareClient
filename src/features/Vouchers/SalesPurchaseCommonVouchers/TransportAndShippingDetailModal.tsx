import React, { Suspense, useEffect, useState } from "react";
import { Modal, Row, Col, Form } from "react-bootstrap";
import { CommonModal, CustomDropdown, CustomInput, FormNavigator } from "../../../app/components/Components";
import { TransportDetailDto } from "./SalesPurchaseCommonVoucherDto";
import { useForm } from "react-hook-form";
import CustomDateInputBox from "../../../app/components/CustomDateInput";
import { selectCurrentFinancialYear } from "../../Masters/FinancialYear/financialYearSlice";
import { useAppSelector } from "../../../app/store/configureStore";
import { formatDateForBackend } from "../../../app/utils/dateUtils";
import TransporterForm from "./TransporterForm";
import { OptionType } from "../../../app/models/optionType";
import agent from "../../../app/api/agent";
import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";
import VehicleForm from "./VehicleForm";
interface TransportDetailsModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: TransportDetailDto) => void;
  initialData: TransportDetailDto;
}

const TransportAndShippingDetailModal: React.FC<TransportDetailsModalProps> = ({
  show,
  onHide,
  onSave,
  initialData,
}) => {
  const { register, reset, setValue, control } = useForm<TransportDetailDto>({
    defaultValues: initialData,
  });
  const accessId = getAccessIdOrRedirect();
  const [formData, setFormData] = useState<TransportDetailDto>(initialData);
  const [transporters, setTransporters] = useState<OptionType[]>([]);
  const [vehicles, setVehicles] = useState<OptionType[]>([]);
  const [showTransporterModal, setShowTransporterModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const financialYear = useAppSelector(selectCurrentFinancialYear);
  React.useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const handleSaveAndClose = () => {
    onSave(formData);
    onHide();
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key == "Tab") {
      event.preventDefault();
      handleSaveAndClose();
    }
  };

  const loadTransporters = async () => {
		try {
			const response = await agent.Transporter.getAllTransporters(
				accessId
			);
			const formattedOptions = response.map(
				(transporter: TransporterDto) => ({
					label: transporter.transporterName,
					value: transporter.transporterId,
				})
			);
			setTransporters(formattedOptions);
		} catch (error) {
			console.error('Error fetching transporters:', error);
		}
	};

  const loadVehicles = async () => {
		try {
			const response = await agent.Vehicle.getAllVehicles(
				accessId
			);
			const formattedOptions = response.map(
				(vehicle: VehicleDto) => ({
					label: vehicle.vehicleNumber,
					value: vehicle.vehicleId,
				})
			);
			setVehicles(formattedOptions);
		} catch (error) {
			console.error('Error fetching transporters:', error);
		}
	};

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadTransporters(),
        loadVehicles(),
      ]);
    };
    loadData();
  }, [accessId]);

  return (
    <>
      <Modal show={show} onHide={handleSaveAndClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px" }}>
            Transport & Shipping Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormNavigator isModalOpen={true}>
            <Row>
              {/* E-Invoice Number */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="E-Invoice Number"
                  name="eInvoiceNumber"
                  register={register}
                  value={formData.eInvoiceNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, eInvoiceNumber: e.target.value })
                  }
                />
              </Col>

              {/* E-Invoice Date */}
              <Col md={6} xs={12}>
                <CustomDateInputBox
                  label="E-Invoice Date"
                  name="eInvoiceDate"
                  register={register}
                  setValue={setValue}
                  financialYear={financialYear}  
                  onValueChange={(value) =>
                      setFormData((prevFormData) => ({ ...prevFormData, eInvoiceDate: formatDateForBackend(value) }))
                  }
                  defaultDate={formData.eInvoiceDate}
                />
              </Col>

              {/* E-Way Bill No. */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="E-Way Bill No."
                  name="eWayBillNo"
                  register={register}
                  value={formData.eWayBillNo}
                  onChange={(e) =>
                    setFormData({ ...formData, eWayBillNo: e.target.value })
                  }
                />
              </Col>

              {/* E-Way Bill Date */}
              <Col md={6} xs={12}>
                <CustomDateInputBox
                  label="E-Way Bill Date"
                  name="eWayBillDate"
                  register={register}
                  setValue={setValue}
                  financialYear={financialYear}  
                  onValueChange={(value) =>
                      setFormData((prevFormData) => ({ ...prevFormData, eWayBillDate: formatDateForBackend(value) }))
                  }
                  defaultDate={formData.eWayBillDate}
                />
              </Col>

              {/* Place of Supply / State */}
              <Col md={12} xs={12}>
                <CustomInput
                  label="Place of Supply / State"
                  name="placeOfSupply"
                  register={register}
                  value={formData.placeOfSupply}
                  onChange={(e) =>
                    setFormData({ ...formData, placeOfSupply: e.target.value })
                  }
                />
              </Col>

              {/* Mode */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="Mode"
                  name="mode"
                  register={register}
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: e.target.value })
                  }
                />
              </Col>

              {/* Vehicle Type */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="Vehicle Type"
                  name="vehicleType"
                  register={register}
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleType: e.target.value })
                  }
                />
              </Col>

              {/* Charges Paid/To-Paid */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="Charges Paid/To-Paid"
                  name="chargesPaidOrToPaid"
                  register={register}
                  value={formData.chargesPaidOrToPaid}
                  onChange={(e) =>
                    setFormData({...formData, chargesPaidOrToPaid: e.target.value })
                  }
                />
              </Col>

              {/* Transporter Name */}
              <Col md={6} xs={12}>
                <CustomDropdown
                  label="Transporter Name"
                  name="transporterId"
                  options={transporters}
                  control={control}
                  onChangeCallback={(e) =>
                    setFormData({ ...formData, transporterId: e?.value  })
                  }
                  showF3New
                  showCreateButton={true}
                  onCreateButtonClick={() => {
                    setShowTransporterModal(true);
                  }}
                />

              </Col>

              {/* Vehicle Number */}
              <Col md={6} xs={12}>
                <CustomDropdown
                  label="Vehicle Number"
                  name="vehicleId"
                  options={vehicles}
                  control={control}
                  onChangeCallback={(e) =>
                    setFormData({ ...formData, vehicleId: e?.value  })
                  }
                  showF3New
                  showCreateButton={true}
                  onCreateButtonClick={() => {
                    setShowVehicleModal(true);
                  }}
                  />
              </Col>

              {/* Driver Name */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="Driver Name"
                  name="driverName"
                  value={formData.driverName}
                  onChange={(e) =>
                    setFormData({ ...formData, driverName: e.target.value })
                  }
                />
              </Col>

              {/* GR Number */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="GR Number"
                  name="grNo"
                  value={formData.grNo}
                  onChange={(e) =>
                    setFormData({ ...formData, grNo: e.target.value })
                  }
                />
              </Col>

              {/* GR Date */}
              <Col md={6} xs={12}>
                  <CustomDateInputBox
                      label="GR Date"
                      name="grDate"
                      register={register}
                      setValue={setValue}
                      financialYear={financialYear}
                      onValueChange={(value) =>
                          setFormData((prevFormData) => ({ ...prevFormData, grDate: formatDateForBackend(value) }))
                      }
                      defaultDate={formData.grDate}

                  />
              </Col>
            </Row>

            <Form.Text className="text-muted" style={{ fontSize: "12px" }}>
              <i>
                Note: If Shipping details are empty, Billed to Account details
                will be mentioned on the bill.
              </i>
            </Form.Text>

            <Row>
              {/* Complete Shipping Address */}
              <Col md={12} xs={12}>
                <CustomInput
                  label="Complete Shipping Address"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryAddress: e.target.value })
                  }
                />
              </Col>

              {/* Shipping Firm Name */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="Shipping Firm Name"
                  name="deliveryFirmName"
                  value={formData.deliveryFirmName}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryFirmName: e.target.value })
                  }
                />
              </Col>

              {/* GST Number */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="GST Number"
                  name="deliveryFirmGSTNo"
                  value={formData.deliveryFirmGSTNo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryFirmGSTNo: e.target.value,
                    })
                  }
                />
              </Col>

              {/* Contact Person Name */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="Contact Person Name"
                  name="deliveryFirmContactPersonName"
                  value={formData.deliveryFirmContactPersonName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryFirmContactPersonName: e.target.value,
                    })
                  }
                />
              </Col>

              {/* Contact Person Mobile Number */}
              <Col md={6} xs={12}>
                <CustomInput
                  label="Contact Person Mobile Number"
                  name="deliveryFirmPersonMobileNumber"
                  value={formData.deliveryFirmPersonMobileNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryFirmPersonMobileNumber: e.target.value,
                    })
                  }
                />
              </Col>

              {/* Broker Name */}
              <Col md={12} xs={12}>
                <CustomInput
                  label="Broker Name"
                  name="brokerName"
                  value={formData.brokerName}
                  onChange={(e) =>
                    setFormData({ ...formData, brokerName: e.target.value })
                  }
                  onKeyDown={handleKeyPress}
                />
              </Col>
            </Row>
          </FormNavigator>
        </Modal.Body>
      </Modal>

      <CommonModal
            show={showTransporterModal}
            onHide={() => 
                {
                  setShowTransporterModal(false);
                }
            }>
            <Suspense fallback={<div>Loading...</div>}>
                <TransporterForm onSaveSuccess={() => 
                    {
                      loadTransporters()
                      setShowTransporterModal(false);
                    }}
                    isModalOpen={showTransporterModal}
                    />
            </Suspense>
		</CommonModal>

    <CommonModal
        show={showVehicleModal}
        onHide={() => 
            {
              setShowVehicleModal(false);
            }
        }>
        <Suspense fallback={<div>Loading...</div>}>
            <VehicleForm onSaveSuccess={() => 
                {
                  loadVehicles()
                  setShowVehicleModal(false);
                }} 
                isModalOpen={showVehicleModal}
                />
        </Suspense>
		</CommonModal>

    </>
  );
};

export default TransportAndShippingDetailModal;
