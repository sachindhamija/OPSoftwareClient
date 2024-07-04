import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { CustomButton, CustomInput, CommonCard, CommonTable, FormNavigator } from '../../../app/components/Components';
import { ColumnDef } from '@tanstack/react-table';
import agent from '../../../app/api/agent';
import { useAppDispatch } from '../../../app/store/configureStore';
import toast from 'react-hot-toast';
import { setLoading } from '../../../app/layout/loadingSlice';
import { getAccessIdOrRedirect } from '../Company/CompanyInformation';
import { SerialNumberDto } from './SerialNumberDto';

const SerialNumberSetting: React.FC = () => {
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const { register, handleSubmit, setValue, reset, formState: { isSubmitting, isValid } } = useForm<SerialNumberDto>();
    const [serialNumbers, setSerialNumbers] = useState<SerialNumberDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSerialNumber, setEditingSerialNumber] = useState<SerialNumberDto | null>(null);

    const columns: ColumnDef<SerialNumberDto>[] = [

        {
            accessorFn: (row) => row.serialNumberName,
            id: 'serialNumberName',
            header: 'serialNumberName',
            cell: (info) => info.getValue(),
        },
        // {
        //   accessorFn: () => 'actions',
        //   id: 'actions',
        //   header: 'Actions',
        //   cell: ({ row }) => (
        //     <div>
        //       <button onClick={() => handleEdit(row.original)}>Edit</button>
        //       <button onClick={() => handleDelete(row.original)}>Delete</button>
        //     </div>
        //   ),
        // },
    ];

    useEffect(() => {
        fetchSerialNumbers();
    }, [dispatch]);

    const fetchSerialNumbers = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedSerialNumbers = await agent.SerialNumber.getAll(accessId);
            setSerialNumbers(fetchedSerialNumbers);
        } catch (error) {
            console.error('Error fetching serial numbers', error);
            toast.error('Error fetching serial numbers');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const onSubmit = async (data: SerialNumberDto) => {
        dispatch(setLoading(true));
        try {
            if (isEditMode && editingSerialNumber) {
                await agent.SerialNumber.update(accessId, editingSerialNumber.serialNumberID, data);
                toast.success('Serial number updated successfully');
            } else {
                await agent.SerialNumber.create(accessId, { ...data });
            }
            fetchSerialNumbers();
        } catch (error) {
            console.error('Error saving serial number', error);
            toast.error('Error saving serial number');
        } finally {
            dispatch(setLoading(false));
            setIsEditMode(false);
            setEditingSerialNumber(null);
            reset();
        }
    };

    const handleEdit = (serialNumber: SerialNumberDto) => {
        setEditingSerialNumber(serialNumber);
        setIsEditMode(true);
        setValue('serialNumberName', serialNumber.serialNumberName);
    };

    const handleDelete = async (serialNumber: SerialNumberDto) => {
        if (window.confirm(`Are you sure you want to delete the serial number "${serialNumber.serialNumberName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.SerialNumber.delete(accessId, serialNumber.serialNumberID);
                toast.success(`Serial number "${serialNumber.serialNumberName}" deleted successfully`);
                fetchSerialNumbers();
            } catch (error) {
                console.error('Error deleting serial number', error);
                toast.error('Error deleting serial number');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingSerialNumber(null);
                reset();
            }
        }
    };

    return (
        <CommonCard header="Serial Number Settings">
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={12} md={10}>
                        <CustomInput
                            label="Serial Number Name"
                            name="serialNumberName"
                            register={register}
                            validationRules={{
                                required: 'Serial Number Name cannot be empty.',
                            }}
                        />
                    </Col>
                    <Col
                        xs={12}
                        md={2}
                        className="d-flex align-items-center justify-content-end justify-content-md-start mt-md-4 mb-2"
                    >
                        <CustomButton
                            text={isEditMode ? 'Update' : 'Add'}
                            variant="primary"
                            type="submit"
                            isSubmitting={isSubmitting}
                            isValid={isValid}
                        />
                    </Col>
                </Row>
            </FormNavigator>
            {serialNumbers.length > 0 && (
                <CommonTable
                    data={serialNumbers}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showSrNo
                />
            )}
        </CommonCard>
    );
};

export default SerialNumberSetting;
