// import React, { Suspense, useState } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import { Col, Row } from "react-bootstrap";
// import {
//   CustomInput,
//   CommonCard,
//   FormNavigator,
//   CustomButton,
//   CustomDatePicker,
//   CustomDropdown,
// } from "../../../app/components/Components";
// import agent from "../../../app/api/agent";
// import { useAppDispatch } from "../../../app/store/configureStore";
// import toast from "react-hot-toast";
// import { setLoading } from "../../../app/layout/loadingSlice";
// import { useStates } from "../../../app/hooks/useStatesOptions";
// import { StudentAdmissionDto } from "./StudentAdmissionDto";
// import studentImage from "../../../assets/images/student-image.jpg";
// import CommonModal from "../../../app/components/CommonModal";
// import SectionForm from "../../Masters/SectionForm/SectionForm";
// import CategoryForm from "../../Masters/CategoryForm/CategoryForm";
// import CityForm from "../../Masters/CityForm/CityForm";
// import AdmissionClassForm from "../../Masters/AdmissionClassForm/AdmissionClassForm";
// import { OptionType } from "../../../app/models/optionType";

// const stateOptions = useStates();

// const StudentAdmission: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const methods = useForm<StudentAdmissionDto>();
//   const { handleSubmit, control, register, setValue } = methods;

//   const [showAdmissionModal, setShowAdmissionModal] = useState(false);
//   const [showSectionModal, setShowSectionModal] = useState(false);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [showCityModal, setShowCityModal] = useState(false);

//   const [admissionOptions, setAdmissionOptions] = useState<OptionType[]>([]);
//   const [sectionOptions, setSectionOptions] = useState<OptionType[]>([]);
//   const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
//   const [cityOptions, setCityOptions] = useState<OptionType[]>([]);

//   const handleNewOptionAdded = (
//     type: "admissionClass" | "section" | "category" | "city",
//     newOption: string
//   ) => {
//     const newOptionObj: OptionType = { label: newOption, value: newOption };

//     switch (type) {
//       case "admissionClass":
//         setAdmissionOptions((prev) => [...prev, newOptionObj]);
//         break;
//       case "section":
//         setSectionOptions((prev) => [...prev, newOptionObj]);
//         break;
//       case "category":
//         setCategoryOptions((prev) => [...prev, newOptionObj]);
//         break;
//       case "city":
//         setCityOptions((prev) => [...prev, newOptionObj]);
//         break;
//     }

//     setValue(type, newOption);
//   };

//   const onSubmit = async (data: StudentAdmissionDto) => {
//     dispatch(setLoading(true));

