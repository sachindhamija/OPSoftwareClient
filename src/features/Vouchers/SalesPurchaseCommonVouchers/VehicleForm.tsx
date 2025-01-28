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

interface VehicleFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}
function VehicleForm({ isModalOpen = false, onSaveSuccess}:VehicleFormProps) {
	const accessId = getAccessIdOrRedirect();
	const dispatch = useAppDispatch();
	const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingVehicle, setEditingVehicle] =
		useState<VehicleDto | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		setFocus,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<VehicleDto>();

	const columns: ColumnDef<VehicleDto>[] = [
		{
			accessorFn: (row) => row.vehicleNumber,
			id: 'vehicleNumber',
			header: 'Vehicle',
			cell: (info) => info.getValue(),
		},
	];

	useEffect(() => {
		fetchVehicles();
	}, [accessId]);

	const fetchVehicles = async () => {
		dispatch(setLoading(true));
		try {
			const data = await agent.Vehicle.getAllVehicles(
				accessId
			);
			setVehicles(data);
		} catch (error) {
			console.error('Error fetching vehicles:', error);
			toast.error('Error fetching vehicles');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const onSubmit = async (data: VehicleDto) => {
		dispatch(setLoading(true));
		try {
			if (editingVehicle?.vehicleId) {
				await agent.Vehicle.updateVehicle(
					accessId,
					editingVehicle.vehicleId,
					data
				);
				toast.success('Vehicle updated successfully');
			} else {
				await agent.Vehicle.createVehicle(accessId, data);
				toast.success('Vehicle added successfully');
			}
			resetForm();
			// if (onSaveSuccess && isModalOpen) {
			// 	onSaveSuccess();
			// }
			fetchVehicles();
            if (onSaveSuccess && isModalOpen) {
                onSaveSuccess();
            }
		} catch (error) {
			console.error('Failed to submit vehicle:', error);
			toast.error('Failed to submit vehicle');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const resetForm = () => {
		reset();
		setIsEditMode(false);
		setEditingVehicle(null);
	};

	const handleEdit = (vehicle: VehicleDto) => {
		setIsEditMode(true);
		setEditingVehicle(vehicle);
		setValue('vehicleNumber', vehicle.vehicleNumber);
		setFocus('vehicleNumber');
	};

	const handleDelete = async (row: VehicleDto) => {
		if (row.vehicleId === undefined) {
			toast.error('Error: Invalid item Vehicle ID');
			return;
		}
		if (
			window.confirm(
				`Are you sure you want to delete the Vehicle "${row.vehicleNumber}"?`
			)
		) {
			dispatch(setLoading(true));
			try {
				await agent.Vehicle.deleteVehicle(
					accessId,
					row.vehicleId
				);
				toast.success(
					`Vehicle "${row.vehicleNumber}" deleted successfully`
				);
				fetchVehicles();
			} catch (error) {
				console.error('Error deleting vehicle:', error);
				toast.error('Error deleting vehicle');
			} finally {
				dispatch(setLoading(false));
				setIsEditMode(false);
				setEditingVehicle(null);
				reset();
				setFocus('vehicleNumber');
			}
		}
	};

	return (
		<CommonCard header="Vehicle">
			<FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
				<Row>
					<Col xs={12} md={8}>
						<CustomInput
							className="mb-2 sm-mb-0"
							autoFocus
							label="Vehicle"
							name="vehicleNumber"
							register={register}
							validationRules={{
								required: 'Vehicle is required.',
							}}
							error={errors.vehicleNumber}
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
				data={vehicles}
				columns={columns}
				onEdit={handleEdit}
				onDelete={handleDelete}
				showSrNo
			/>
		</CommonCard>
	);
}

export default VehicleForm;
