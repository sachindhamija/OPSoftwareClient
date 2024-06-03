import { Row, Col, Container } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import agent from '../../app/api/agent';
import CustomInput from '../../app/components/CustomInput';
import CustomButton from '../../app/components/CustomButton';
import FormNavigator from '../../app/components/FormNavigator';
import CommonCard from '../../app/components/CommonCard';

function Register() {
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		setError,
		watch,
		formState: { isSubmitting, errors, isValid },
	} = useForm({
		mode: 'onSubmit',
	});

	function handleApiErrors(apiErrors: any) {
		if (apiErrors) {
			apiErrors.forEach((error: string) => {
				toast.error(error);
				if (error.includes('Password')) {
					setError('password', { type: 'manual', message: error });
				} else if (error.includes('Email') || error.includes('User')) {
					setError('email', { type: 'manual', message: error });
				} else if (error.includes('ConfirmPassword')) {
					setError('confirmPassword', {
						type: 'manual',
						message: error,
					});
				}
			});
		}
	}

	async function onSubmit(data: any) {
		await agent.UserAccount.register(data)
			.then(() => {
				toast.success('Registration successful - you can now login');
				navigate('/login');
			})
			.catch((error) => handleApiErrors(error));
	}

	return (
		<Container className="container-fluid mt-3 mt-md-0">
			<CommonCard header="Register" size="50%">
				<FormNavigator onSubmit={handleSubmit(onSubmit)}>
					<Row>
						<Col sm={12}>
							<CustomInput
								autoFocus
								type="text"
								label="Full Name"
								name="fullName"
								register={register}
								validationRules={{
									required: 'Full name is required',
								}}
								error={errors.fullName}
							/>
						</Col>
					</Row>

					<Row>
						<Col sm={12}>
							<CustomInput
								type="email"
								label="Email"
								name="email"
								register={register}
								validationRules={{
									required: 'Email is required',
								}}
								error={errors.email}
							/>
						</Col>
					</Row>

					<Row>
						<Col sm={12}>
							<CustomInput
								type="text"
								label="Phone Number"
								name="phoneNumber"
								register={register}
								validationRules={{
									required: 'Phone number is required',
								}}
								error={errors.phoneNumber}
							/>
						</Col>
					</Row>

					<Row className="d-flex align-items-center justify-content-center">
						<Col className="col-12">
							<CustomInput
								type="password"
								label="Password"
								name="password"
								register={register}
								validationRules={{
									required: 'Password is required',
									pattern: {
										value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/,
										message:
											'Password does not meet complexity requirements',
									},
								}}
								error={errors?.password}
							/>
						</Col>
					</Row>

					<Row>
						<Col sm={12}>
							<CustomInput
								type="password"
								label="Confirm Password"
								name="confirmPassword"
								register={register}
								validationRules={{
									required: 'Confirm password is required',
									validate: (value: string) =>
										value === watch('password') ||
										'Passwords do not match',
								}}
								error={errors.confirmPassword}
							/>
						</Col>
					</Row>

					<Row>
						<Col
							sm={12}
							md={12}
							className="d-flex align-items-center mt-1"
						>
							<input
								type="checkbox"
								id="termsAndConditions"
								name="termsAndConditions"
							/>
							<label
								htmlFor="termsAndConditions"
								className="ms-2"
							>
								Agree to{' '}
								<a href="/terms">Terms and Conditions</a>
							</label>
						</Col>
					</Row>
					<Col md={12} className="mt-3">
						<CustomButton
							className="w-100"
							variant="success"
							type="submit"
							isSubmitting={isSubmitting}
							isValid={isValid}
							text="Register"
							showAtEnd
						/>
					</Col>
				</FormNavigator>
				<div className="text-center mt-2 mb-2">
					<Link to="/login">
						<strong>Already a user? Login</strong>
					</Link>
				</div>
			</CommonCard>
		</Container>
	);
}

export default Register;
