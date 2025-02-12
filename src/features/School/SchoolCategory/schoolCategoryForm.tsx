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

interface SchoolCategoryFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}
function SchoolCategoryForm({ isModalOpen = false, onSaveSuccess }:SchoolCategoryFormProps) {
	const accessId = getAccessIdOrRedirect();
	const dispatch = useAppDispatch();
	const [schoolCategories, setSchoolCategories] = useState<SchoolCategoryDto[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingSchoolCategory, setEditingSchoolCategory] =
		useState<SchoolCategoryDto | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		setFocus,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<SchoolCategoryDto>();

	const columns: ColumnDef<SchoolCategoryDto>[] = [
		{
			accessorFn: (row) => row.schoolCategoryName,
			id: 'schoolCategoryName',
			header: 'Category Name',
			cell: (info) => info.getValue(),
		},
	];

	useEffect(() => {
		fetchSchoolCategories();
	}, [accessId]);

	const fetchSchoolCategories = async () => {
		dispatch(setLoading(true));
		try {
			const data = await agent.SchoolCategory.getAllSchoolCategories(
				accessId
			);
			setSchoolCategories(data);
		} catch (error) {
			console.error('Error fetching school categories:', error);
			toast.error('Error fetching school categories');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const onSubmit = async (data: SchoolCategoryDto) => {
		dispatch(setLoading(true));
		try {
			if (editingSchoolCategory?.schoolCategoryID) {
				await agent.SchoolCategory.updateSchoolCategory(
					accessId,
					editingSchoolCategory.schoolCategoryID,
					data
				);
				toast.success('School category updated successfully');
			} else {
				await agent.SchoolCategory.createSchoolCategory(accessId, data);
				toast.success('School category added successfully');
			}
			resetForm();
			if (onSaveSuccess && isModalOpen) {
				onSaveSuccess();
			}
			fetchSchoolCategories();
		} catch (error) {
			console.error('Failed to submit school category:', error);
			toast.error('Failed to submit school category');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const resetForm = () => {
		reset();
		setIsEditMode(false);
		setEditingSchoolCategory(null);
	};

	const handleEdit = (schoolCategory: SchoolCategoryDto) => {
		setIsEditMode(true);
		setEditingSchoolCategory(schoolCategory);
		setValue('schoolCategoryName', schoolCategory.schoolCategoryName);
		setFocus('schoolCategoryName');
	};

	const handleDelete = async (row: SchoolCategoryDto) => {
		if (row.schoolCategoryID === undefined) {
			toast.error('Error: Invalid school Category ID');
			return;
		}
		if (
			window.confirm(
				`Are you sure you want to delete the school Category "${row.schoolCategoryName}"?`
			)
		) {
			dispatch(setLoading(true));
			try {
				await agent.SchoolCategory.deleteSchoolCategory(
					accessId,
					row.schoolCategoryID
				);
				toast.success(
					`School Category "${row.schoolCategoryName}" deleted successfully`
				);
				fetchSchoolCategories();
			} catch (error) {
				console.error('Error deleting school Category:', error);
				toast.error('Error deleting school Category');
			} finally {
				dispatch(setLoading(false));
				setIsEditMode(false);
				setEditingSchoolCategory(null);
				reset();
				setFocus('schoolCategoryName');
			}
		}
	};

	return (
		<CommonCard header="School Category">
			<FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
				<Row>
					<Col xs={12} md={10}>
						<CustomInput
							className="mb-2 sm-mb-0"
							autoFocus
							label="School Category Name"
							name="schoolCategoryName"
							register={register}
							validationRules={{
								required: 'School Category Name is required.',
							}}
							error={errors.schoolCategoryName}
						/>
					</Col>
					<Col
						xs={12}
						md={2}
						className="d-flex align-schools-center justify-content-end justify-content-md-start mt-2 mt-md-4 mb-2"
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
				data={schoolCategories}
				columns={columns}
				onEdit={handleEdit}
				onDelete={handleDelete}
				showSrNo
			/>
		</CommonCard>
	);
}

export default SchoolCategoryForm;
