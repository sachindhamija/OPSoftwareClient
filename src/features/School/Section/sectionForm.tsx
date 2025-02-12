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

interface SectionFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}
function SectionForm({ isModalOpen = false, onSaveSuccess }:SectionFormProps) {
	const accessId = getAccessIdOrRedirect();
	const dispatch = useAppDispatch();
	const [sections, setSections] = useState<SectionDto[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingSection, setEditingSection] =
		useState<SectionDto | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		setFocus,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<SectionDto>();

	const columns: ColumnDef<SectionDto>[] = [
		{
			accessorFn: (row) => row.sectionName,
			id: 'sectionName',
			header: 'Section Name',
			cell: (info) => info.getValue(),
		},
	];

	useEffect(() => {
		fetchSections();
	}, [accessId]);

	const fetchSections = async () => {
		dispatch(setLoading(true));
		try {
			const data = await agent.Section.getAllSections(
				accessId
			);
			setSections(data);
		} catch (error) {
			console.error('Error fetching sections:', error);
			toast.error('Error fetching sections');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const onSubmit = async (data: SectionDto) => {
		dispatch(setLoading(true));
		try {
			if (editingSection?.sectionID) {
				await agent.Section.updateSection(
					accessId,
					editingSection.sectionID,
					data
				);
				toast.success('Section updated successfully');
			} else {
				await agent.Section.createSection(accessId, data);
				toast.success('Section added successfully');
			}
			resetForm();
			if (onSaveSuccess && isModalOpen) {
				onSaveSuccess();
			}
			fetchSections();
		} catch (error) {
			console.error('Failed to submit section:', error);
			toast.error('Failed to submit section');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const resetForm = () => {
		reset();
		setIsEditMode(false);
		setEditingSection(null);
	};

	const handleEdit = (section: SectionDto) => {
		setIsEditMode(true);
		setEditingSection(section);
		setValue('sectionName', section.sectionName);
		setFocus('sectionName');
	};

	const handleDelete = async (row: SectionDto) => {
		if (row.sectionID === undefined) {
			toast.error('Error: Invalid Section ID');
			return;
		}
		if (
			window.confirm(
				`Are you sure you want to delete the section "${row.sectionName}"?`
			)
		) {
			dispatch(setLoading(true));
			try {
				await agent.Section.deleteSection(
					accessId,
					row.sectionID
				);
				toast.success(
					`Section "${row.sectionName}" deleted successfully`
				);
				fetchSections();
			} catch (error) {
				console.error('Error deleting section:', error);
				toast.error('Error deleting section');
			} finally {
				dispatch(setLoading(false));
				setIsEditMode(false);
				setEditingSection(null);
				reset();
				setFocus('sectionName');
			}
		}
	};

	return (
		<CommonCard header="Section">
			<FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
				<Row>
					<Col xs={12} md={10}>
						<CustomInput
							className="mb-2 sm-mb-0"
							autoFocus
							label="Section Name"
							name="sectionName"
							register={register}
							validationRules={{
								required: 'Section Name is required.',
							}}
							error={errors.sectionName}
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
				data={sections}
				columns={columns}
				onEdit={handleEdit}
				onDelete={handleDelete}
				showSrNo
			/>
		</CommonCard>
	);
}

export default SectionForm;
