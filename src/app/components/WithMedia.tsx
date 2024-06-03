interface CustomDropdownProps {
	isInTable?: boolean;
}

const withMedia =
	<P extends object>(
		Component: React.ComponentType<P>
	): React.FC<P & CustomDropdownProps> =>
	({ isInTable, ...props }) => {
		const isSmallScreen = window.innerWidth <= 576;
		const isInTableForScreenSize = isSmallScreen
			? true
			: isInTable || false;

		return (
			<Component isInTable={isInTableForScreenSize} {...(props as P)} />
		);
	};

export default withMedia;
