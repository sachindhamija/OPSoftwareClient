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

interface FeeHeadingFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}
function FeeHeadingForm({ isModalOpen = false, onSaveSuccess }:FeeHeadingFormProps) {
	const accessId = getAccessIdOrRedirect();
	const dispatch = useAppDispatch();
	const [feeheadings, setFeeHeadings] = useState<FeeHeadingDto[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingFeeHeading, setEditingFeeHeading] =
		useState<FeeHeadingDto | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		setFocus,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<FeeHeadingDto>();

	const columns: ColumnDef<FeeHeadingDto>[] = [
		{
			accessorFn: (row) => row.feeHeadingName,
			id: 'feeHeadingName',
			header: 'Fee Heading Name',
			cell: (info) => info.getValue(),
		},
	];

	useEffect(() => {
		fetchFeeHeadings();
	}, [accessId]);

	const fetchFeeHeadings = async () => {
		dispatch(setLoading(true));
		try {
			const data = await agent.FeeHeading.getAllFeeHeadings(
				accessId
			);
			setFeeHeadings(data);
		} catch (error) {
			console.error('Error fetching fee headings:', error);
			toast.error('Error fetching fee headings');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const onSubmit = async (data: FeeHeadingDto) => {
		dispatch(setLoading(true));
		try {
			if (editingFeeHeading?.feeHeadingID) {
				await agent.FeeHeading.updateFeeHeading(
					accessId,
					editingFeeHeading.feeHeadingID,
					data
				);
				toast.success('Fee Heading updated successfully');
			} else {
				await agent.FeeHeading.createFeeHeading(accessId, data);
				toast.success('Fee Heading added successfully');
			}
			resetForm();
			if (onSaveSuccess && isModalOpen) {
				onSaveSuccess();
			}
			fetchFeeHeadings();
		} catch (error) {
			console.error('Failed to submit fee heading:', error);
			toast.error('Failed to submit fee heading');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const resetForm = () => {
		reset();
		setIsEditMode(false);
		setEditingFeeHeading(null);
	};

	const handleEdit = (feeheading: FeeHeadingDto) => {
		setIsEditMode(true);
		setEditingFeeHeading(feeheading);
		setValue('feeHeadingName', feeheading.feeHeadingName);
		setFocus('feeHeadingName');
	};

	const handleDelete = async (row: FeeHeadingDto) => {
		if (row.feeHeadingID === undefined) {
			toast.error('Error: Invalid FeeHeading ID');
			return;
		}
		if (
			window.confirm(
				`Are you sure you want to delete the fee heading "${row.feeHeadingName}"?`
			)
		) {
			dispatch(setLoading(true));
			try {
				await agent.FeeHeading.deleteFeeHeading(
					accessId,
					row.feeHeadingID
				);
				toast.success(
					`FeeHeading "${row.feeHeadingName}" deleted successfully`
				);
				fetchFeeHeadings();
			} catch (error) {
				console.error('Error deleting fee heading:', error);
				toast.error('Error deleting fee heading');
			} finally {
				dispatch(setLoading(false));
				setIsEditMode(false);
				setEditingFeeHeading(null);
				reset();
				setFocus('feeHeadingName');
			}
		}
	};

	return (
		<CommonCard header="Fee Headings">
			<FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
				<Row>
					<Col xs={12} md={10}>
						<CustomInput
							className="mb-2 sm-mb-0"
							autoFocus
							label="Fee Heading Name"
							name="feeHeadingName"
							register={register}
							validationRules={{
								required: 'FeeHeading Name is required.',
							}}
							error={errors.feeHeadingName}
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
				data={feeheadings}
				columns={columns}
				onEdit={handleEdit}
				onDelete={handleDelete}
				showSrNo
			/>
		</CommonCard>
	);
}

export default FeeHeadingForm;
