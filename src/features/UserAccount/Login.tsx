import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/store/configureStore';
import { signInUser } from './accountSlice';
import { Col, Container, Form, FormGroup, Row } from 'react-bootstrap';
import CustomInput from '../../app/components/CustomInput';
import '../../features/UserAccount/UserAccount.scss';
import {
	CustomButton,
	CommonCard,
	FormNavigator,
} from '../../app/components/Components';

function Login() {
	const dispatch = useAppDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors, isValid },
	} = useForm({ mode: 'all' });

	async function submitForm(data: any) {
		console.log('submitForm function called with data:', data);
		try {
			const actionResult = await dispatch(signInUser(data));
			if (signInUser.fulfilled.match(actionResult)) {
				console.log('login clicked');
				navigate(location.state?.from?.pathname || '/select-company');
			}
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<Container as="div" className="login-card-container">
			<CommonCard header="Login" size="50%" className="login-common-card">
				<Row className="row">
					<Col className="col-md-12">
						<FormNavigator onSubmit={handleSubmit(submitForm)}>
							<CustomInput
								label="Email address"
								name="email"
								type="email"
								autoFocus
								register={register}
								validationRules={{
									required: 'Email is required',
								}}
								error={errors.email}
								autoComplete="on"
							/>
							<CustomInput
								label="Password"
								name="password"
								type="password"
								register={register}
								validationRules={{
									required: 'Password is required',
								}}
								error={errors.password}
								autoComplete="on"
							/>
							<Row>
								<Col md={12}>
									<FormGroup>
										<Form.Check
											className="pt-1"
											inline
											type="checkbox"
											id="rememberMeCheckbox"
											label="Remember me?"
											{...register('rememberMe')}
										/>
									</FormGroup>
								</Col>
							</Row>

							{/* Forgot Password and Resend Email Confirmation */}
							<Row>
								<Col sm={12} md={6}>
									<Link
										to="/forgot-password"
										className="d-block pt-1"
									>
										Forgot your password?
									</Link>
								</Col>
								<Col sm={12} md={6}>
									<Link
										to="/resend-confirmation"
										className="d-block pb-3 text-start text-md-end"
									>
										Resend email confirmation
									</Link>
								</Col>
							</Row>

							<Col md={12}>
								<FormGroup className="text-left">
									<CustomButton
										style={{ width: '100%' }}
										type="submit"
										variant="success"
										isSubmitting={isSubmitting}
										text="Login"
										isValid={isValid}
										showAtEnd
									/>
								</FormGroup>
							</Col>
						</FormNavigator>

						{/* Register Prompt */}
						<div className="text-center mt-2">
							Not yet registered?{' '}
							<Link to="/register" className="d-none d-md-inline">
								<strong>Click here to register now</strong>
							</Link>
						</div>
						<Link
							to="/register"
							className="d-block d-md-none text-center"
						>
							<strong>Click here to register now</strong>
						</Link>
					</Col>
				</Row>
			</CommonCard>
		</Container>
	);
}

export default Login;
