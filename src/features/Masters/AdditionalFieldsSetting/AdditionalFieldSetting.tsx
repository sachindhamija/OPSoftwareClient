import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Col, Row, Form } from "react-bootstrap";
import {
  CustomButton,
  // CustomInput,
  CommonCard,
  CommonTable,
  FormNavigator,
  CustomDropdown,
} from "../../../app/components/Components";
import { ColumnDef } from "@tanstack/react-table";
import agent from "../../../app/api/agent";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import { setLoading } from "../../../app/layout/loadingSlice";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";

interface SerialNumberDto {
  serialNumberID: string;
  serialNumberName: string;
  description: string;
}

const AdditionalFieldSetting: React.FC = () => {
  const accessId = getAccessIdOrRedirect();
  const dispatch = useAppDispatch();

  const { handleSubmit, setValue, reset, control } =
    useForm<SerialNumberDto>();

  const [serialNumbers, setSerialNumbers] = useState<SerialNumberDto[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSerialNumber, setEditingSerialNumber] =
    useState<SerialNumberDto | null>(null);
  // const [numFields, setNumFields] = useState(0);

  const columns: ColumnDef<SerialNumberDto>[] = [
    {
      accessorKey: "serialNumberName",
      header: "Serial Number Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div>
          <button onClick={() => handleEdit(row.original)}>Edit</button>
          <button onClick={() => handleDelete(row.original)}>Delete</button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchSerialNumbers();
  }, []);

  const fetchSerialNumbers = async () => {
    dispatch(setLoading(true));
    try {
      const fetchedSerialNumbers = await agent.SerialNumber.getAll(accessId);
      setSerialNumbers(fetchedSerialNumbers);
    } catch (error) {
      console.error("Error fetching serial numbers", error);
      // toast.error("Error fetching serial numbers");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onSubmit = async (data: SerialNumberDto) => {
    dispatch(setLoading(true));
    try {
      if (isEditMode && editingSerialNumber) {
        await agent.SerialNumber.update(
          accessId,
          editingSerialNumber.serialNumberID,
          data
        );
        toast.success("Serial number updated successfully");
      } else {
        await agent.SerialNumber.create(accessId, data);
        toast.success("Serial number created successfully");
      }
      fetchSerialNumbers();
    } catch (error) {
      console.error("Error saving serial number", error);
      // toast.error("Error saving serial number");
    } finally {
      dispatch(setLoading(false));
      resetForm();
    }
  };

  const handleEdit = (serialNumber: SerialNumberDto) => {
    setEditingSerialNumber(serialNumber);
    setIsEditMode(true);
    setValue("serialNumberName", serialNumber.serialNumberName);
  };

  const handleDelete = async (serialNumber: SerialNumberDto) => {
    if (
      window.confirm(
        `Are you sure you want to delete the serial number "${serialNumber.serialNumberName}"?`
      )
    ) {
      dispatch(setLoading(true));
      try {
        await agent.SerialNumber.delete(accessId, serialNumber.serialNumberID);
        toast.success(
          `Serial number "${serialNumber.serialNumberName}" deleted successfully`
        );
        fetchSerialNumbers();
      } catch (error) {
        console.error("Error deleting serial number", error);
        // toast.error("Error deleting serial number");
      } finally {
        dispatch(setLoading(false));
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingSerialNumber(null);
    reset();
  };

  // const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const value = parseInt(e.target.value, 10);
  //   setNumFields(isNaN(value) ? 0 : value);
  // };

  return (
    <CommonCard header="Additional Field Settings">
      <FormNavigator onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xs={12} md={4}>
            <CustomDropdown
              name="additionalFieldTypeId"
              label="Form Type"
              options={[
                { value: "Sale", label: "Sale Voucher" },
                { value: "Purchase", label: "Purchase Voucher" },
                { value: "SalesReturn", label: "Sales Return" },
                { value: "PurchaseReturn", label: "Purchase Return" },
                { value: "DebitNote", label: "Debit Note" },
                { value: "CreditNote", label: "Credit Note" },
                { value: "Payment", label: "Payment Voucher" },
                { value: "Receipt", label: "Receipt Voucher" },
                { value: "BankEntry", label: "Bank Entry" },
                { value: "JournalEntry", label: "Journal Entry" },
                { value: "CreditSale", label: "Credit Sale" },
                

              ]}
              control={control}
            />
          </Col>
          <Col xs={12} md={10}>
            <Form.Group controlId="formDropdown">
              <Form.Label>Select number of fields</Form.Label>

              {/* please fix this issue by using customdropdown */}


              {/* <Controller
                name="numFields"
                control={control}
                defaultValue=""
                rules={{ required: "Please select a valid option." }}
                render={({ field }) => (
                  <Form.Control
                    as="select"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt((e.target as unknown as HTMLSelectElement).value, 10);
                      field.onChange(value);
                      handleDropdownChange(e as unknown as React.ChangeEvent<HTMLSelectElement>);
                    }}
                  >
                    <option value="">Select...</option>
                    {[...Array(10).keys()].map((num) => (
                      <option key={num + 1} value={num + 1}>
                        {num + 1}
                      </option>
                    ))}
                  </Form.Control>
                )}
              /> */}
            </Form.Group>
          </Col>
        </Row>


          {/* please fix this issue by using customdropdown */}

        {/* {[...Array(numFields).keys()].map((num) => (
          <Row key={num} className="mt-3">
            <Col xs={12} md={10}>
              <CustomInput
                label={`Title of ${num + 1} field`}
                name={`field${num + 1}`}
                register={register}
              />
            </Col>
          </Row>
        ))} */}
        <Row className="mt-3">
          <Col xs={5}>
            <CustomButton
              text={isEditMode ? "Update" : "Save"}
              variant="primary"
              type="submit"
            />
          </Col>
          <Col xs={5}>
            <CustomButton
              text="Reset"
              variant="secondary"
              type="button"
              onClick={resetForm}
            />
          </Col>
        </Row>
      </FormNavigator>
      {serialNumbers.length > 0 && (
        <CommonTable data={serialNumbers} columns={columns} showSrNo />
      )}
    </CommonCard>
  );
};

export default AdditionalFieldSetting;
