import React, { Suspense, useEffect, useState } from 'react';
import { Table, Button, Form, FormControl, Modal } from 'react-bootstrap';
import { OtherChargesDto } from './salePurchaseVoucherDto';
import { useForm } from 'react-hook-form';
import { useGstSlabs } from '../../../app/hooks/useGSTSlabsOptions';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';
import CustomDropdown from '../../../app/components/CustomDropdown';
// import { useAccountGroups } from '../../../app/hooks/useAccountGroupsOptions';
import CommonModal from '../../../app/components/CommonModal';
import AccountGroupForm from '../../Masters/AccountGroup/AccountGroupForm';
import { OptionType } from '../../../app/models/optionType';
import CustomButton from '../../../app/components/CustomButton';
import toast from 'react-hot-toast';
import agent from '../../../app/api/agent';
import { useAppSelector } from '../../../app/store/configureStore';
import { selectCurrentFinancialYear } from '../../Masters/FinancialYear/financialYearSlice';
import { formatDateForBackend } from '../../../app/utils/dateUtils';
// import { AccountDtoForDropDownList } from '../../Masters/Account/accountDto';
import { transformAccountToOption } from '../../../app/utils/accountUtils';

interface OtherChargesModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: OtherChargesDto[]) => void;
  initialData: OtherChargesDto[];
  voucherDate: any;
  summaryAmount:number;
}

