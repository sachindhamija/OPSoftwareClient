// import React, { Suspense, useEffect, useState } from 'react'
// import { Table, Button, Form, FormControl, Modal } from 'react-bootstrap';
// import { OtherChargesDto } from './salePurchaseVoucherDto';
// import { useForm } from 'react-hook-form';
// import { useGstSlabs } from '../../../app/hooks/useGSTSlabsOptions';
// import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';
// import CustomDropdown from '../../../app/components/CustomDropdown';
// import { useAccountGroups } from '../../../app/hooks/useAccountGroupsOptions';
// import CommonModal from '../../../app/components/CommonModal';
// import AccountGroupForm from '../../Masters/AccountGroup/AccountGroupForm';
// interface OtherChargesModalProps {
//   show: boolean;
//   onHide: () => void;
//   onSave: (data: OtherChargesDto[]) => void;
//   initialData: OtherChargesDto[];
// }
const OtherCharges= () => {
  // const OtherCharges: React.FC<OtherChargesModalProps> = ({ show, onHide, onSave, initialData }) => {
  // const accessId = getAccessIdOrRedirect();
  // const gstSlabs = useGstSlabs(accessId);
  // const accountGroupOptions = useAccountGroups(accessId);
  // const [charges, setCharges] = useState<OtherChargesDto[]>([]);
  // const [modalShow, setModalShow] = useState(false);
  // const {
	// 	control,
	// 	formState: { errors },
	// 	reset,
	// } = useForm<OtherChargesDto[]>({
	// 	mode: 'all',
	// });
  // const handleAddRow = () => {
  //   const newCharge = {
  //     key: charges.length + 1,
  //     accountId: '',
  //     onValue: 0,
  //     chargesPercentage: 0,
  //     addedOrSubtracted: '+', // Default to plus sign, you can adjust as needed
  //     tax: 'no',
  //     taxSlab: '',
  //     grossAmount: 0,
  //     sGST: 0,
  //     cGST: 0,
  //     iGST: 0,
  //     netCharges: 0,
  //   };
  //   setCharges([...charges, newCharge]);
  // };
  // // const { register, reset } = useForm<OtherChargesDto[]>({
  // //   defaultValues: initialData
  // // });

  // const [formData, setFormData] = useState<OtherChargesDto[]>(initialData);

  // useEffect(() => {
  //   reset(initialData);
  // }, [initialData, reset]);

  // const handleSaveAndClose = () => {
  //   onSave(formData);
  //   onHide();
  // };

  // // const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
  // //     if (event.key === 'Enter' || event.key === 'Tab') {
  // //         event.preventDefault();
  // //         handleSaveAndClose();
  // //     }
  // // };
  // const handleFieldChange = (key:number, field:string, value:string) => {
  //   const updatedCharges = charges.map((charge) => {
  //     if (charge.key === key) {
  //       return { ...charge, [field]: value };
  //     }
  //     return charge;
  //   });
  //   setCharges(updatedCharges);
  // };
  // return (
  //   <>
  //   <Modal show={show} onHide={handleSaveAndClose} size="xl">
  //     <Modal.Header closeButton>
  //       <Modal.Title>Customer Details</Modal.Title>
  //     </Modal.Header>
  //     <Modal.Body>
  //       <div style={{ overflowX: 'scroll' }}>

  //         <div>
  //           <Table striped bordered hover responsive>
  //             <thead>
  //               <tr>
  //                 <th>Account</th>
  //                 <th>On Value</th>
  //                 <th>Charges Percentage</th>
  //                 <th>Added/Subtracted</th>
  //                 <th>Tax</th>
  //                 <th>Tax Slab</th>
  //                 <th>Gross Amount</th>
  //                 <th>SGST</th>
  //                 <th>CGST</th>
  //                 <th>IGST</th>
  //                 <th>Net Charges</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {charges.map((charge,i) => (
  //                 <tr key={charge.key}>
  //                   <td>
  //                     <CustomDropdown
  //                     style={{width:320}}
  //                       name="accountGroupID"
  //                       options={accountGroupOptions}
  //                       control={control}
  //                       error={errors[i]?.accountId}
  //                       validationRules={{
  //                         required: 'Account Group is required.',
  //                       }}
  //                       // onChangeCallback={handleAccountGroupChange}
  //                       isCreatable={true}
  //                       showCreateButton={true}
  //                       onCreateButtonClick={() => {
  //                         setModalShow(true);
  //                       }}
  //                     />
  //                   </td>
  //                   <td>
  //                     <FormControl
  //                       type="number"
  //                       value={charge.onValue}
  //                       onChange={(e) => handleFieldChange(charge.key, 'onValue', e.target.value)}
  //                     />
  //                   </td>
  //                   <td>
  //                     <FormControl
  //                       type="number"
  //                       value={charge.chargesPercentage}
  //                       onChange={(e) => handleFieldChange(charge.key, 'chargesPercentage', e.target.value)}
  //                     />
  //                   </td>
  //                   <td>
  //                     <Form.Select
  //                       value={charge.addedOrSubtracted}
  //                       onChange={(e) => handleFieldChange(charge.key, 'addedOrSubtracted', e.target.value)}
  //                     >
  //                       <option value="+">+</option>
  //                       <option value="-">-</option>
  //                     </Form.Select>
  //                   </td>
  //                   <td>
  //                     <Form.Select
  //                       value={charge.tax}
  //                       onChange={(e) => handleFieldChange(charge.key, 'tax', e.target.value)}
  //                     >
  //                       <option value="yes">Yes</option>
  //                       <option value="no">No</option>
  //                     </Form.Select>
  //                   </td>
  //                   <td>
  //                     <CustomDropdown
  //                     style={{width:300}}
  //                       name="gstSlabID"
  //                       options={gstSlabs}
  //                       control={control}
  //                       validationRules={{
  //                         required: 'GST Slab is required.',
  //                       }}
  //                       // error={errors.gstSlabID}
  //                     />
  //                     {/* <FormControl
  //                 disabled={charge.tax !== 'yes'}
  //                 value={charge.taxSlab}
  //                 onChange={(e) => handleFieldChange(charge.key, 'taxSlab', e.target.value)}
  //               /> */}
  //                     {/* <Form.Select
  //                       disabled={charge.tax !== 'yes'}
  //                       value={charge.accountId}
  //                       onChange={(e) => handleFieldChange(charge.key, 'accountId', e.target.value)}
  //                     >
  //                       {gstSlabs.map((val) => {
  //                         return <option value={val.value}>{val.label}</option>
  //                       })}

  //                     </Form.Select> */}
  //                   </td>
  //                   <td>
  //                     <FormControl
  //                       type="number"
  //                       disabled={charge.tax !== 'yes'}
  //                       value={charge.grossAmount}
  //                       onChange={(e) => handleFieldChange(charge.key, 'grossAmount', e.target.value)}
  //                     />
  //                   </td>
  //                   <td>
  //                     <FormControl
  //                       type="number"
  //                       disabled={charge.tax !== 'yes'}
  //                       value={charge.sGST}
  //                       onChange={(e) => handleFieldChange(charge.key, 'sGST', e.target.value)}
  //                     />
  //                   </td>
  //                   <td>
  //                     <FormControl
  //                       type="number"
  //                       disabled={charge.tax !== 'yes'}
  //                       value={charge.cGST}
  //                       onChange={(e) => handleFieldChange(charge.key, 'cGST', e.target.value)}
  //                     />
  //                   </td>
  //                   <td>
  //                     <FormControl
  //                       type="number"
  //                       disabled={charge.tax !== 'yes'}
  //                       value={charge.iGST}
  //                       onChange={(e) => handleFieldChange(charge.key, 'iGST', e.target.value)}
  //                     />
  //                   </td>
  //                   <td>
  //                     <FormControl
  //                       type="number"
  //                       value={charge.netCharges}
  //                       onChange={(e) => handleFieldChange(charge.key, 'netCharges', e.target.value)}
  //                     />
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </Table>
  //           <Button onClick={handleAddRow}>Add Row</Button>
  //         </div>
  //       </div>
  //     </Modal.Body>
  //   </Modal>
  //   <CommonModal
	// 				show={modalShow}
	// 				onHide={() => setModalShow(false)}
	// 			>
	// 				<Suspense fallback={<div>Loading...</div>}>
	// 					<AccountGroupForm />
	// 				</Suspense>
	// 			</CommonModal>
  //   </>
  // )
  <>
  </>
}
export default OtherCharges;