import React from "react";
import { useForm } from "react-hook-form";
import { Col, Row } from "react-bootstrap";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import { setLoading } from "../../../app/layout/loadingSlice";
import {
  CustomButton,
  CustomInput,
  CommonCard,
  FormNavigator,
} from "../../../app/components/Components";

interface PasswordForm {
  password: string;
  confirmPassword: string;
  type?: string;
  // Other props
  hideToggleButton?: boolean; 
}

const PasswordSetting: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<PasswordForm>();

  const onSubmit = async (data: PasswordForm) => {
    dispatch(setLoading(true));
    try {
      console.log(data);
      toast.success("Password saved successfully");
    } catch (error) {
      console.error("Error saving password", error);
      toast.error("Error saving password");
    } finally {
      dispatch(setLoading(false));
      reset();
    }
  };

  return (
    <CommonCard header="Password for Delete/Update Any Voucher">
      <FormNavigator onSubmit={handleSubmit(onSubmit)}>
        <Row className="justify-content-center">
          <Col xs={12} md={6}>
            <CustomInput label="Password" name="password"  type="password"/>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs={12} md={6} className="mt-3">
            <CustomInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
            />
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col
            xs={12}
            className="d-flex align-items-center justify-content-center mt-4"
          >
            <CustomButton
              text="Save"
              variant="primary"
              type="submit"
              isSubmitting={isSubmitting}
              isValid={isValid}
            />
          </Col>
        </Row>
      </FormNavigator>
    </CommonCard>
  );
};

export default PasswordSetting;