import {Directive, EventEmitter, HostBinding, HostListener, Input, Output} from '@angular/core';

@Directive({
  selector: '[appUpload]'
})
export class UploadDirective {

  @Input()  private allowedExtensions: string[] = [];
  @Output() private filesChangeEmiter: EventEmitter<File[]> = new EventEmitter();
  @Output() private filesInvalidEmiter: EventEmitter<File[]> = new EventEmitter();

  @HostBinding('style.background')
  private background = '';

  constructor() { }

  @HostListener('dragover', ['$event']) public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '';
  }

  @HostListener('drop', ['$event']) public onDrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';

    const files = evt.dataTransfer.files;
    const valid_files: File[] = [];
    const invalid_files: File[] = [];

    if (files.length > 0) {
      for ( let i = 0; i < files.length; i++ ) {
        const file: File = files[i];

        const ext = file.name.split('.')[file.name.split('.').length - 1];
        if (this.allowedExtensions.indexOf(ext) !== -1) {
          valid_files.push(file);
        } else {
          invalid_files.push(file);
        }
      }

      this.filesChangeEmiter.emit(valid_files);
      this.filesInvalidEmiter.emit(invalid_files);
    }
  }

}
