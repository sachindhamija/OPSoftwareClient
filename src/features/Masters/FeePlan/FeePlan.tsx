import React, { useState, useEffect, Suspense } from "react";
import { Col, Row } from "react-bootstrap";
import { CustomDropdown, CommonCard } from "../../../app/components/Components";
import agent from "../../../app/api/agent";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import { setLoading } from "../../../app/layout/loadingSlice";
import AdmissionClassForm from "../AdmissionClassForm/AdmissionClassForm";
import CategoryForm from "../CategoryForm/CategoryForm";
import FeeHeadingForm from "../FeeHeadingForm/FeeHeadingForm";
import CommonModal from "../../../app/components/CommonModal";
import { OptionType } from "../../../app/models/optionType";
import { useForm } from "react-hook-form";
import CommonTable from '../../../app/components/CommonTable';

interface Student {
  admissionNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  sectionName: string;
}

const FeePlan: React.FC = () => {
  const dispatch = useAppDispatch();
  const [students, setStudents] = useState<Student[]>([]);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFeeHeadingModal, setShowFeeHeadingModal] = useState(false);
  const [admissionOptions, setAdmissionOptions] = useState<OptionType[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [feeHeadingOptions, setFeeHeadingOptions] = useState<OptionType[]>([]);

  const { control } = useForm();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        dispatch(setLoading(true));
        const response = await agent.Student.list();
        setStudents(response);
      } catch (error) {
        toast.error("Error loading students");
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchStudents();
  }, [dispatch]);

  // Updated columns with correct structure
  const columns = [
    {
      header: 'Fees Heading', 
      accessorKey: 'feeHeading',
      id: 'feeHeading',
    },
    {
      header: 'Fee Amount', 
      accessorKey: 'feeAmount',
      id: 'feeAmount',
    },
    {
      header: 'Class Name',
      accessorKey: 'className',
      id: 'className',
    },
    {
      header: 'Category Name',
      accessorKey: 'categoryName',
      id: 'categoryName',
    },
  ];

  return (
    <CommonCard size="100%" header="Fee Plan">
      <Row className="mb-4">
        <Col xs={4}>
          <CustomDropdown
            label="Admission"
            name="admissionClass"
            control={control}
            options={admissionOptions}
            isCreatable={true}
            onCreateButtonClick={() => setShowAdmissionModal(true)}
          />
        </Col>

        <Col xs={4}>
          <CustomDropdown
            label="Category"
            name="category"
            control={control}
            isCreatable={true}
            options={categoryOptions}
            onCreateButtonClick={() => setShowCategoryModal(true)}
          />
        </Col>

        <Col xs={4}>
          <CustomDropdown
            label="Fees Heading"
            name="feesHeading"
            control={control}
            isCreatable={true}
            options={feeHeadingOptions}
            onCreateButtonClick={() => setShowFeeHeadingModal(true)}
          />
        </Col>
      </Row>
      <CommonTable
        data={students}
        columns={columns}
        showSrNo={true}
        usePagination={false}
          
      />
      {/* Admission Class Modal */}
      <CommonModal
        show={showAdmissionModal}
        onHide={() => setShowAdmissionModal(false)}
        title="Add New Class"
      >
        <Suspense fallback={<div>Loading form...</div>}>
          <AdmissionClassForm
            onSuccess={(newClass) => {
              setAdmissionOptions((prev) => [...prev, { label: newClass, value: newClass }]);
              setShowAdmissionModal(false);
            }}
          />
        </Suspense>
      </CommonModal>

      {/* Category Modal */}
      <CommonModal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        title="Add New Category"
      >
        <Suspense fallback={<div>Loading form...</div>}>
          <CategoryForm
            onSuccess={(newCategory) => {
              setCategoryOptions((prev) => [...prev, { label: newCategory, value: newCategory }]);
              setShowCategoryModal(false);
            }}
          />
        </Suspense>
      </CommonModal>

      {/* Fees Heading Modal */}
      <CommonModal
        show={showFeeHeadingModal}
        onHide={() => setShowFeeHeadingModal(false)}
        title="Add New Fees Heading"
      >
        <Suspense fallback={<div>Loading form...</div>}>
          <FeeHeadingForm
            onSuccess={(newFeeHeading) => {
              setFeeHeadingOptions((prev) => [...prev, { label: newFeeHeading, value: newFeeHeading }]);
              setShowFeeHeadingModal(false);
            }}
          />
        </Suspense>
      </CommonModal>
    </CommonCard>
  );
};

export default FeePlan;