const OtherChargesModal: React.FC<OtherChargesModalProps> = ({ show, onHide, onSave, initialData, voucherDate,summaryAmount }) => {
  const accessId = getAccessIdOrRedirect();
  const financialYear = useAppSelector(selectCurrentFinancialYear);
  const gstSlabs = useGstSlabs(accessId);
  // const [isFormValid, setIsFormValid] = useState(false)
  const [charges, setCharges] = useState<OtherChargesDto[]>(initialData);
  const [modalShow, setModalShow] = useState(false);
  const { control, formState: { errors }, reset } = useForm<OtherChargesDto[]>({ mode: 'all' });
  const [allAccounts, setAllAccounts] = useState<OptionType[]>([]);

  const fetchAccounts = async () => {
    try {

      const financialYearFrom = financialYear?.financialYearFrom;
      const accounts = await agent.SalePurchase.getAccountsForDropDownListSalePurchase(
        accessId,
        (financialYearFrom == undefined ? '' : financialYearFrom.toString()),
        formatDateForBackend(voucherDate),
      );
      setAllAccounts(accounts.map(transformAccountToOption));


      return Promise.resolve();
    } catch (error) {
      toast.error('Failed to fetch accounts for dropdown.');
      console.error(error);
      return Promise.reject();
    }
  };
  const handleAddRow = () => {
    const previousNetCharges = ((charges.length > 0) ? (charges[charges.length - 1].netCharges) : summaryAmount);
    const newCharge: OtherChargesDto = {
      otherChargesId: null,
      voucherId: '',
      key: charges.length + 1,
      accountId: '',
      onValue: previousNetCharges,
      chargesPercentage: 0,
      addedOrSubtracted: '+', // Default to plus sign, you can adjust as needed
      tax: 'no',
      taxSlab: '',
      grossAmount: 0,
      sGST: 0,
      cGST: 0,
      iGST: 0,
      netCharges: previousNetCharges,

    };
    setCharges([...charges, newCharge]);
  };


  useEffect(() => {
    fetchAccounts();
    reset(initialData);
  }, [initialData, reset]);

 const validateOtherCharges = ():boolean => {
    const formIsValid = charges.every((item: OtherChargesDto) => {
        return ((item.grossAmount > 0 || item.chargesPercentage > 0) && (item.addedOrSubtracted && item.accountId));
    });

    return formIsValid;
};

  const handleSaveAndClose = () => {
    onSave([...charges]);
    if (validateOtherCharges())
      onHide();
    else {
      toast.error('Please verify that you have filled all the mendatory firlds.')
    }
  };

  const handleDeleteRow = (key: number) => {
    const updatedCharges = charges.filter(x => x.key !== key);
    setCharges([...updatedCharges]);
    onSave([...charges]);
  };

  const handleFieldChange = (key: number, field: string, value: string | number) => {
    const updatedCharges = charges.map((charge) => {
      if (charge.key === key) {
        const updatedCharge = { ...charge, [field]: value };
        // If the field changed is `chargesPercentage` or `onValue`, recalculate `chargeAmount`
        if (field === 'chargesPercentage') {
          if (updatedCharge.chargesPercentage > 0) {
            const grossAmount = parseFloat(((updatedCharge.chargesPercentage * updatedCharge.onValue) / 100).toFixed(2));
            updatedCharge.grossAmount = grossAmount;
          } else {
            updatedCharge.grossAmount = 0;
          }
        }

        // Update `netCharges` based on `addedOrSubtracted` and `chargeAmount`
        if (updatedCharge.addedOrSubtracted === '-') {
          updatedCharge.netCharges = updatedCharge.onValue - updatedCharge.grossAmount;
        } else {
          updatedCharge.netCharges = updatedCharge.onValue + updatedCharge.grossAmount;
        }

        // Tax calculation logic
        if (updatedCharge.tax === 'yes' && updatedCharge.taxSlab) {
          const selectedSlab = gstSlabs.find(slab => slab.value === updatedCharge.taxSlab);
          if (selectedSlab) {
            if (selectedSlab.value > 0) {
              updatedCharge.iGST = parseFloat(((selectedSlab.value * updatedCharge.grossAmount) / 100).toFixed(2));
              updatedCharge.sGST = 0;
              updatedCharge.cGST = 0;
            } else {
              updatedCharge.sGST = parseFloat(((selectedSlab.value * updatedCharge.grossAmount) / 100).toFixed(2));
              updatedCharge.cGST = parseFloat(((selectedSlab.value * updatedCharge.grossAmount) / 100).toFixed(2));
              updatedCharge.iGST = 0;
            }
            updatedCharge.netCharges += updatedCharge.sGST + updatedCharge.cGST + updatedCharge.iGST;
          }
        } else {
          updatedCharge.sGST = 0;
          updatedCharge.cGST = 0;
          updatedCharge.iGST = 0;
        }

        return updatedCharge;
      }
      return charge;
    });
    setCharges(updatedCharges);
    onSave(updatedCharges);
  };

  const getAccountGroupId = (id: string): OptionType => {
    const val = allAccounts.find(x => x.value === id) as OptionType;
    return val;
  };

  return (
    <>
      <Modal show={show} onHide={handleSaveAndClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {allAccounts.length && gstSlabs.length && (
              <Table style={{ width: 2000 }} striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>On Value</th>
                    <th>Charges Percentage</th>
                    <th>Added/Subtracted</th>
                    <th>Amount</th>
                    <th>Tax</th>
                    <th>Tax Slab</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>IGST</th>
                    <th>Net Charges</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((charge, i) => (
                    <tr key={charge.key}>
                      <td>
                        <CustomDropdown
                          defaultValue={getAccountGroupId(charge.accountId)}
                          style={{ width: 320 }}
                          name={`accountId[${i}]`}
                          options={allAccounts}
                          control={control}
                          error={errors[i]?.accountId}
                          validationRules={{ required: 'Account Group is required.' }}
                          onChangeCallback={(e) => handleFieldChange(charge.key, 'accountId', e?.value)}
                          isCreatable={true}
                          showCreateButton={true}
                          onCreateButtonClick={() => setModalShow(true)}
                        />
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          min={0}
                          value={charge.onValue}
                          onChange={(e) => handleFieldChange(charge.key, 'onValue', parseFloat(e.target.value))}
                          onBlur={(e) => handleFieldChange(charge.key, 'onValue', parseFloat(e.target.value))}
                        />
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          min={0}
                          value={charge.chargesPercentage}
                          onChange={(e) => handleFieldChange(charge.key, 'chargesPercentage', parseFloat(e.target.value))}
                          onBlur={(e) => handleFieldChange(charge.key, 'chargesPercentage', parseFloat(e.target.value))}
                        />
                      </td>
                      <td>
                        <Form.Select
                          value={charge.addedOrSubtracted}
                          onChange={(e) => handleFieldChange(charge.key, 'addedOrSubtracted', e.target.value)}
                          onBlur={(e) => handleFieldChange(charge.key, 'addedOrSubtracted', e.target.value)}
                        >
                          <option value="">select</option>
                          <option value="+">+</option>
                          <option value="-">-</option>
                        </Form.Select>
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          min={0}
                          value={charge.grossAmount}
                          onChange={(e) => handleFieldChange(charge.key, 'grossAmount', parseFloat(e.target.value))}
                          onBlur={(e) => handleFieldChange(charge.key, 'grossAmount', parseFloat(e.target.value))}
                        />
                      </td>
                      <td>
                        <Form.Select
                          value={charge.tax}
                          onChange={(e) => handleFieldChange(charge.key, 'tax', e.target.value)}
                          onBlur={(e) => handleFieldChange(charge.key, 'tax', e.target.value)}
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </Form.Select>
                      </td>
                      <td>
                        <CustomDropdown
                          disabled={charge.tax !== 'yes'}
                          style={{ width: 300 }}
                          name="gstSlabID"
                          options={gstSlabs}
                          control={control}
                          validationRules={{ required: 'GST Slab is required.' }}
                          onChangeCallback={(e) => handleFieldChange(charge.key, 'taxSlab', e?.value)}
                          isCreatable={false}
                        />
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          min={0}
                          value={charge.sGST}
                          onChange={(e) => handleFieldChange(charge.key, 'sGST', parseFloat(e.target.value))}
                          onBlur={(e) => handleFieldChange(charge.key, 'sGST', parseFloat(e.target.value))}
                          disabled={charge.tax !== 'yes'}
                        />
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          min={0}
                          value={charge.cGST}
                          onChange={(e) => handleFieldChange(charge.key, 'cGST', parseFloat(e.target.value))}
                          onBlur={(e) => handleFieldChange(charge.key, 'cGST', parseFloat(e.target.value))}
                          disabled={charge.tax !== 'yes'}
                        />
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          min={0}
                          value={charge.iGST}
                          onChange={(e) => handleFieldChange(charge.key, 'iGST', parseFloat(e.target.value))}
                          onBlur={(e) => handleFieldChange(charge.key, 'iGST', parseFloat(e.target.value))}
                          disabled={charge.tax !== 'yes'}
                        />
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          value={charge.netCharges}
                          onChange={(e) => handleFieldChange(charge.key, 'netCharges', parseFloat(e.target.value))}
                          disabled
                        />
                      </td>
                      <td>
                        <div data-skip-focus="true">
                          <CustomButton text="X" variant="none" onClick={() => handleDeleteRow(charge.key)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <Button onClick={handleAddRow}>Add Row</Button>
          </div>
        </Modal.Body>
      </Modal>
      <CommonModal show={modalShow} onHide={() => setModalShow(false)}>
        <Suspense fallback={<div>Loading...</div>}>
          <AccountGroupForm />
        </Suspense>
      </CommonModal>
    </>
  );
};

export default OtherChargesModal;
