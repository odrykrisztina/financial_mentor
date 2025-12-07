import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';
import { ModalHideHelperDirective } 
from '../../shared/directives/modal-hide-helper.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faTriangleExclamation, faCircleInfo, 
  faCircleQuestion, faSpinner 
} from '@fortawesome/free-solid-svg-icons';
import {  LangService } from '../../core/lang.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule, 
    FontAwesomeModule, 
    ModalHideHelperDirective
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent {

  private modalSvc = inject(ModalService);
  private noticeAudio = new Audio('assets/media/audio/notice.mp3');

  icon = { faTriangleExclamation, faCircleInfo, faCircleQuestion, faSpinner };

  isOpen = this.modalSvc.isOpen;
  config = this.modalSvc.config;

  modalIcon = computed(() => {
    const cfg = this.config();
    if (!cfg) return null;
    switch (cfg.type) {
      case 'error': return this.icon.faTriangleExclamation;
      case 'info': return this.icon.faCircleInfo;
      case 'confirm': return this.icon.faCircleQuestion;
      case 'loading': return this.icon.faSpinner;
      default: return this.icon.faCircleInfo;
    }
  });

  constructor(
    public langSvc: LangService,
  ) {

    this.noticeAudio.preload = 'auto';

    effect(() => {
      const cfg = this.config();
      if (cfg && cfg.playSound) {
        try {
          this.noticeAudio.currentTime = 0;
          void this.noticeAudio.play();
        } catch (e) {
          console.warn('Audio failed: ', e);
        }
      } else if (!cfg) {
        void this.noticeAudio.pause();
      }
    });
  }

  get lang() { return this.langSvc.state; }

  onBackdropClick() {
    const cfg = this.config();
    if (!cfg || cfg.disableBackdropClose) return;
    this.modalSvc.close();
  }

  onButtonClick(index: number) {

    const cfg = this.config();
    if (!cfg || !cfg.buttons) return;

    const btn = cfg.buttons[index];
    if (!btn) return;

    const callback = btn.callback;
    const autoClose = btn.autoClose !== false

    if (autoClose) this.modalSvc.close();

    if (callback) {
      try {
        callback();
      } catch (e) {
        console.error('Modal button callback error', e);
      }
    }
  }

  close() {
    this.modalSvc.close();
  }
}

