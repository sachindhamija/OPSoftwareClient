import { Suspense, useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import {
  CustomInput,
  CustomDropdown,
  CommonModal,
} from "../../../app/components/Components";
import { Control, UseFormRegister, UseFormWatch } from "react-hook-form";
import { AccountDto } from "./accountDto";
import { OptionType } from "../../../app/models/optionType";
import CityForm from "../City/CityForm";
import agent from "../../../app/api/agent";

interface DefaultFieldsProps {
  register: UseFormRegister<AccountDto>;
  control: Control<AccountDto>;
  errors: {
    [key: string]: any;
  };
  measurementsOptions: OptionType[];
  partyTypesOptions: OptionType[];
  cityOptions: OptionType[];
  stateOptions: OptionType[];
  accessId: string;
  watch: UseFormWatch<any>;
  setValue: any;
}

function DefaultFields({
  accessId,
  register,
  control,
  errors,
  measurementsOptions,
  partyTypesOptions,
  cityOptions,
  stateOptions,
  watch,
  setValue,
}: DefaultFieldsProps) {
  const [modalShow, setModalShow] = useState(false);
  const partyTypeValue = watch("partyType");
  const [companyDetails, setCompanyDetails] = useState<any>({});
  const [tmpStateOptions, setTmpStateOptions] = useState<any>(stateOptions);

  useEffect(() => {
    if (!accessId) {
      return;
    }
    // console.log({ stateOptions });
    const getCompanyDetails = async () => {
      try {
        const response = await agent.Company.getCompanyDetail(accessId);
        // setCompanyName(formatCompanyName(response));
        // console.log({ response });
        setCompanyDetails(response);
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };
    getCompanyDetails();
  }, [accessId]);

  useEffect(() => {
    if (partyTypeValue === "Un-Registered Out of State") {
      setTmpStateOptions(
        stateOptions.filter((option) => option.value !== companyDetails.state)
      );
    } else {
      setTmpStateOptions(stateOptions);
    }
  }, [partyTypeValue]);

  useEffect(() => {
    if (
      !["Un-Registered"].includes(partyTypeValue) ||
      !companyDetails.state ||
      !stateOptions.length
    ) {
      return;
    }

    const matchingState = tmpStateOptions.find(
      (option: any) => option.value === companyDetails.state
    );

    if (matchingState) {
      setValue("stateId", matchingState.value);
      console.log("Updated stateId to:", matchingState.value);
    }
  }, [partyTypeValue, companyDetails, tmpStateOptions]);

  return (
    <>
      <Row>
        <Col md={3}>
          <CustomDropdown
            label="Party Type"
            name="partyType"
            options={partyTypesOptions}
            control={control}
            error={errors.partyType}
            defaultValue={partyTypesOptions.find(
              (option) => option.value === "Un-Registered"
            )}
            // validationRules={{ required: "Party type is required" }}
          />
        </Col>
        {[
          "Un-Registered",
          "Un-Registered Out of State",
          "Out of Country (GST Not Applicable)",
          "Out of Country (GST Applicable)",
        ].includes(partyTypeValue) ? null : (
          <Col md={3}>
            <CustomInput
              label="GSTIN"
              name="gstNo"
              register={register}
              maxLength={16}
              validationRules={{
                required: "GSTIN is required",
                pattern: {
                  value:
                    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/,
                  message: "Invalid GSTIN format",
                },
              }}
            />
          </Col>
        )}

        <Col md={3}>
          <CustomInput
            label="PAN"
            name="panNo"
            register={register}
            maxLength={16}
          />
        </Col>
        <Col md={3}>
          <CustomDropdown
            name="stateId"
            label="State"
            options={tmpStateOptions}
            control={control}
            error={errors.stateId}
            disabled={[
              "Composition",
              "GST Party",
              "GST Party Out of State",
              "Un-Registered",
            ].includes(partyTypeValue)}
            // defaultValue={defaultState}
            // onChangeCallback={(value) => setDefaultState(value)}
            // validationRules={{ required: "State is required" }}
          />
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <CustomDropdown
            name="cityId"
            label="City"
            options={cityOptions}
            control={control}
            onCreateButtonClick={() => {
              setModalShow(true);
            }}
          />
        </Col>
        <Col md={6}>
          <CustomInput
            label="Print Address"
            name="printAddress"
            register={register}
            maxLength={150}
          />
        </Col>
        <Col md={3}>
          <CustomInput
            label="Contact Person/Owner Name"
            name="contactPerson"
            register={register}
            maxLength={150}
          />
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <CustomInput
            label="Mobile No 1"
            name="mobileNo"
            register={register}
            maxLength={10}
            validationRules={{
              pattern: { value: /^[0-9]+$/, message: "Invalid mobile number" },
            }}
          />
        </Col>
        <Col md={3}>
          <CustomInput
            label="Mobile No 2"
            name="mobileNo2"
            register={register}
            maxLength={10}
            validationRules={{
              pattern: { value: /^[0-9]+$/, message: "Invalid mobile number" },
            }}
          />
        </Col>
        <Col md={3}>
          <CustomInput
            label="Email"
            name="emailId"
            register={register}
            maxLength={100}
            // validationRules={{ pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email format" } }}
          />
        </Col>
        <Col md={3}>
          <CustomInput
            label="Aadhar No"
            name="aadharNo"
            register={register}
            maxLength={12}
          />
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <CustomInput
            label="Extra License 1"
            name="dlNo1"
            register={register}
            maxLength={50}
          />
        </Col>
        <Col md={3}>
          <CustomInput
            label="Extra License 2"
            name="dlNo2"
            register={register}
            maxLength={50}
          />
        </Col>
        <Col md={3}>
          <CustomDropdown
            name="measurement"
            label="Measurements for Ledger"
            options={measurementsOptions}
            control={control}
          />
        </Col>
        <Col md={3}>
          <Row>
            <Col md={6}>
              <CustomInput
                label="Discount %"
                name="discountPercentage"
                allowedChars="numericDecimal"
                register={register}
              />
            </Col>
            <Col md={6}>
              <CustomInput
                label="Margin %"
                name="marginPercentage"
                allowedChars="numericDecimal"
                register={register}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <CustomInput
            label="Print Remarks"
            name="remarks"
            register={register}
            maxLength={1000} // Adjust the maxLength as per your DTO
          />
        </Col>
      </Row>

      <CommonModal show={modalShow} onHide={() => setModalShow(false)}>
        <Suspense fallback={<div>Loading...</div>}>
          <CityForm />
        </Suspense>
      </CommonModal>
    </>
  );
}

export default DefaultFields;
