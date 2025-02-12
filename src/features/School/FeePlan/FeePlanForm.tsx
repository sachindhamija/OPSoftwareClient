import { useForm } from 'react-hook-form';
import { Suspense, useEffect, useState } from 'react';
import agent from '../../../app/api/agent';
import { setLoading } from '../../../app/layout/loadingSlice';
import { useAppDispatch } from '../../../app/store/configureStore';
import toast from 'react-hot-toast';
import handleApiErrors from '../../../app/errors/handleApiErrors';
import { ColumnDef } from '@tanstack/react-table';
import { Col, Row } from 'react-bootstrap';
import {
	CommonCard,
	CommonModal,
	CommonTable,
	CustomButton,
	CustomDropdown,
	CustomInput,
	FormNavigator,
} from '../../../app/components/Components';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';
import { OptionType } from '../../../app/models/optionType';
import FeeHeadingForm from '../FeeHeading/feeHeadingForm';
import ClassForm from '../Class/classForm';
import SchoolCategoryForm from '../SchoolCategory/schoolCategoryForm';
import { convertNullOrEmptyToZero } from '../../../app/utils/numberUtils';

interface FeePlanFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}

function FeePlanForm({ isModalOpen = false, onSaveSuccess }:FeePlanFormProps) {
	const {
		register,
		handleSubmit,
		setValue,
		setFocus,
        control,
		formState: { isSubmitting, isValid, errors },
		reset,
	} = useForm<FeePlanDto>({ mode: 'all' });
	const accessId = getAccessIdOrRedirect();
	const dispatch = useAppDispatch();
	const [feePlans, setFeePlans] = useState<FeePlanDto[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingFeePlan, setEditingFeePlan] = useState<FeePlanDto | null>(
		null
	);
    // const [dataLoaded, setDataLoaded] = useState(false);
    const [feeHeadingModalShow, setFeeHeadingModalShow] = useState(false);
    const [feeHeadings, setFeeHeadings] = useState<OptionType[]>([]);
	const [classModalShow, setClassModalShow] = useState(false);
    const [classes, setClasses] = useState<OptionType[]>([]);
	const [schoolCategoryModalShow, setSchoolCategoryModalShow] = useState(false);
    const [schoolCategories, setSchoolCategories] = useState<OptionType[]>([]);
    

	const columns: ColumnDef<FeePlanDto>[] = [
		{
			accessorFn: (row) => row.feeHeadingName,
			id: 'feeHeadingName',
			header: 'Fee Heading Name',
			cell: (info) => info.getValue(),
		},
		{
			accessorFn: (row) => row.feePlanValue,
			id: 'feePlanValue',
			header: 'FeeValue',
			cell: (info) => info.getValue() ?? '',
		},
		{
			accessorFn: (row) => row.className,
			id: 'className',
			header: 'Class Name',
			cell: (info) => info.getValue() ?? '',
		},
		{
			accessorFn: (row) => row.schoolCategoryName,
			id: 'schoolCategoryName',
			header: 'Category Name',
			cell: (info) => info.getValue() ?? '',
		},
	];
	const getAllFeePlans = async () => {
		dispatch(setLoading(true));
		try {
			const fetchedFeePlans = await agent.FeePlan.getAllFeePlans(
				accessId
			);
			setFeePlans(fetchedFeePlans);
		} catch (error) {
			toast.error('Error fetching FeePlans');
		} finally {
			dispatch(setLoading(false));
		}
	};

	useEffect(() => {
		getAllFeePlans();
	}, [dispatch]);

	const onSubmit = async (data: FeePlanDto) => {
		dispatch(setLoading(true));
		const numericFields: (keyof FeePlanDto)[] = [
			'feePlanValue'
		]; // Process the data
		const processedData = convertNullOrEmptyToZero(data, numericFields);
		try {
			if (
				isEditMode &&
				editingFeePlan &&
				editingFeePlan.feePlanID !== undefined
			) {
				await agent.FeePlan.updateFeePlan(
					accessId,
					editingFeePlan.feePlanID,
					processedData
				);
				toast.success('Fee Plan updated successfully');
			} else {
				await agent.FeePlan.createFeePlan(accessId, processedData);
				toast.success('Fee Plan added successfully');
			}
			reset();
			setIsEditMode(false);
			setEditingFeePlan(null);
			if (onSaveSuccess && isModalOpen) {
				onSaveSuccess();
			}
			getAllFeePlans();
		} catch (error) {
			handleApiErrors(error);
		} finally {
			dispatch(setLoading(false));
		}
	};

	const handleEdit = (row: FeePlanDto) => {
		setEditingFeePlan(row);
		setIsEditMode(true);
		// Set values for all the fields
		setValue('feeHeadingID', row.feeHeadingID);
		setValue('classID', row.classID);
		setValue('schoolCategoryID', row.schoolCategoryID);
		setValue('feePlanValue', row.feePlanValue);
		// Focus on the first field
		setFocus('feeHeadingID');
	};

	const handleDelete = async (row: FeePlanDto) => {
		console.log(row)
		if (row.feePlanID === undefined) {
			toast.error('Error: Invalid Fee Plan ID');
			return;
		}
		if (
			window.confirm(
				`Are you sure you want to delete the Fee Plan "${row.feePlanValue}"?`
			)
		) {
			dispatch(setLoading(true));
			try {
				await agent.FeePlan.deleteFeePlan(accessId, row.feePlanID);
				toast.success(
					`Fee Plan "${row.feePlanValue}" deleted successfully`
				);
				getAllFeePlans();
			} catch (error) {
				toast.error('Error deleting Fee Plan');
			} finally {
				reset();
				setIsEditMode(false);
				setEditingFeePlan(null);
				dispatch(setLoading(false));
			}
		}
	};

	const loadFeeHeadings = async () => {
		try {
			const response = await agent.FeeHeading.getAllFeeHeadings(
				accessId
			);
			const formattedOptions = response.map(
				(feeHeading: FeeHeadingDto) => ({
					label: feeHeading.feeHeadingName,
					value: feeHeading.feeHeadingID,
				})
			);
			setFeeHeadings(formattedOptions);
		} catch (error) {
			console.error('Error fetching item categories', error);
		}
	};

	const loadClasses = async () => {
		try {
			const response = await agent.Class.getAllClasses(
				accessId
			);
			const formattedOptions = response.map(
				(classData: ClassDto) => ({
					label: classData.className,
					value: classData.classID,
				})
			);
			setClasses(formattedOptions);
		} catch (error) {
			console.error('Error fetching item categories', error);
		}
	};

	const loadSchoolCategories = async () => {
		try {
			const response = await agent.SchoolCategory.getAllSchoolCategories(
				accessId
			);
			const formattedOptions = response.map(
				(schoolCategories: SchoolCategoryDto) => ({
					label: schoolCategories.schoolCategoryName,
					value: schoolCategories.schoolCategoryID,
				})
			);
			setSchoolCategories(formattedOptions);
		} catch (error) {
			console.error('Error fetching item categories', error);
		}
	};

    useEffect(() => {
		const loadData = async () => {
			await Promise.all([
				loadFeeHeadings(),
				loadClasses(),
				loadSchoolCategories(),
			]);
			// setDataLoaded(true);
		};

		loadData();
	}, [accessId]);

	return (
		<CommonCard header="FeePlan" size="75%">
			<FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
				<Row>
					<Col xs={4}>
						<CustomDropdown
							label="Fee Heading"
							name="feeHeadingID"
							options={feeHeadings}
							control={control}
							validationRules={{
								required: 'Fee Heading is required.',
							}}
							error={errors.feeHeadingID}
							isCreatable={true}
							showCreateButton={true}
							onCreateButtonClick={() => {
								setFeeHeadingModalShow(true);
							}}
						/>
					</Col>
					<Col xs={4}>
					<CustomDropdown
							label="Class"
							name="classID"
							options={classes}
							control={control}
							validationRules={{
								required: 'Class is required.',
							}}
							error={errors.classID}
							isCreatable={true}
							showCreateButton={true}
							onCreateButtonClick={() => {
								setClassModalShow(true);
							}}
						/>
					</Col>
					<Col xs={4}>
					<CustomDropdown
							label="Category"
							name="schoolCategoryID"
							options={schoolCategories}
							control={control}
							validationRules={{
								required: 'Category is required.',
							}}
							error={errors.schoolCategoryID}
							isCreatable={true}
							showCreateButton={true}
							onCreateButtonClick={() => {
								setSchoolCategoryModalShow(true);
							}}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={4}>
						<CustomInput
							label="Fee Value"
							name="feePlanValue"
							type="number"
							register={register}
							allowedChars="numericDecimal"
						/>
					</Col>
					{/* <Col xs={4}>
						<CustomInput
							label="Composition (%)"
							name="composition"
							type="number"
							register={register}
							allowedChars="numericDecimal"
						/>
					</Col>
					<Col xs={4}>
						<CustomInput
							label="Cess (%)"
							name="cess"
							type="number"
							register={register}
							allowedChars="numericDecimal"
						/>
					</Col> */}
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
				data={feePlans}
				columns={columns}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

            <CommonModal
					show={feeHeadingModalShow}
					onHide={() => {setFeeHeadingModalShow(false);}}
                    >
					<Suspense fallback={<div>Loading...</div>}>
						<FeeHeadingForm onSaveSuccess={() => 
							{
								loadFeeHeadings();
								setFeeHeadingModalShow(false);
							 }} isModalOpen={feeHeadingModalShow} />
					</Suspense>
			</CommonModal>

			<CommonModal
					show={classModalShow}
					onHide={() => {setClassModalShow(false);}}
                    >
					<Suspense fallback={<div>Loading...</div>}>
						<ClassForm onSaveSuccess={() => 
							{
								loadClasses();
								setClassModalShow(false);
							 }} isModalOpen={classModalShow} />
					</Suspense>
			</CommonModal>

			<CommonModal
					show={schoolCategoryModalShow}
					onHide={() => {setSchoolCategoryModalShow(false);}}
                    >
					<Suspense fallback={<div>Loading...</div>}>
						<SchoolCategoryForm onSaveSuccess={() => 
							{
								loadSchoolCategories();
								setSchoolCategoryModalShow(false);
							 }} isModalOpen={schoolCategoryModalShow} />
					</Suspense>
			</CommonModal>
		</CommonCard>
	);
}

export default FeePlanForm;
