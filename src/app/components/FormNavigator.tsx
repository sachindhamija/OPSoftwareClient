import React, { useRef, useEffect, ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type FormNavigatorProps = {
	children: ReactNode;
	onSubmit?: (data: any) => void;
	isModalOpen?: boolean;
	onClose?: () => void;
	formName?: string;
};

const FormNavigator: React.FC<FormNavigatorProps> = ({
	onSubmit = () => {},
	children,
	isModalOpen = false,
}) => {
	const formRef = useRef<HTMLDivElement>(null);
	const { handleSubmit } = useForm();
	const navigate = useNavigate();
	const [currentField, setCurrentField] = useState<string | null>(null);
	const [requiredField, setRequiredField] = useState<string | null>(null);

	// useEffect(() => {
	// 	const handleFocusIn = (event: FocusEvent) => {
	// 	  const target = event.target as HTMLElement;
	// 	  const fieldElement = target.closest('[data-fieldname]');
	// 	  if (fieldElement) {
	// 		const fieldName = fieldElement.getAttribute('data-fieldname');
	// 		setCurrentField(fieldName);
	// 	  } else {
	// 		setCurrentField(null);
	// 	  }
	// 	};
	// 	formRef.current?.addEventListener('focusin', handleFocusIn);
	// 	return () => {
	// 	  formRef.current?.removeEventListener('focusin', handleFocusIn);
	// 	};
	// }, []);

	useEffect(() => {
		const handleFocusIn = (event: FocusEvent) => {
		  const target = event.target as HTMLElement;
		  const fieldElement = target.closest('[data-fieldname]');
		  setCurrentField(fieldElement?.getAttribute('data-fieldname') || null);
		  const requiredFieldElement = target.closest('[data-required]');
		  setRequiredField(requiredFieldElement?.getAttribute('data-required') || null);
		};
		formRef.current?.addEventListener('focusin', handleFocusIn);
		return () => {
		  formRef.current?.removeEventListener('focusin', handleFocusIn);
		};
	  }, []);

	useEffect(() => {
		focusFirstInput();
	}, [isModalOpen]);

	const handleFormSubmit = async (data: any) => {
		try {
			await onSubmit(data);
			focusFirstInput();
		} finally {
		}
	};

	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			if (
				(event.ctrlKey || event.metaKey) &&
				event.key.toLowerCase() === 's'
			) {
				event.preventDefault();
				if (
					document.activeElement &&
					formRef.current?.contains(document.activeElement)
				) {
					handleSubmit(handleFormSubmit)();
				}
			}
		};
		window.addEventListener('keydown', handleGlobalKeyDown);

		return () => {
			window.removeEventListener('keydown', handleGlobalKeyDown);
		};
	}, [handleSubmit, handleFormSubmit]);

	const focusFirstInput = () => {
		const firstElement = formRef.current?.querySelector(
			'input:not([type="hidden"]), select'
		);
		if (firstElement && isVisible(firstElement as HTMLElement)) {
			(firstElement as HTMLElement).focus();
		}
	};

	const handleKeyDown = async (event: React.KeyboardEvent) => {
		if (
			event.key === 'Enter' &&
			event.target instanceof HTMLButtonElement
		) {
			handleSubmit(handleFormSubmit)();
			event.preventDefault();
			setTimeout(() => {
				focusFirstInput();
			}, 2);
		} else if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)) {

				event.preventDefault();
				setTimeout(() => {
					const target = event.target as HTMLElement;
					const fieldElement = (target.closest(`input[name="${currentField}"]`) || 
										  document.querySelector(`input[name="${currentField}"]`)) as HTMLInputElement | null;
			
					//requestAnimationFrame(() => {
						let CurrentFieldValue = fieldElement ? fieldElement.value || fieldElement.getAttribute('value') : null;
						CurrentFieldValue = CurrentFieldValue?.trim() || null;

						if (currentField) {
							if (!CurrentFieldValue && requiredField) {
								toast.error('This field is required.');
								event.preventDefault();
								return;
							}
						}
					//});
					moveToNextElement();
				}, 2);
			
			
		} else if (event.key === 'Tab' && event.shiftKey) {
			event.preventDefault();
			moveToPreviousElement();
		} else if (event.key === 'ArrowLeft') {
			const target = event.target as HTMLElement;
			if (shouldMoveToPreviousElement(target)) {
				event.preventDefault();
				moveToPreviousElement();
			}
		} else if (event.key === 'Escape' && !isModalOpen) {
			event.preventDefault();
			setTimeout(() => navigate(-1), 0);
		}
	};

	const shouldMoveToPreviousElement = (target: HTMLElement) => {
		return (
			(target.tagName === 'INPUT' &&
				(target as HTMLInputElement).selectionStart === 0) ||
			target.tagName !== 'INPUT'
		);
	};

	const isElementFocusable = (element: HTMLElement) => {
		const isDisabled = element.hasAttribute('disabled');
		const isHidden = !isVisible(element);
		return !isDisabled && !isHidden;
	};

	const isVisible = (element: HTMLElement) => {
		const style = window.getComputedStyle(element);
		return style.display !== 'none' && style.visibility !== 'hidden';
	};

	const getFormElements = (): HTMLElement[] => {
		const allElements = Array.from(
			formRef.current?.querySelectorAll(
				'input, select, textarea, button'
			) || []
		).map((el) => el as HTMLElement);
		return allElements.filter(isElementFocusable);
	};
	const shouldSkipElement = (element: HTMLElement) => {
		if (element instanceof HTMLElement) {
			return element.closest('[data-skip-focus="true"]') !== null;
		}
		return false;
	};
	const moveToNextElement = (moveBackwards = false) => {
		const formElements = getFormElements();

		let currentIndex = formElements.indexOf(
			document.activeElement as HTMLElement
		);

		// Initialize nextIndex based on the current direction (forward or backward)
		let nextIndex = currentIndex;

		// Attempt to find the next focusable element that does not require skipping
		do {
			nextIndex = moveBackwards ? nextIndex - 1 : nextIndex + 1;

			// Loop around if out of bounds
			if (nextIndex >= formElements.length) {
				nextIndex = 0; // Start from the beginning if moving forward beyond the last element
			} else if (nextIndex < 0) {
				nextIndex = formElements.length - 1; // Start from the end if moving backward beyond the first element
			}

			// Break the loop if we've returned to the original element
			if (nextIndex === currentIndex) break;

			// Continue if the next element should be skipped
		} while (shouldSkipElement(formElements[nextIndex]));

		// Focus the next eligible element
		formElements[nextIndex]?.focus();
	};

	const moveToPreviousElement = () => moveToNextElement(true);

	return (
		<div ref={formRef} onKeyDown={handleKeyDown} className="mt-1">
			<form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
				{children}
			</form>
		</div>
	);
};

export default FormNavigator;
