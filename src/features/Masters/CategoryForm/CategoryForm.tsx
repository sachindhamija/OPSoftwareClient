import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CustomInput, CommonCard, FormNavigator, CustomButton } from "../../../app/components/Components";

interface CategoryFormProps {
  onSuccess: (categoryName: string) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSuccess }) => {
  const methods = useForm<{ categoryName: string }>();
  const [categoryList, setCategoryList] = useState<string[]>([]);  

  const handleSubmit = (data: { categoryName: string }) => {
    setCategoryList((prevCategories) => [...prevCategories, data.categoryName]);  
    onSuccess(data.categoryName);
  };

  return (
    <CommonCard size="100%" header="Add New Category">
      <FormProvider {...methods}>
        <FormNavigator onSubmit={methods.handleSubmit(handleSubmit)}>
          <CustomInput name="categoryName" label="Category Name" register={methods.register} />
          <CustomButton variant="primary" type="submit" text="Save Category" className="mt-3" />
        </FormNavigator>
      </FormProvider>

      {/* Table to display the list of categories */}
      <table className="table mt-4">
        <thead>
          <tr>
            <th>Category Name</th>
          </tr>
        </thead>
        <tbody>
          {categoryList.map((categoryName, index) => (
            <tr key={index}>
              <td>{categoryName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CommonCard>
  );
};

export default CategoryForm;
