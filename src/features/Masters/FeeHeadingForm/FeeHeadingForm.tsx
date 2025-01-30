import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CustomInput, CommonCard, FormNavigator, CustomButton } from "../../../app/components/Components";

interface FeeHeadingFormProps {
  onSuccess: (feeHeading: string) => void;
}

const FeeHeadingForm: React.FC<FeeHeadingFormProps> = ({ onSuccess }) => {
  const methods = useForm<{ feeHeading: string }>();
  const [feeHeadings, setFeeHeadings] = useState<string[]>([]);  

  const handleSubmit = (data: { feeHeading: string }) => {
    setFeeHeadings((prevHeadings) => [...prevHeadings, data.feeHeading]);  
    onSuccess(data.feeHeading);
    methods.reset();  
  };

  return (
    <CommonCard size="100%" header="Add New Fees Heading">
      <FormProvider {...methods}>
        <FormNavigator onSubmit={methods.handleSubmit(handleSubmit)}>
          <CustomInput name="feeHeading" label="Fees Heading" register={methods.register} />
          <CustomButton variant="primary" type="submit" text="Save Fees Heading" className="mt-3" />
        </FormNavigator>
      </FormProvider>

       <table className="table mt-4">
        <thead>
          <tr>
            <th>Fees Heading</th>
          </tr>
        </thead>
        <tbody>
          {feeHeadings.map((heading, index) => (
            <tr key={index}>
              <td>{heading}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CommonCard>
  );
};

export default FeeHeadingForm;
