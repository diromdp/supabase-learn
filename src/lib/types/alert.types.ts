export interface SweetAlertProps {
	show?: boolean;
	title?: string;
	text?: string;
	icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
	confirmButtonText?: string;
	willClose?: () => void;
	input?: 'file' | 'text' | 'email' | 'password' | 'number' | 'tel' | 'range' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'url';
	inputValidator?: (value: any) => Promise<string | null> | string | null;
}