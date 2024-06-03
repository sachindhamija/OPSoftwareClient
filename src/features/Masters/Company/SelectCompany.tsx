import { useState, useEffect, useCallback } from 'react';
import agent from '../../../app/api/agent';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import './Company.scss';
import { setLoading } from '../../../app/layout/loadingSlice';
import { useAppDispatch } from '../../../app/store/configureStore';
import { CompanyInformation } from './CompanyInformation';

import { FaRegEdit } from 'react-icons/fa';
import { MdOutlineWorkOutline } from 'react-icons/md';
import '../../Masters/Company/Company.scss';

function SelectCompany() {
	const [companies, setCompanies] = useState([]);
	const [filteredCompanies, setFilteredCompanies] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	//Loading companies
	useEffect(() => {
		const loadCompanies = async () => {
			dispatch(setLoading(true));
			try {
				const response = await agent.Company.getCompanies();
				if (response && response.length > 0) {
					setCompanies(response);
				} else {
					navigate('/select-company');
				}
			} catch (err: any) {
				console.error('Loading companies failed:', err);
				toast.error(`Error: ${err.message}`);
			} finally {
				dispatch(setLoading(false));
			}
		};

		loadCompanies();
	}, []);

	//Filter data
	useEffect(() => {
		const filterResults = (query: string) => {
			if (!query) {
				setFilteredCompanies(companies);
			} else {
				const lowercasedQuery = query.toLowerCase();
				const filteredData = companies.filter(
					(company: any) =>
						company.companyName
							.toLowerCase()
							.includes(lowercasedQuery) ||
						company.gstin.toLowerCase().includes(lowercasedQuery)
				);
				setFilteredCompanies(filteredData);
			}
		};

		filterResults(searchQuery);
	}, [searchQuery, companies]);

	const handleRowClick = useCallback(
		(company: CompanyInformation) => {
			sessionStorage.setItem(
				'selectedCompanyInformation',
				JSON.stringify(company)
			);
			navigate(`/dashboard`);
		},
		[navigate]
	);

	const handleEditClick = useCallback(() => {
		navigate(`/edit-company`);
	}, [navigate]);

	return (
		<Container className="select-company">
			<Row className="my-2">
				<Col>
					<h3 className="text-center">Select a Company</h3>
					<Form>
						<Form.Group controlId="searchQuery">
							<Form.Control
								className="app-form-input"
								type="text"
								placeholder="Search by company name or GSTIN..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={{
									fontWeight: 500,
									textTransform: 'uppercase',
								}}
							/>
						</Form.Group>
					</Form>
				</Col>
			</Row>
			<Row>
				<Col className="table-wrapper">
					<Table
						striped
						bordered
						hover
						responsive
						className="custom-table text-center"
					>
						<thead>
							<tr>
								<th
									style={{ width: '10%' }}
									className="serial-no"
								>
									#
								</th>
								<th
									style={{ width: '45%' }}
									className="company-name"
								>
									Company
								</th>
								<th style={{ width: '25%' }} className="gst-no">
									GST No.
								</th>
								<th
									style={{ width: '20%' }}
									className="edit-work"
								></th>
							</tr>
						</thead>
						<tbody>
							{filteredCompanies.map(
								(company: CompanyInformation, index) => (
									<tr
										key={company.companyId}
										onClick={(e) => {
											e.stopPropagation();
											handleRowClick(company);
										}}
										onKeyDown={(e) => {
											e.stopPropagation();
											handleRowClick(company);
										}}
									>
										<td>{index + 1}</td>
										<td>{company.companyName}</td>
										<td>{company.companyGSTIN}</td>
										<td className="btn-container d-flex justify-content-center align-items-center">
											<Button
												variant="none"
												className="edit-btn me-2 d-none d-lg-block"
												onClick={(e) => {
													e.stopPropagation();
													handleEditClick();
												}}
											>
												Edit
											</Button>

											<Button
												variant="primary"
												className="edit-btn me-2 d-block d-lg-none"
												onClick={(e) => {
													e.stopPropagation();
													handleEditClick();
												}}
											>
												<FaRegEdit className="edit-icon" />
											</Button>

											<Button
												className="edit-working-btn d-none d-lg-block"
												variant="success"
												onClick={(e) => {
													e.stopPropagation();
													handleRowClick(company);
												}}
											>
												Work On It
											</Button>

											<Button
												className="edit-working-btn d-block d-lg-none"
												variant="success"
												onClick={(e) => {
													e.stopPropagation();
													handleRowClick(company);
												}}
											>
												<MdOutlineWorkOutline className="work-icon" />
											</Button>
										</td>
									</tr>
								)
							)}
						</tbody>
					</Table>
				</Col>
			</Row>
		</Container>
	);
}

export default SelectCompany;
