import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CustomInput, CommonCard, FormNavigator, CustomButton } from "../../../app/components/Components";

interface SectionFormProps {
  onSuccess: (sectionName: string) => void;
}

const SectionForm: React.FC<SectionFormProps> = ({ onSuccess }) => {
  const methods = useForm<{ sectionName: string }>();
  const [sectionList, setSectionList] = useState<string[]>([]);  

  const handleSubmit = (data: { sectionName: string }) => {
    setSectionList((prevSections) => [...prevSections, data.sectionName]); 
    onSuccess(data.sectionName);
  };

  return (
    <CommonCard size="100%" header="Add New Section">
      <FormProvider {...methods}>
        <FormNavigator onSubmit={methods.handleSubmit(handleSubmit)}>
          <CustomInput name="sectionName" label="Section Name" register={methods.register} />
          <CustomButton variant="primary" type="submit" text="Save Section" className="mt-3" />
        </FormNavigator>
      </FormProvider>

      {/* Table to display section names */}
      <table className="table mt-4">
        <thead>
          <tr>
            <th>Section Name</th>
          </tr>
        </thead>
        <tbody>
          {sectionList.map((sectionName, index) => (
            <tr key={index}>
              <td>{sectionName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CommonCard>
  );
};

export default SectionForm;
