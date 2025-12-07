import { Injectable, signal, computed } from '@angular/core';
import { ModalConfig } from './modal.model';

@Injectable({ providedIn: 'root' })
export class ModalService {

  private _config = signal<ModalConfig | null>(null);

  config = computed(() => this._config());
  isOpen = computed(() => this._config() !== null);

  // Open
  open(config: ModalConfig) {
    this._config.set(config);
  }

  // Close
  close() {
    this._config.set(null);
  }

  // Check is opened
  isOpened(): boolean {
    return this._config() !== null;
  }

  // Information
  info( 
    message: string, 
    options: {
      title?: string;
      titleSuffix?: string;
      messageSuffix?: string;
      playSound?: boolean;
      disableBackdropClose?: boolean;
      translate?: boolean;
      onOk?: () => void;
    } = {}
  ) {
    const {
      title = '',
      titleSuffix = '',
      messageSuffix = '!',
      playSound = true,
      disableBackdropClose = true,
      translate = true,
      onOk
    } = options;
    this.open({
      type: 'info',
      title,
      message,
      titleSuffix,
      messageSuffix,
      playSound,
      disableBackdropClose,
      translate,
      buttons: [
        { label: 'ok', variant: 'primary', autoClose: true, callback: onOk }
      ]
    });
  }

  // Error
  error(
    message: string, 
    options: {
      title?: string;
      titleSuffix?: string;
      messageSuffix?: string;
      playSound?: boolean;
      disableBackdropClose?: boolean;
      translate?: boolean;
      onOk?: () => void;
    } = {}
  ) {
    const {
      title = '',
      titleSuffix = '',
      messageSuffix = '!',
      playSound = true,
      disableBackdropClose = true,
      translate = true,
      onOk
    } = options;
    this.open({
      type: 'error',
      title,
      message,
      titleSuffix,
      messageSuffix,
      playSound,
      disableBackdropClose,
      translate,
      buttons: [
        { label: 'ok', variant: 'primary', autoClose: true, callback: onOk }
      ]
    });
  }

  // Confirm
  confirm(message: string, 
    options: {
      title?: string;
      titleSuffix?: string;
      messageSuffix?: string;
      playSound?: boolean;
      disableBackdropClose?: boolean;
      translate?: boolean;
      onYes?: () => void;
      onNo?: () => void;
    } = {}
  ) {
    const {
      title = '',
      titleSuffix = '',
      messageSuffix = '?',
      playSound = true,
      disableBackdropClose = true,
      translate = true,
      onYes,
      onNo
    } = options;
    this.open({
      type: 'confirm',
      title,
      message,
      titleSuffix,
      messageSuffix,
      playSound,
      disableBackdropClose,
      translate,
      buttons: [
        { label: 'yes', variant: 'primary', autoClose: true, callback: onYes },
        { label: 'no', variant: 'secondary', autoClose: true, callback: onNo }
      ]
    });
  }

  // Loading
  loading(
    message: string,
    options: {
      title?: string;
      titleSuffix?: string;
      messageSuffix?: string;
      playSound?: boolean;
      disableBackdropClose?: boolean;
      translate?: boolean;
    } = {}
  ) {
    const {
      title = 'please_wait',
      titleSuffix = '!',
      messageSuffix = '...',
      playSound = false,
      disableBackdropClose = true,
      translate = true
    } = options;
    this.open({
      type: 'loading',
      title,
      message,
      titleSuffix,
      messageSuffix,
      playSound,
      disableBackdropClose,
      translate,
      buttons: []
    });
  }
}
