import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})
export class ForgotpasswordComponent implements OnInit {
  showButton = false
  resetPasswordToken = ''
  isSubmitted = false
  emailForm: FormGroup
  emailError: boolean = false
  constructor(private userService: UserService, private formBuilder: FormBuilder, private toastr: ToastrService) {
    this.emailForm = formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  ngOnInit(): void {
  }
  sendEmailReset() {
    this.isSubmitted = true
    let email = this.emailForm.controls['email'].value
    if (this.emailForm.valid) {
      this.userService.sendResetPasswordEmail(email).subscribe((res: any) => {
        this.resetPasswordToken = res.message    
        if (this.resetPasswordToken === 'Could not find any user with the email address') {
          this.emailError = true
        }
        else {    
          this.showButton = true
          this.emailError=false
        }
      }
        , err => {
          this.toastr.error('An error has occured while performing the operations')
        })
    }
    else { }
  }
}
