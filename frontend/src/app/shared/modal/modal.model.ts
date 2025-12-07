export type ModalType = 'info' | 'error' | 'confirm' | 'loading';

export interface ModalButton {
  label?: string;
  variant?: 'primary' | 'secondary';
  autoClose?: boolean;
  callback?: () => void;
}

export interface ModalConfig {
  
  type: ModalType;

  title?: string;
  titleSuffix?: string;

  message?: string;
  messageSuffix?: string;
  
  buttons?: ModalButton[];

  playSound?: boolean;
  disableBackdropClose?: boolean;
  translate?: boolean;
}
