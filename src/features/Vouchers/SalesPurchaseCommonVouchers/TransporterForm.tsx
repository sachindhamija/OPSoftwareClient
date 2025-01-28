import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import agent from '../../../app/api/agent';
import { setLoading } from '../../../app/layout/loadingSlice';
import { useAppDispatch } from '../../../app/store/configureStore';
import {
	CommonCard,
	CommonTable,
	CustomButton,
	CustomInput,
	FormNavigator,
} from '../../../app/components/Components';
import { Col, Row } from 'react-bootstrap';
import { ColumnDef } from '@tanstack/react-table';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';

interface TransporterFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}
function TransporterForm({ isModalOpen = false, onSaveSuccess}:TransporterFormProps) {
	const accessId = getAccessIdOrRedirect();
	const dispatch = useAppDispatch();
	const [transporters, setTransporters] = useState<TransporterDto[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingTransporter, setEditingTransporter] =
		useState<TransporterDto | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		setFocus,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<TransporterDto>();

	const columns: ColumnDef<TransporterDto>[] = [
		{
			accessorFn: (row) => row.transporterName,
			id: 'transporterName',
			header: 'Transporter',
			cell: (info) => info.getValue(),
		},
	];

	useEffect(() => {
		fetchTransporters();
	}, [accessId]);

	const fetchTransporters = async () => {
		dispatch(setLoading(true));
		try {
			const data = await agent.Transporter.getAllTransporters(
				accessId
			);
			setTransporters(data);
		} catch (error) {
			console.error('Error fetching transporters:', error);
			toast.error('Error fetching transporters');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const onSubmit = async (data: TransporterDto) => {
		dispatch(setLoading(true));
		try {
			if (editingTransporter?.transporterId) {
				await agent.Transporter.updateTransporter(
					accessId,
					editingTransporter.transporterId,
					data
				);
				toast.success('Transporter updated successfully');
			} else {
				await agent.Transporter.createTransporter(accessId, data);
				toast.success('Transporter added successfully');
			}
			resetForm();
			// if (onSaveSuccess && isModalOpen) {
			// 	onSaveSuccess();
			// }
			fetchTransporters();
            if (onSaveSuccess && isModalOpen) {
                onSaveSuccess();
            }
		} catch (error) {
			console.error('Failed to submit transporter:', error);
			toast.error('Failed to submit transporter');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const resetForm = () => {
		reset();
		setIsEditMode(false);
		setEditingTransporter(null);
	};

	const handleEdit = (transporter: TransporterDto) => {
		setIsEditMode(true);
		setEditingTransporter(transporter);
		setValue('transporterName', transporter.transporterName);
		setFocus('transporterName');
	};

	const handleDelete = async (row: TransporterDto) => {
		if (row.transporterId === undefined) {
			toast.error('Error: Invalid item Transporter ID');
			return;
		}
		if (
			window.confirm(
				`Are you sure you want to delete the Transporter "${row.transporterName}"?`
			)
		) {
			dispatch(setLoading(true));
			try {
				await agent.Transporter.deleteTransporter(
					accessId,
					row.transporterId
				);
				toast.success(
					`Transporter "${row.transporterName}" deleted successfully`
				);
				fetchTransporters();
			} catch (error) {
				console.error('Error deleting transporter:', error);
				toast.error('Error deleting transporter');
			} finally {
				dispatch(setLoading(false));
				setIsEditMode(false);
				setEditingTransporter(null);
				reset();
				setFocus('transporterName');
			}
		}
	};

	return (
        <CommonCard header="Transporter">
			<FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
				<Row>
					<Col xs={12} md={8}>
						<CustomInput
							className="mb-2 sm-mb-0"
							autoFocus
							label="Transporter"
							name="transporterName"
							register={register}
							validationRules={{
								required: 'Transporter is required.',
							}}
							error={errors.transporterName}
						/>
					</Col>
					<Col
						xs={12}
						md={2}
						className="d-flex align-items-center justify-content-end justify-content-md-start mt-2 mt-md-4 mb-2"
					>
						<CustomButton
							text={isEditMode ? 'Update' : 'Save'}
							variant="primary"
							type="submit"
							isSubmitting={isSubmitting}
							isValid={isValid}
							showAtEnd
						/>
					</Col>
				</Row>
			</FormNavigator>
			<CommonTable
				data={transporters}
				columns={columns}
				onEdit={handleEdit}
				onDelete={handleDelete}
				showSrNo
			/>
		</CommonCard>
	);
}

export default TransporterForm;