//     try {
//       await agent.Student.create(data);
//       toast.success("Student admitted successfully.");
//     } catch (error) {
//       console.error("Error saving student:", error);
//       toast.error("Failed to save student.");
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   return (
//     <CommonCard size="75%" header="Student Admission">
//       <img
//         src={studentImage}
//         alt="Student"
//         style={{
//           position: "absolute",
//           top: "60px",
//           right: "100px",
//           width: "200px",
//           height: "200px",
//         }}
//       />
//       <FormProvider {...methods}>
//         <FormNavigator onSubmit={handleSubmit(onSubmit)}>
//           <Row>
//             <Col xs={4}>
//               <CustomInput
//                 label="Admission No."
//                 name="admissionNo"
//                 register={register}
//               />
//             </Col>
//             <Col xs={4}>
//               <CustomDatePicker
//                 label="Admission Date"
//                 name="admissionDate"
//                 register={register}
//               />
//             </Col>
//           </Row>
//           <Row>
//             <Col xs={8}>
//               <CustomInput
//                 label="Student Name"
//                 name="studentName"
//                 register={register}
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomDropdown
//                 label="Admission"
//                 name="admissionClass"
//                 control={control}
//                 options={admissionOptions}
//                 isCreatable={true}
//                 onCreateButtonClick={() => setShowAdmissionModal(true)}
//               />
//             </Col>
//             <Col xs={4}>
//               <CustomDropdown
//                 label="Section"
//                 name="section"
//                 control={control}
//                 isCreatable={true}
//                 options={sectionOptions}
//                 onCreateButtonClick={() => setShowSectionModal(true)}
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomInput label="Roll No." name="rollNo" register={register} />
//             </Col>

//             <Col xs={4}>
//               <CustomDropdown
//                 label="Category"
//                 name="category"
//                 control={control}
//                 isCreatable={true}
//                 options={categoryOptions}
//                 onCreateButtonClick={() => setShowCategoryModal(true)}
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomInput label="Gender" name="gender" register={register} />
//             </Col>
//             <Col xs={4}>
//               <CustomDatePicker
//                 label="Date of Birth"
//                 name="dob"
//                 register={register}
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={8}>
//               <CustomInput
//                 label="Address Line 1"
//                 name="address"
//                 register={register}
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomDropdown
//                 label="City "
//                 name="city"
//                 control={control}
//                 isCreatable={true}
//                 options={cityOptions}
//                 onCreateButtonClick={() => setShowCityModal(true)}
//               />
//             </Col>

//             <Col md={4} sm={12}>
//               <CustomDropdown
//                 name="state"
//                 label="Select State"
//                 options={stateOptions}
//                 control={control}
//               />
//             </Col>
//           </Row>

//           {/* Additional fields */}
//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomInput
//                 label="Father Name"
//                 name="fatherName"
//                 register={register}
//               />
//             </Col>
//             <Col xs={4}>
//               <CustomInput
//                 label="Father's Mobile"
//                 name="fathersMobile"
//                 register={register}
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomInput
//                 label="Mother Name"
//                 name="motherName"
//                 register={register}
//               />
//             </Col>{" "}
//             <Col xs={4}>
//               <CustomInput
//                 label="Mother's Mobile"
//                 name="mothersMobile"
//                 register={register}
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomInput
//                 label="Aadhaar Card No."
//                 name="aadhaarCardNo"
//                 register={register}
//               />
//             </Col>
//             <Col xs={4}>
//               <CustomInput label="E-mail ID" name="email" register={register} />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomInput
//                 label="Contact No."
//                 name="contactNo"
//                 register={register}
//               />
//             </Col>{" "}
//             <Col xs={4}>
//               <CustomInput
//                 label="Admission Form No."
//                 name="admissionFormNo"
//                 register={register}
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={4}>
//               <CustomInput
//                 label="Opening Balance"
//                 name="openingBalance"
//                 register={register}
//                 type="number"
//               />
//             </Col>
//           </Row>

//           <Row className="mt-3">
//             <Col xs={12}>
//               <CustomButton text={"Save"} variant="primary" type="submit" />
//             </Col>
//           </Row>
//         </FormNavigator>
//       </FormProvider>
//       <CommonModal
//         show={showSectionModal}
//         onHide={() => setShowSectionModal(false)}
//         title="Add New Section"
//       >
//         <Suspense fallback={<div>Loading form...</div>}>
//           <SectionForm
//             onSuccess={(newSection) => {
//               handleNewOptionAdded("section", newSection);
//               setShowSectionModal(false);
//             }}
//           />
//         </Suspense>
//       </CommonModal>
//       <CommonModal
//         show={showCategoryModal}
//         onHide={() => setShowCategoryModal(false)}
//         title="Add New Category"
//       >
//         <Suspense fallback={<div>Loading form...</div>}>
//           <CategoryForm
//             onSuccess={(newCategory) => {
//               handleNewOptionAdded("category", newCategory);
//               setShowCategoryModal(false);
//             }}
//           />
//         </Suspense>
//       </CommonModal>

//       <CommonModal
//         show={showCityModal}
//         onHide={() => setShowCityModal(false)}
//         title="Add New City"
//       >
//         <Suspense fallback={<div>Loading form...</div>}>
//           <CityForm
//             onSuccess={(newCity) => {
//               handleNewOptionAdded("city", newCity);
//               setShowCityModal(false);
//             }}
//           />
//         </Suspense>
//       </CommonModal>

//       <CommonModal
//         show={showAdmissionModal}
//         onHide={() => setShowAdmissionModal(false)}
//         title="Add New Class"
//       >
//         <Suspense fallback={<div>Loading form...</div>}>
//           <AdmissionClassForm
//             onSuccess={(newClass) => {
//               handleNewOptionAdded("admissionClass", newClass);
//               setShowAdmissionModal(false);
//             }}
//           />
//         </Suspense>
//       </CommonModal>
//     </CommonCard>
//   );
// };

// export default StudentAdmission;
