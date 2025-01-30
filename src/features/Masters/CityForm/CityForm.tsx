import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CustomInput, CommonCard, FormNavigator, CustomButton } from "../../../app/components/Components";

interface CityFormProps {
  onSuccess: (cityName: string) => void;
}

const CityForm: React.FC<CityFormProps> = ({ onSuccess }) => {
  const methods = useForm<{ cityName: string }>();
  const [cityList, setCityList] = useState<string[]>([]);  

  const handleSubmit = (data: { cityName: string }) => {
    setCityList((prevCities) => [...prevCities, data.cityName]);  
    onSuccess(data.cityName);
  };

  return (
    <CommonCard size="100%" header="Add New City">
      <FormProvider {...methods}>
        <FormNavigator onSubmit={methods.handleSubmit(handleSubmit)}>
          <CustomInput name="cityName" label="City Name" register={methods.register} />
          <CustomButton variant="primary" type="submit" text="Save City" className="mt-3" />
        </FormNavigator>
      </FormProvider>

      {/* Table to display the list of cities */}
      <table className="table mt-4">
        <thead>
          <tr>
            <th>City Name</th>
          </tr>
        </thead>
        <tbody>
          {cityList.map((cityName, index) => (
            <tr key={index}>
              <td>{cityName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CommonCard>
  );
};

export default CityForm;
