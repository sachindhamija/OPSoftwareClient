import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import agent from '../../../app/api/agent';
import { setLoading } from '../../../app/layout/loadingSlice';
import { useAppDispatch, useAppSelector } from '../../../app/store/configureStore';
import toast from 'react-hot-toast';
import handleApiErrors from '../../../app/errors/handleApiErrors';
import { ColumnDef } from '@tanstack/react-table';
import { Col, Row } from 'react-bootstrap';
import {
    CommonCard,
    CommonTable,
    CustomButton,
    CustomDateInputBox,
    CustomInput,
    FormNavigator,
} from '../../../app/components/Components';
import { convertNullOrEmptyToZero } from '../../../app/utils/numberUtils';
import { getAccessIdOrRedirect } from '../Company/CompanyInformation';
import { BatchNumberDto } from '../Item/ItemDto';
import { selectCurrentFinancialYear } from '../FinancialYear/financialYearSlice';

interface BatchFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}

function BatchForm({ isModalOpen = false, onSaveSuccess }: BatchFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        setFocus,
        formState: { isSubmitting, isValid },
        reset,
    } = useForm<BatchNumberDto>();
    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const dispatch = useAppDispatch();
    const [batches, setBatches] = useState<BatchNumberDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBatch, setEditingBatch] = useState<BatchNumberDto | null>(null);

    const columns: ColumnDef<BatchNumberDto>[] = [
        {
            accessorFn: (row) => row.batchNo,
            id: 'batchNo',
            header: 'Batch Number',
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.manufacturingDate,
            id: 'manufacturingDate',
            header: 'Manufacturing Date',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.expiryDate,
            id: 'expiryDate',
            header: 'Expiry Date',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.mrp,
            id: 'mrp',
            header: 'MRP',
            cell: (info) => info.getValue() ?? '',
        },
    ];

    const getAllBatches = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedBatches = await agent.BatchNumber.getAllBatches(accessId);
            setBatches(fetchedBatches);
        } catch (error) {
            toast.error('Error fetching batches');
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllBatches();
    }, [dispatch]);

    const onSubmit = async (data: BatchNumberDto) => {
        dispatch(setLoading(true));
        const numericFields: (keyof BatchNumberDto)[] = [
            'mrp',
            'priceToStockList',
            'priceToRetailer',
            'costPrice',
            'openingPacks',
            'openingLoose',
            'openingValue',
        ];
        const processedData = convertNullOrEmptyToZero(data, numericFields);
        
        try {
            if (isEditMode && editingBatch && editingBatch.batchId !== undefined) {
                await agent.BatchNumber.updateBatch(accessId, editingBatch.batchId, processedData);
                toast.success('Batch updated successfully');
            } else {
                await agent.BatchNumber.createBatch(accessId, processedData);
                toast.success('Batch added successfully');
            }
            reset();
            setIsEditMode(false);
            setEditingBatch(null);
            if (onSaveSuccess && isModalOpen) {
                onSaveSuccess();
            }
            getAllBatches();
        } catch (error) {
            handleApiErrors(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleEdit = (row: BatchNumberDto) => {
        setEditingBatch(row);
        setIsEditMode(true);
        setValue('batchNo', row.batchNo || '');
        setValue('manufacturingDate', row.manufacturingDate || '');
        setValue('expiryDate', row.expiryDate || '');
        setValue('mrp', row.mrp);
        setValue('priceToStockList', row.priceToStockList);
        setValue('priceToRetailer', row.priceToRetailer);
        setValue('costPrice', row.costPrice);
        setValue('openingPacks', row.openingPacks);
        setValue('openingLoose', row.openingLoose);
        setValue('openingValue', row.openingValue);
        setFocus('batchNo');
    };

    const handleDelete = async (row: BatchNumberDto) => {
        if (row.batchId === undefined) {
            toast.error('Error: Invalid Batch ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete batch "${row.batchNo}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.BatchNumber.deleteBatch(accessId, row.batchId);
                toast.success(`Batch "${row.batchNo}" deleted successfully`);
                getAllBatches();
            } catch (error) {
                toast.error('Error deleting batch');
            } finally {
                reset();
                setIsEditMode(false);
                setEditingBatch(null);
                dispatch(setLoading(false));
            }
        }
    };

    return (
        <CommonCard header="Batch Management" size="75%">
            <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
                <Row>
                    <Col xs={12} md={6}>
                        <CustomInput
                            label="Batch Number"
                            name="batchNo"
                            register={register}
                            validationRules={{ required: 'Batch number is required' }}
                        />
                    </Col>
                    <Col xs={6} md={3}>
                        <CustomDateInputBox
                            label="Manufacturing Date"
                            name="manufacturingDate"
                            register={register}
                            setValue={setValue}
                            validationRules={{ required: 'Manufacturing date is required' }}
                            financialYear={financialYear}
                        />
                    </Col>
                    <Col xs={6} md={3}>
                        <CustomDateInputBox
                            label="Expiry Date"
                            name="expiryDate"
                            register={register}
                            setValue={setValue}
                            validationRules={{ required: 'Expiry date is required' }}
                            financialYear={financialYear}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={6} md={3}>
                        <CustomInput
                            label="MRP"
                            name="mrp"
                            type="number"
                            register={register}
                            allowedChars="numericDecimal"
                            validationRules={{ required: 'MRP is required' }}
                        />
                    </Col>
                    <Col xs={6} md={3}>
                        <CustomInput
                            label="Stock List Price"
                            name="priceToStockList"
                            type="number"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={6} md={3}>
                        <CustomInput
                            label="Retailer Price"
                            name="priceToRetailer"
                            type="number"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={6} md={3}>
                        <CustomInput
                            label="Cost Price"
                            name="costPrice"
                            type="number"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={4}>
                        <CustomInput
                            label="Opening Packs"
                            name="openingPacks"
                            type="number"
                            register={register}
                            allowedChars="numeric"
                        />
                    </Col>
                    <Col xs={4}>
                        <CustomInput
                            label="Opening Loose"
                            name="openingLoose"
                            type="number"
                            register={register}
                            allowedChars="numeric"
                        />
                    </Col>
                    <Col xs={4}>
                        <CustomInput
                            label="Opening Value"
                            name="openingValue"
                            type="number"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} className="d-flex justify-content-end my-3">
                        <CustomButton
                            text={isEditMode ? 'Update' : 'Save'}
                            variant="primary"
                            type="submit"
                            isSubmitting={isSubmitting}
                            isValid={isValid}
                        />
                    </Col>
                </Row>
            </FormNavigator>

            <CommonTable
                data={batches}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </CommonCard>
    );
}

export default BatchForm;