import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/configureStore';
import CustomButton from '../components/CustomButton';
import RightSignInUserMenu from './SignedInMenu';
import './Header.scss'; // Ensure this file contains the updated CSS
import CompanyHeader from './CompanyHeader';
import {
	deleteStoredCompanyInformation,
	getAccessId,
} from '../../features/Masters/Company/CompanyInformation';
// import { useEffect, useRef, useState } from 'react';

function Header() {
	const { user } = useAppSelector((state) => state.account);
	const navigate = useNavigate();
	const accessId = getAccessId();
	const navigateTo = (path: any) => navigate(path);
	const isCompanyUser = user && accessId;
	// const logoLink = isCompanyUser ? '/dashboard' : (user ? '/select-company' : '/');

	const guestLinks = (
		<Nav className="me-auto">
			<Nav.Item>
				<Navbar.Brand as={Link} to="/">
					<img
						src={logo}
						width="35"
						height="35"
						alt="Logo"
						className="logo mt-2 ms-3"
					/>
				</Navbar.Brand>
			</Nav.Item>
			<Nav.Link as={Link} to="/" className="nav-link">
				Home
			</Nav.Link>
			<Nav.Link as={Link} to="/about" className="nav-link">
				About
			</Nav.Link>
			<Nav.Link as={Link} to="/contact" className="nav-link">
				Contact
			</Nav.Link>
		</Nav>
	);
	const userLinks = user && (
		<Nav className="ml-auto p-2">
			<CustomButton
				text="Select Company"
				className="me-2"
				onClick={() => {
					deleteStoredCompanyInformation();
					navigateTo('/select-company');
				}}
			/>
			<CustomButton
				variant="success"
				text="Create New Company"
				className="me-2"
				onClick={() => {
					deleteStoredCompanyInformation();
					navigateTo('/create-company');
				}}
			/>
		</Nav>
	);
	const authenticationLinks = (
		<Nav>
			<CustomButton
				className="mb-3 mb-lg-0 me-lg-2"
				text="Login"
				onClick={() => {
					deleteStoredCompanyInformation();
					navigateTo('/login');
				}}
			/>
			<CustomButton
				className="mb-3 mb-lg-0 me-lg-3"
				variant="success"
				text="Register"
				onClick={() => navigateTo('/register')}
			/>
		</Nav>
	);

	return (
		<Navbar expand="lg" className="custom-navbar" sticky="top">
			<Navbar.Toggle
				aria-controls="basic-navbar-nav"
				className="dropdown-toggler"
				// onClick={toggleNav}
			/>
			<Navbar.Collapse
				id="basic-navbar-nav"
				className="custom-dropdown-menu"
			>
				{isCompanyUser ? (
					<CompanyHeader />
				) : user ? (
					userLinks
				) : (
					guestLinks
				)}
				{!user && authenticationLinks}
			</Navbar.Collapse>
			{user && <RightSignInUserMenu userEmail={user.email} />}{' '}
			{/* Right side menu for logged in users */}
		</Navbar>
	);
}

export default Header;
