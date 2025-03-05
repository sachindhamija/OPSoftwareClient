import React, { ReactNode } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';

interface CommonModalProps extends ModalProps {
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'lg' | 'xl';
}

const CommonModal: React.FC<CommonModalProps> = ({
    show,
    onHide,
    title = '',
    children,
    size = 'sm',
    ...rest
}) => {
    return (
        <Modal
            autoFocus
            enforceFocus
            show={show}
            onHide={onHide}
            size={size}
            {...rest}
            centered
            style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
        >
            <Modal.Header 
                closeButton 
                style={{
                    padding: '1.5rem 1.5rem 0.5rem',
                    borderBottom: 'none'
                }}
            >
                <Modal.Title style={{ width: '100%' }}>
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h5 style={{ 
                            margin: 0,
                            fontWeight: 700,
                            color: '#0d6efd'
                        }}>{title}</h5>
                    </div>
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body style={{ 
                padding: '0 1.5rem 1.5rem',
                borderRadius: '0 0 12px 12px'
            }}>
                {children}
            </Modal.Body>
        </Modal>
    );
};

export default CommonModal;