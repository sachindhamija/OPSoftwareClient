import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Col, Row, Modal, Button, ListGroup } from "react-bootstrap";
import {
  CustomInput,
  CommonCard,
  FormNavigator,
  CustomButton,
  CustomDatePicker,
  CustomDropdown,
} from "../../../app/components/Components";
import agent from "../../../app/api/agent";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import { setLoading } from "../../../app/layout/loadingSlice";
import { useStates } from "../../../app/hooks/useStatesOptions";
import { StudentAdmissionDto } from "./StudentAdmissionDto";
import studentImage from "../../../assets/images/student-image.jpg";
import CommonModal from "../../../app/components/CommonModal";

const stateOptions = useStates();

const StudentAdmission: React.FC = () => {
  const dispatch = useAppDispatch();
  const methods = useForm<StudentAdmissionDto>();
  const { handleSubmit, control, register, setValue } = methods;

  const [showModal, setShowModal] = useState<{
    type: "admissionClass" | "section" | "category" | "city";
    isOpen: boolean;
  }>({ type: "admissionClass", isOpen: false });
  const [modalInput, setModalInput] = useState("");
  const [modalItems, setModalItems] = useState<{ [key: string]: string[] }>({
    admissionClass: [],
    section: [],
    category: [],
    city: [],
  });

  const openModal = (
    type: "admissionClass" | "section" | "category" | "city"
  ) => {
    setModalInput("");
    setShowModal({ type, isOpen: true });
  };

  const handleModalSave = () => {
    const currentType = showModal.type;
    if (modalInput.trim() !== "") {
      setModalItems((prev) => ({
        ...prev,
        [currentType]: [...prev[currentType], modalInput],
      }));
      setValue(currentType, modalInput);
      setModalInput("");
      setShowModal({ ...showModal, isOpen: false });
    } else {
      toast.error("Please enter a valid value.");
    }
  };

  const onSubmit = async (data: StudentAdmissionDto) => {
    dispatch(setLoading(true));

    try {
      await agent.Student.create(data);
      toast.success("Student admitted successfully.");
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Failed to save student.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const modalLabels = {
    admissionClass: "Enter Class Name",
    section: "Enter Section",
    category: "Enter Category",
    city: "Enter City Name",
  };

  return (
    <CommonCard size="75%" header="Student Admission">
      <img
        src={studentImage}
        alt="Student"
        style={{
          position: "absolute",
          top: "60px",
          right: "100px",
          width: "200px",
          height: "200px",
        }}
      />
      <FormProvider {...methods}>
        <FormNavigator onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col xs={4}>
              <CustomInput
                label="Admission No."
                name="admissionNo"
                register={register}
              />
            </Col>
            <Col xs={4}>
              <CustomDatePicker
                label="Admission Date"
                name="admissionDate"
                register={register}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={8}>
              <CustomInput
                label="Student Name"
                name="studentName"
                register={register}
              />
            </Col>
          </Row>

          <CommonModal
            show={showModal.isOpen}
            onHide={() => setShowModal({ ...showModal, isOpen: false })}
            title={modalLabels[showModal.type]}
            size="sm"
          >
            <CommonCard size="100%" header={`Add New ${showModal.type}`}>
              <CustomInput
                label={modalLabels[showModal.type]}
                name="modalInput"
                value={modalInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setModalInput(e.target.value)
                }
              />
              <ListGroup className="mt-3">
                {modalItems[showModal.type]?.map((item, index) => (
                  <ListGroup.Item key={index}>{item}</ListGroup.Item>
                ))}
              </ListGroup>
              <Modal.Footer>
                <Button variant="primary" onClick={handleModalSave}>
                  Save
                </Button>
              </Modal.Footer>
            </CommonCard>
          </CommonModal>

          <Row className="mt-3">
            <Col xs={4}>
              <CustomDropdown
                label="Admission"
                name="admissionClass"
                control={control}
                isCreatable={true}
                options={modalItems.admissionClass.map((item) => ({
                  label: item,
                  value: item,
                }))}
                onCreateButtonClick={() => {
                  openModal("admissionClass");
                }}
              />
            </Col>
            <Col xs={4}>
              <CustomDropdown
                label="Section"
                name="section"
                control={control}
                isCreatable={true}
                options={modalItems.section.map((item) => ({
                  label: item,
                  value: item,
                }))}
                onCreateButtonClick={() => {
                  openModal("section");
                }}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              <CustomInput label="Roll No." name="rollNo" register={register} />
            </Col>

            <Col xs={4}>
              <CustomDropdown
                label="Category"
                name="category"
                control={control}
                isCreatable={true}
                options={modalItems.category.map((item) => ({
                  label: item,
                  value: item,
                }))}
                onCreateButtonClick={() => {
                  openModal("category");
                }}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              <CustomInput label="Gender" name="gender" register={register} />
            </Col>
            <Col xs={4}>
              <CustomDatePicker
                label="Date of Birth"
                name="dob"
                register={register}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={8}>
              <CustomInput
                label="Address Line 1"
                name="address"
                register={register}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              <CustomDropdown
                label="City "
                name="city"
                control={control}
                isCreatable={true}
                options={modalItems.city.map((item) => ({
                  label: item,
                  value: item,
                }))}
                onCreateButtonClick={() => {
                  openModal("city");
                }}
              />
            </Col>

            <Col md={4} sm={12}>
              <CustomDropdown
                name="state"
                label="Select State"
                options={stateOptions}
                control={control}
              />
            </Col>
          </Row>

          {/* Additional fields */}
          <Row className="mt-3">
            <Col xs={4}>
              <CustomInput
                label="Father Name"
                name="fatherName"
                register={register}
              />
            </Col>
            <Col xs={4}>
              <CustomInput
                label="Father's Mobile"
                name="fathersMobile"
                register={register}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              <CustomInput
                label="Mother Name"
                name="motherName"
                register={register}
              />
            </Col>{" "}
            <Col xs={4}>
              <CustomInput
                label="Mother's Mobile"
                name="mothersMobile"
                register={register}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              <CustomInput
                label="Aadhaar Card No."
                name="aadhaarCardNo"
                register={register}
              />
            </Col>
            <Col xs={4}>
              <CustomInput label="E-mail ID" name="email" register={register} />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              <CustomInput
                label="Contact No."
                name="contactNo"
                register={register}
              />
            </Col>{" "}
            <Col xs={4}>
              <CustomInput
                label="Admission Form No."
                name="admissionFormNo"
                register={register}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              <CustomInput
                label="Opening Balance"
                name="openingBalance"
                register={register}
                type="number"
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12}>
              <CustomButton text={"Save"} variant="primary" type="submit" />
            </Col>
          </Row>
        </FormNavigator>
      </FormProvider>
    </CommonCard>
  );
};

export default StudentAdmission;
