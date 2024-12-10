import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import agent from '../../../app/api/agent';
import { setLoading } from '../../../app/layout/loadingSlice';
import { useAppDispatch } from '../../../app/store/configureStore';
import toast from 'react-hot-toast';
import handleApiErrors from '../../../app/errors/handleApiErrors';
import { ColumnDef } from '@tanstack/react-table';
import { Col, Row } from 'react-bootstrap';
import {
    CommonCard,
    CommonTable,
    CustomButton,
    CustomDropdown,
    CustomInput,
    FormNavigator,
} from '../../../app/components/Components';

import { convertNullOrEmptyToZero } from '../../../app/utils/numberUtils';
import { IJFormDto } from './IJFormDto';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';


const PRICE_PER = [
    { label: 'Bag', value: 'Bag' },
    { label: 'Qtl', value: 'Qtl' },
];

function IJForm() {
    const {
        register,
        handleSubmit,
        setValue,
        setFocus,
        formState: { isSubmitting, isValid },
        reset,
        control
    } = useForm<IJFormDto>();
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [items, setItems] = useState<IJFormDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<IJFormDto | null>(null);

    const columns: ColumnDef<IJFormDto>[] = [
        {
            accessorFn: (row) => row.itemName,
            id: 'itemName',
            header: 'Item Name',
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.weightPerBag,
            id: 'weightPerBag',
            header: 'Weight/Bag',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.utraiPerBag,
            id: 'utraiPerBag',
            header: 'Utrai/Bag',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.chhanaiPerBag,
            id: 'chhanaiPerBag',
            header: 'Chhanai/Bag',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.tulaiPerBag,
            id: 'tulaiPerBag',
            header: 'Tulai/Bag',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.silaiPerBag,
            id: 'silaiPerBag',
            header: 'Silai/Bag',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.loadingPerBag,
            id: 'loadingPerBag',
            header: 'Loading/Bag',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.dammi,
            id: 'dammi',
            header: 'Dammi',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.rate,
            id: 'rate',
            header: 'Rate',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.ratePer,
            id: 'ratePer',
            header: 'Rate Per',
            cell: (info) => info.getValue() ?? '',
        },
    ];

    const getAllItems = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedItems = await agent.CommissionAgentItem.getAllCommissionAgentItems(accessId);
            setItems(fetchedItems);
        } catch (error) {
            toast.error('Error fetching Commission Agent Items');
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllItems();
    }, [dispatch]);

    const onSubmit = async (data: IJFormDto) => {
        dispatch(setLoading(true));
        const numericFields: (keyof IJFormDto)[] = [
            'weightPerBag',
            'utraiPerBag',
            'chhanaiPerBag',
            'tulaiPerBag',
            'silaiPerBag',
            'loadingPerBag',
            'dammi',
            'rate',
        ]; // Process the data
        const processedData = convertNullOrEmptyToZero(data, numericFields);
        try {
            if (isEditMode && editingItem && editingItem.id !== undefined) {
                await agent.CommissionAgentItem.updateCommissionAgentItem(
                    accessId,
                    editingItem.id,
                    processedData
                );
                toast.success('Commission Agent Item updated successfully');
            } else {
                await agent.CommissionAgentItem.createCommissionAgentItem(accessId, processedData);
                toast.success('Commission Agent Item added successfully');
            }
            reset();
            setFocus("itemName");
            setIsEditMode(false);
            setEditingItem(null);
            getAllItems();
        } catch (error) {
            handleApiErrors(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleEdit = (row: IJFormDto) => {
        setEditingItem(row);
        setIsEditMode(true);
        setValue('itemName', row.itemName);
        setValue('weightPerBag', row.weightPerBag);
        setValue('utraiPerBag', row.utraiPerBag);
        setValue('chhanaiPerBag', row.chhanaiPerBag);
        setValue('tulaiPerBag', row.tulaiPerBag);
        setValue('silaiPerBag', row.silaiPerBag);
        setValue('loadingPerBag', row.loadingPerBag);
        setValue('dammi', row.dammi);
        setValue('rate', row.rate);
        setValue('ratePer', row.ratePer);
        setFocus('itemName');
    };

    const handleDelete = async (row: IJFormDto) => {
        if (row.id === undefined) {
            toast.error('Error: Invalid Item ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the item "${row.itemName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.CommissionAgentItem.deleteCommissionAgentItem(accessId, row.id);
                toast.success(`Item "${row.itemName}" deleted successfully`);
                getAllItems();
            } catch (error) {
                toast.error('Error deleting item');
            } finally {
                reset();
                setFocus("itemName");
                setIsEditMode(false);
                setEditingItem(null);
                dispatch(setLoading(false));
            }
        }
    };

    return (
        <CommonCard header="J-Form" size="100%">
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={12}>
                        <CustomInput
                            label="Item Name"
                            name="itemName"
                            register={register}
                            validationRules={{
                                required: 'Item Name cannot be empty.',
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={2}>
                        <CustomInput
                            label="Weight/Bag"
                            name="weightPerBag"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={2}>
                        <CustomInput
                            label="Utrai/Bag"
                            name="utraiPerBag"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={2}>
                        <CustomInput
                            label="Chhanai/Bag"
                            name="chhanaiPerBag"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>

                    <Col xs={2}>
                        <CustomInput
                            label="Tulai/Bag"
                            name="tulaiPerBag"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={2}>
                        <CustomInput
                            label="Silai/Bag"
                            name="silaiPerBag"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={2}>
                        <CustomInput
                            label="Loading/Bag"
                            name="loadingPerBag"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={2}>
                        <CustomInput
                            label="Dammi"
                            name="dammi"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={2}>
                        <CustomInput
                            label="Rate"
                            name="rate"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={2}>
                        <CustomDropdown
                            label="Rate Per"
                            name="ratePer"
                            options={PRICE_PER}
                            control={control}
                            validationRules={{
                                required: 'Rate Per cannot be empty.',
                            }}
                        />
                    </Col>
                    <Col xs={2} className="d-flex align-items-end">
                        <CustomButton className='align-items-center'
                            text={isEditMode ? 'Update' : 'Save'}
                            variant="primary"
                            type="submit"
                            isSubmitting={isSubmitting}
                            isValid={isValid}
                        />
                    </Col>
                </Row>
            </FormNavigator>

            <div className='mt-3'>
                <CommonTable
                    data={items}
                    columns={columns}
                    onRowClick={handleEdit}
                    onDelete={handleDelete}
                />
            </div >
        </CommonCard>
    );
}

export default IJForm;
