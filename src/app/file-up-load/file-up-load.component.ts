import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../service/file-upload.service';
import { Observable } from 'rxjs';
import { HttpEventType,HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-file-up-load',
  templateUrl: './file-up-load.component.html',
  styleUrls: ['./file-up-load.component.scss']
})
export class FileUpLoadComponent implements OnInit {
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  fileInfos?: Observable<any>;
  constructor(private uploadService: FileUploadService) { }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    this.fileInfos=this.uploadService.getFiles()
  }
  upload(): void {
    this.progress = 0;
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      if (file) {
        this.currentFile = file;
        this.uploadService.upload(this.currentFile).subscribe(
          (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progress = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              this.message = event.body.message;
              this.fileInfos = this.uploadService.getFiles();
            }
          },
          (err: any) => {
            console.log(err);
            this.progress = 0;
            if (err.error && err.error.message) {
              this.message = err.error.message;
            } else {
              this.message = 'Could not upload the file!';
            }
            this.currentFile = undefined;
          });
      }
      this.selectedFiles = undefined;
    }
  }

}
