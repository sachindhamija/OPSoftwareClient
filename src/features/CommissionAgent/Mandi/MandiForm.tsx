import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import agent from '../../../app/api/agent';
import { setLoading, setTableLoading } from '../../../app/layout/loadingSlice';
import { useAppDispatch } from '../../../app/store/configureStore';
import toast from 'react-hot-toast';
import handleApiErrors from '../../../app/errors/handleApiErrors';
import { ColumnDef } from '@tanstack/react-table';
import { Col, Row } from 'react-bootstrap';
import {
    CommonCard,
    CommonTable,
    CustomButton,
    CustomInput,
    FormNavigator,
} from '../../../app/components/Components';
import { MandiDto } from './mandiDto';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';

function MandiForm() {
    const {
        register,
        handleSubmit,
        setValue,
        setFocus,
        formState: { isSubmitting, isValid },
        reset,
    } = useForm<MandiDto>();
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [mandis, setMandis] = useState<MandiDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingMandi, setEditingMandi] = useState<MandiDto | null>(null);

    const columns: ColumnDef<MandiDto>[] = [
        {
            accessorFn: (row) => row.mandiName,
            id: 'mandiName',
            header: 'Mandi Name',
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.licenseNo,
            id: 'licenseNo',
            header: 'License No',
            cell: (info) => info.getValue() ?? '',
        },
        {
            accessorFn: (row) => row.address,
            id: 'address',
            header: 'Address',
            cell: (info) => info.getValue() ?? '',
        },
    ];

    const getAllMandis = async () => {
        dispatch(setTableLoading(true));
        try {
            const fetchedMandis = await agent.Mandi.getAllMandis(accessId);
            setMandis(fetchedMandis);
        } catch (error) {
            toast.error('Error fetching Mandis');
        } finally {
            dispatch(setTableLoading(false));
        }
    };

    useEffect(() => {
        getAllMandis();
    }, [dispatch]);

    const onSubmit = async (data: MandiDto) => {
        dispatch(setLoading(true));
        try {
            if (isEditMode && editingMandi && editingMandi.id !== undefined) {
                console.log(editingMandi.id);
                await agent.Mandi.updateMandi(accessId, editingMandi.id, data);
                toast.success('Mandi updated successfully');
            } else {
                await agent.Mandi.createMandi(accessId, data);
                toast.success('Mandi added successfully');
            }
            reset();
            setIsEditMode(false);
            setEditingMandi(null);
            getAllMandis();
        } catch (error) {
            handleApiErrors(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleEdit = (row: MandiDto) => {
        setEditingMandi(row);
        setIsEditMode(true);
        setValue('mandiName', row.mandiName);
        setValue('licenseNo', row.licenseNo);
        setValue('address', row.address);
        setFocus('mandiName');
    };

    const handleDelete = async (row: MandiDto) => {
        if (row.id === undefined) {
            toast.error('Error: Invalid Mandi ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the Mandi "${row.mandiName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.Mandi.deleteMandi(accessId, row.id);
                toast.success(`Mandi "${row.mandiName}" deleted successfully`);
                getAllMandis();
            } catch (error) {
                toast.error('Error deleting Mandi');
            } finally {
                reset();
                setIsEditMode(false);
                setEditingMandi(null);
                dispatch(setLoading(false));
            }
        }
    };

    return (
        <CommonCard header="Mandi" size="50%">
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={12}>
                        <CustomInput
                            label="Mandi Name"
                            name="mandiName"
                            register={register}
                            validationRules={{
                                required: 'Mandi Name cannot be empty.',
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <CustomInput
                            label="License No"
                            name="licenseNo"
                            register={register}
                            validationRules={{
                                required: 'License No cannot be empty.',
                            }}
                        />
                    </Col>
                    <Col xs={12}>
                        <CustomInput
                            label="Address"
                            name="address"
                            register={register}
                            validationRules={{
                                required: 'Address cannot be empty.',
                            }}
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
                data={mandis}
                columns={columns}
                onRowClick={handleEdit}
                onDelete={handleDelete}
            />
        </CommonCard>
    );
}

export default MandiForm;
