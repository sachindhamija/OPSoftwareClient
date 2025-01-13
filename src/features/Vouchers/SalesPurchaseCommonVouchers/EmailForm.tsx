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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EmailFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
    invoiceHtml : string;
    originalCopyInvoice : boolean;
    officeCopyInvoice : boolean;
    customerCopyInvoice : boolean;
    duplicateCopyInvoice : boolean;
}
function EmailForm({ isModalOpen = false, onSaveSuccess, invoiceHtml,originalCopyInvoice,
                     officeCopyInvoice ,customerCopyInvoice,duplicateCopyInvoice}:EmailFormProps) {
	const accessId = getAccessIdOrRedirect();
	const dispatch = useAppDispatch();
	const [emails, setEmails] = useState<EmailDto[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingEmail, setEditingEmail] =
		useState<EmailDto | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		setFocus,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<EmailDto>();

	const columns: ColumnDef<EmailDto>[] = [
		{
			accessorFn: (row) => row.emailName,
			id: 'emailName',
			header: 'Email',
			cell: (info) => info.getValue(),
		},
	];

	useEffect(() => {
		fetchEmails();
	}, [accessId]);

	const fetchEmails = async () => {
		dispatch(setLoading(true));
		try {
			const data = await agent.Email.getAllEmails(
				accessId
			);
			setEmails(data);
		} catch (error) {
			console.error('Error fetching emails:', error);
			toast.error('Error fetching emails');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const onSubmit = async (data: EmailDto) => {
		dispatch(setLoading(true));
		try {
			if (editingEmail?.emailID) {
				await agent.Email.updateEmail(
					accessId,
					editingEmail.emailID,
					data
				);
				toast.success('Email updated successfully');
			} else {
				await agent.Email.createEmail(accessId, data);
				toast.success('Email added successfully');
			}
			resetForm();
			// if (onSaveSuccess && isModalOpen) {
			// 	onSaveSuccess();
			// }
			fetchEmails();
		} catch (error) {
			console.error('Failed to submit email:', error);
			toast.error('Failed to submit email');
		} finally {
			dispatch(setLoading(false));
		}
	};

	const resetForm = () => {
		reset();
		setIsEditMode(false);
		setEditingEmail(null);
	};

	const handleEdit = (email: EmailDto) => {
		setIsEditMode(true);
		setEditingEmail(email);
		setValue('emailName', email.emailName);
		setFocus('emailName');
	};

	const handleDelete = async (row: EmailDto) => {
		if (row.emailID === undefined) {
			toast.error('Error: Invalid item Email ID');
			return;
		}
		if (
			window.confirm(
				`Are you sure you want to delete the Email "${row.emailName}"?`
			)
		) {
			dispatch(setLoading(true));
			try {
				await agent.Email.deleteEmail(
					accessId,
					row.emailID
				);
				toast.success(
					`Email "${row.emailName}" deleted successfully`
				);
				fetchEmails();
			} catch (error) {
				console.error('Error deleting email:', error);
				toast.error('Error deleting email');
			} finally {
				dispatch(setLoading(false));
				setIsEditMode(false);
				setEditingEmail(null);
				reset();
				setFocus('emailName');
			}
		}
	};


    const sendEmails = async () => {
        dispatch(setLoading(true));
        try {
            const files: File[] = [];
    
            if (originalCopyInvoice) {
                const file = await generateInvoiceFile("Original Copy");
                files.push(file);
            }
            if (officeCopyInvoice) {
                const file = await generateInvoiceFile("Office Copy");
                files.push(file);
            }
            if (customerCopyInvoice) {
                const file = await generateInvoiceFile("Customer Copy");
                files.push(file);
            }
            if (duplicateCopyInvoice) {
                const file = await generateInvoiceFile("Duplicate Copy");
                files.push(file);
            }
            await agent.Email.sendEmails(accessId, files);
            toast.success('Emails sent successfully');
            if (onSaveSuccess && isModalOpen) {
                onSaveSuccess();
            }
        } catch (error) {
            console.error('Error sending emails:', error);
            toast.error('Error sending emails');
        } finally {
            dispatch(setLoading(false));
        }
    };
    

    const generateInvoiceFile = async (copyType: string): Promise<File> => {
        const container = document.createElement("div");
        container.style.width = "794px";
        container.style.margin = "auto";
        container.innerHTML = invoiceHtml.replace("{COPYTYPE}", copyType);
        document.body.appendChild(container);
    
        const canvas = await html2canvas(container, { scale: 2 });
        document.body.removeChild(container);
    
        const pdf = new jsPDF("p", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    
        const blob = pdf.output("blob");
        return new File([blob], `${copyType.replace(/\s+/g, "_")}_Invoice.pdf`, { type: "application/pdf" });
    };
    
    

	return (
		<CommonCard header="Email">
			<FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
				<Row>
					<Col xs={12} md={8}>
						<CustomInput
							className="mb-2 sm-mb-0"
							autoFocus
							label="Email"
							name="emailName"
							register={register}
							validationRules={{
								required: 'Email is required.',
							}}
							error={errors.emailName}
						/>
					</Col>
					<Col
						xs={12}
						md={4}
						className="d-flex align-items-center justify-content-md-start justify-content-end mt-2 mt-md-4 mb-2"
					>
						<CustomButton
							text={isEditMode ? 'Update' : 'Save'}
							variant="primary"
							type="submit"
							isSubmitting={isSubmitting}
							isValid={isValid}
							showAtEnd
						/>
                        <CustomButton
							text='Send'
							variant="success"
							type="button"
							showAtEnd
                            onClick={() => 
                                {
                                    sendEmails();
                                }
                            }
						/>
					</Col>
				</Row>
			</FormNavigator>
			<CommonTable
				data={emails}
				columns={columns}
				onEdit={handleEdit}
				onDelete={handleDelete}
				showSrNo
			/>
		</CommonCard>
	);
}

export default EmailForm;
