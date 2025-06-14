import { Col, Row } from 'react-bootstrap';
import {
	CustomInput,
	CustomDropdown,
	CommonModal,
} from '../../../app/components/Components';
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { OptionType } from '../../../app/models/optionType';
import { AccountDto } from './accountDto';
import { Suspense, useEffect, useState } from 'react';
import useDebounce from '../../../app/utils/useDebounce';
import { useHSNCodesOrSAC } from '../../../app/hooks/useHSNandSACcode';
import GSTSlabForm from '../GSTSlab/GSTSlabForm';

interface TradingAccountFieldsProps {
	register: UseFormRegister<AccountDto>;
	control: Control<AccountDto>;
	errors: FieldErrors;
	measurementsOptions: OptionType[];
	gstSlabs: OptionType[];
	hsnCodes?: OptionType[];
	accessId: string;
}
const TradingAccountFields = ({
	register,
	control,
	errors,
	measurementsOptions,
	gstSlabs,
	accessId,
}: TradingAccountFieldsProps) => {
	const [hsnCodeInput, setHsnCodeInput] = useState('');
	const [modalShow, setModalShow] = useState(false);
	const [hsnCodes, setHsnCodes] = useState<OptionType[]>([]);
	const debouncedHSNCodeInput = useDebounce(hsnCodeInput, 700);

	useEffect(() => {
		const fetchHSNCodes = async () => {
			if (debouncedHSNCodeInput && debouncedHSNCodeInput.length >= 2) {
				try {
					const codes = await useHSNCodesOrSAC(
						accessId,
						debouncedHSNCodeInput
					);
					setHsnCodes(codes);
				} catch (error) {
					console.error('Failed to fetch HSN codes:', error);
					setHsnCodes([]);
				}
			} else {
				setHsnCodes([]);
			}
		};
		fetchHSNCodes();
	}, [debouncedHSNCodeInput]);

	return (
		<div className="Trading Account">
			<Row>
				<Col md={4}>
					<CustomDropdown
						label="GST Slab"
						name="gstSlabId"
						options={gstSlabs}
						control={control}
						error={errors.gstSlabId}
						onCreateButtonClick={() => {
							setModalShow(true);
						}}
					/>
				</Col>
				<Col md={4}>
					<CustomDropdown
						label="HSN/SAC Code"
						name="hsnCode"
						control={control}
						placeholder="Enter First 2 digits of HSN Code"
						options={hsnCodes}
						onInputChange={(newValue) => setHsnCodeInput(newValue)}
					/>
				</Col>
				<Col md={4}>
					<CustomInput
						label="Cess or Additional Tax % "
						name="cessPer"
						register={register}
						allowedChars="numericDecimal"
						error={errors.cessPer}
					/>
				</Col>
			</Row>
			<Row>
				<Col md={4}>
					<CustomInput
						label="Opening Unit"
						name="opUnit"
						register={register}
						allowedChars="numericDecimal"
						error={errors.opUnit}
					/>
				</Col>
				<Col md={4}>
					<CustomInput
						label="Opening Weight"
						name="opWeight"
						register={register}
						allowedChars="numericDecimal"
					/>
				</Col>
				<Col md={4}>
					<CustomInput
						label="Opening Rate"
						name="opRate"
						register={register}
						allowedChars="numericDecimal"
					/>
				</Col>
			</Row>
			<Row>
				<Col md={4}>
					<CustomInput
						label="Gross Profit %"
						name="grossProfit"
						register={register}
						allowedChars="numericDecimal"
					/>
				</Col>
				<Col md={4}>
					<CustomInput
						label="Last Year Gross Profit %"
						name="lastYearGrossProfitPercentage"
						register={register}
						allowedChars="numericDecimal"
					/>
				</Col>
				<Col md={4}>
					<CustomDropdown
						name="measurement"
						label="Measurements for Ledger"
						options={measurementsOptions}
						control={control}
					/>
				</Col>
			</Row>

			{/* GST Slab Form Open */}
			<CommonModal
				show={modalShow}
				onHide={() => setModalShow(false)}
                size='xl'
			>
				<Suspense fallback={<div>Loading...</div>}>
					<GSTSlabForm />
				</Suspense>
			</CommonModal>
		</div>
	);
};

export default TradingAccountFields;
