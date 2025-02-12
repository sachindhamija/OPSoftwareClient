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

interface ClassFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}
function ClassForm({ isModalOpen = false, onSaveSuccess }:ClassFormProps) {
	const accessId = getAccessIdOrRedirect();
	const dispatch = useAppDispatch();
	const [classes, setClasses] = useState<ClassDto[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingClass, setEditingClass] =
		useState<ClassDto | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		setFocus,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<ClassDto>();

	const columns: ColumnDef<ClassDto>[] = [
		{
			accessorFn: (row) => row.className,
			id: 'className',
			header: 'Class/Course Name',
			cell: (info) => info.getValue(),
		},
	];

	useEffect(() => {
		fetchClasses();
	}, [accessId]);

	const fetchClasses = async () => {
		dispatch(setLoading(true));
		try {
			const data = await agent.Class.getAllClasses(
				accessId
			);
			setClasses(data);
		} catch (error) {
			console.error('Error fetching classes:', error);
			toast.error('Error fetching classes');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const onSubmit = async (data: ClassDto) => {
		dispatch(setLoading(true));
		try {
			if (editingClass?.classID) {
				await agent.Class.updateClass(
					accessId,
					editingClass.classID,
					data
				);
				toast.success('Class updated successfully');
			} else {
				await agent.Class.createClass(accessId, data);
				toast.success('Class added successfully');
			}
			resetForm();
			if (onSaveSuccess && isModalOpen) {
				onSaveSuccess();
			}
			fetchClasses();
		} catch (error) {
			console.error('Failed to submit class:', error);
			toast.error('Failed to submit class');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const resetForm = () => {
		reset();
		setIsEditMode(false);
		setEditingClass(null);
	};

	const handleEdit = (classData: ClassDto) => {
		setIsEditMode(true);
		setEditingClass(classData);
		setValue('className', classData.className);
		setFocus('className');
	};

	const handleDelete = async (row: ClassDto) => {
		if (row.classID === undefined) {
			toast.error('Error: Invalid Class ID');
			return;
		}
		if (
			window.confirm(
				`Are you sure you want to delete the class "${row.className}"?`
			)
		) {
			dispatch(setLoading(true));
			try {
				await agent.Class.deleteClass(
					accessId,
					row.classID
				);
				toast.success(
					`Class "${row.className}" deleted successfully`
				);
				fetchClasses();
			} catch (error) {
				console.error('Error deleting class:', error);
				toast.error('Error deleting class');
			} finally {
				dispatch(setLoading(false));
				setIsEditMode(false);
				setEditingClass(null);
				reset();
				setFocus('className');
			}
		}
	};

	return (
		<CommonCard header="Class/Course">
			<FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
				<Row>
					<Col xs={12} md={10}>
						<CustomInput
							className="mb-2 sm-mb-0"
							autoFocus
							label="Class Name"
							name="className"
							register={register}
							validationRules={{
								required: 'Class Name is required.',
							}}
							error={errors.className}
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
				data={classes}
				columns={columns}
				onEdit={handleEdit}
				onDelete={handleDelete}
				showSrNo
			/>
		</CommonCard>
	);
}

export default ClassForm;
