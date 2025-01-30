import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { CustomInput, CommonCard, FormNavigator, CustomButton } from "../../../app/components/Components";

interface AdmissionClassFormProps {
  onSuccess: (className: string) => void;
}

const AdmissionClassForm: React.FC<AdmissionClassFormProps> = ({ onSuccess }) => {
  const methods = useForm<{ className: string }>();
  const [classList, setClassList] = useState<string[]>([]);  

  const handleSubmit = (data: { className: string }) => {
    setClassList((prevClasses) => [...prevClasses, data.className]); 
    onSuccess(data.className);
  };

  return (
    <CommonCard size="100%" header="Class Admission">
      <FormProvider {...methods}>
        <FormNavigator onSubmit={methods.handleSubmit(handleSubmit)}>
          <CustomInput
            name="className"
            label="Class Name"
            register={methods.register}
          />
          <CustomButton
            variant="primary"
            type="submit"
            text="Save Class"
            className="mt-3"
          />
        </FormNavigator>
      </FormProvider>

      {/* Table to display class names */}
      <table className="table mt-4">
        <thead>
          <tr>
            <th>Class Name</th>
          </tr>
        </thead>
        <tbody>
          {classList.map((className, index) => (
            <tr key={index}>
              <td>{className}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CommonCard>
  );
};

export default AdmissionClassForm;
