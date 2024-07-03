import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { CustomButton, CustomInput, CommonCard, CommonTable, FormNavigator, CustomDropdown } from '../../../app/components/Components';
import { ColumnDef } from '@tanstack/react-table';
import agent from '../../../app/api/agent';
import { useAppDispatch } from '../../../app/store/configureStore';
import toast from 'react-hot-toast';
import { setLoading } from '../../../app/layout/loadingSlice';
import { getAccessIdOrRedirect } from '../Company/CompanyInformation';
import { AdditionalFieldDto } from './AdditionalFieldDto';

interface AdditionalFieldType {
    additionalFieldTypeId: string;
    additionalFieldTypeName: string;
}

const AdditionalFieldSetting: React.FC = () => {
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const { register, handleSubmit, setValue, reset,control, formState: { errors,isSubmitting, isValid } } = useForm<AdditionalFieldDto>();
    const [additionalFields, setAdditionalFields] = useState<AdditionalFieldDto[]>([]);
    const [additionalFieldTypes, setAdditionalFieldTypes] = useState<AdditionalFieldType[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAdditionalField, setEditingAdditionalField] = useState<AdditionalFieldDto | null>(null);

    const columns: ColumnDef<AdditionalFieldDto>[] = [
        {
            accessorFn: (row) => row.additionalFieldName,
            id: 'additionalFieldName',
            header: 'Additional Field Name',
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.additionalFieldTypeName,
            id: 'additionalFieldTypeName',
            header: 'Additional Field Type',
            cell: (info) => info.getValue(),
        },
    ];

    useEffect(() => {
        fetchAdditionalFields();
        fetchAdditionalFieldTypes();
    }, [dispatch]);

    const fetchAdditionalFields = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedAdditionalFields = await agent.AdditionalField.getAll(accessId);
            setAdditionalFields(fetchedAdditionalFields);
        } catch (error) {
            console.error('Error fetching additional fields', error);
            toast.error('Error fetching additional fields');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const fetchAdditionalFieldTypes = async () => {
        try {
            const fetchedAdditionalFieldTypes = await agent.AdditionalFieldType.getAll(accessId);
            setAdditionalFieldTypes(fetchedAdditionalFieldTypes);
        } catch (error) {
            console.error('Error fetching additional field types', error);
            toast.error('Error fetching additional field types');
        }
    };

    const onSubmit = async (data: AdditionalFieldDto) => {
        dispatch(setLoading(true));
        try {
            if (isEditMode && editingAdditionalField) {
                await agent.AdditionalField.update(accessId, editingAdditionalField.additionalFieldID, data);
                toast.success('Additional field updated successfully');
            } else {
                await agent.AdditionalField.create(accessId, { ...data });
                toast.success('Additional field created successfully');
            }
            fetchAdditionalFields();
        } catch (error) {
            console.error('Error saving additional field', error);
            toast.error('Error saving additional field');
        } finally {
            dispatch(setLoading(false));
            setIsEditMode(false);
            setEditingAdditionalField(null);
            reset();
        }
    };

    const handleEdit = (additionalField: AdditionalFieldDto) => {
        setEditingAdditionalField(additionalField);
        setIsEditMode(true);
        setValue('additionalFieldName', additionalField.additionalFieldName);
        setValue('description', additionalField.description);
        setValue('additionalFieldTypeId', additionalField.additionalFieldTypeId);
    };

    const handleDelete = async (additionalField: AdditionalFieldDto) => {
        if (window.confirm(`Are you sure you want to delete the additional field "${additionalField.additionalFieldName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.AdditionalField.delete(accessId, additionalField.additionalFieldID);
                toast.success(`Additional field "${additionalField.additionalFieldName}" deleted successfully`);
                fetchAdditionalFields();
            } catch (error) {
                console.error('Error deleting additional field', error);
                toast.error('Error deleting additional field');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingAdditionalField(null);
                reset();
            }
        }
    };

    return (
        <CommonCard header="Field Settings">
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={12} md={4}>
                        <CustomInput
                            label="Field Name"
                            name="additionalFieldName"
                            register={register}
                            validationRules={{
                                required: 'Field Name cannot be empty.',
                            }}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <CustomInput
                            label="Description"
                            name="description"
                            register={register}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                    <CustomDropdown
							name="additionalFieldTypeId"
							label="Field Type"
							options={additionalFieldTypes.map(type => ({
                                value: type.additionalFieldTypeId,
                                label: type.additionalFieldTypeName,
                            }))}
							control={control}
							error={errors.additionalFieldTypeId}
							validationRules={{ required: 'Field Type cannot be empty.' }}
						/>
                        {/* <CustomSelect
                            label="Field Type"
                            name="additionalFieldTypeId"
                            register={register}
                            options={additionalFieldTypes.map(type => ({
                                value: type.additionalFieldTypeId,
                                label: type.additionalFieldTypeName,
                            }))}
                            validationRules={{
                                required: 'Field Type cannot be empty.',
                            }}
                        /> */}
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
            {additionalFields.length > 0 && (
                <CommonTable
                    data={additionalFields}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showSrNo
                />
            )}
        </CommonCard>
    );
};

export default AdditionalFieldSetting;
