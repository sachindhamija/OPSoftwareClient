import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Col, Row, Form, Button } from "react-bootstrap";
import {
  CustomInput,
  CommonCard,
  CommonTable,
  FormNavigator,
  CustomButton,
} from "../../../app/components/Components";
import { ColumnDef } from "@tanstack/react-table";
import agent from "../../../app/api/agent";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import { setLoading } from "../../../app/layout/loadingSlice";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";
import { SerialNumberDto } from "./SerialNumberDto";

const SerialNumberSetting: React.FC = () => {
  const accessId = getAccessIdOrRedirect();
  const dispatch = useAppDispatch();
  const { register, handleSubmit, setValue, reset, control } =
    useForm<SerialNumberDto>();
  const [serialNumbers, setSerialNumbers] = useState<SerialNumberDto[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSerialNumber, setEditingSerialNumber] =
    useState<SerialNumberDto | null>(null);
  const [numFields, setNumFields] = useState<number>(0);

  const columns: ColumnDef<SerialNumberDto>[] = [
    {
      accessorKey: "serialNumberName",
      header: "Serial Number Name",
    },
    {
      accessorFn: () => "Actions",
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div>
          <Button variant="link" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>
          <Button variant="link" onClick={() => handleDelete(row.original)}>
            Delete
          </Button>
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
      console.error("Error fetching serial numbers:", error);
      // toast.error("Failed to fetch serial numbers.");
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
        toast.success("Serial number updated successfully.");
      } else {
        await agent.SerialNumber.create(accessId, data);
        toast.success("Serial number created successfully.");
      }
      fetchSerialNumbers();
    } catch (error) {
      console.error("Error saving serial number:", error);
      toast.error("Failed to save serial number.");
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
          `Serial number "${serialNumber.serialNumberName}" deleted successfully.`
        );
        fetchSerialNumbers();
      } catch (error) {
        console.error("Error deleting serial number:", error);
        toast.error("Failed to delete serial number.");
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const resetForm = () => {
    reset();
    setIsEditMode(false);
    setEditingSerialNumber(null);
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNumFields(Number(e.target.value));
  };

  return (
    <CommonCard header="Serial Number Settings">
      <FormNavigator onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xs={8}>
            <Form.Group controlId="formDropdown">
              <Form.Label>
                Serial No.'s to input in purchase and sale
              </Form.Label>
              <Controller
                name="select number"
                control={control}
                defaultValue=""
                rules={{ required: "Please select a valid option." }}
                render={({ field }) => (
                  <Form.Control
                    as="select"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleDropdownChange(
                        e as unknown as React.ChangeEvent<HTMLSelectElement>
                      );
                    }}
                    value={field.value as string | number | undefined}
                  >
                    <option value="0">0</option>
                    {[...Array(10).keys()].map((num) => (
                      <option key={num + 1} value={num + 1}>
                        {num + 1}
                      </option>
                    ))}
                  </Form.Control>
                )}
              />
            </Form.Group>
          </Col>
        </Row>

        {[...Array(10).keys()].map((num) => (
          <Row key={num} className="mt-3">
            <Col xs={8}>
              <CustomInput
                label={`Title of serial number ${num + 1}`}
                name={`serialNumber${num + 1}`}
                register={register}
                disabled={num >= numFields}
              />
            </Col>
          </Row>
        ))}

        <Row className="mt-3">
          <Col xs={5}>
            <CustomButton
              text="Save"
              variant="primary"
              type="submit"
              onClick={handleSubmit(onSubmit)}
            />
          </Col>
          <Col xs={5}>
            <CustomButton
              text="Delete"
              variant="danger"
              type="button"
              onClick={() => reset()}
            />
          </Col>
        </Row>
      </FormNavigator>
      {serialNumbers.length > 0 && (
        <CommonTable data={serialNumbers} columns={columns} onEdit={handleEdit}
        onDelete={handleDelete} showSrNo />
      )}
    </CommonCard>
  );
};

export default SerialNumberSetting;
