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
  resetPasswordToken=''
  isSubmitted=false
  emailForm:FormGroup
  emailError:boolean=false
  constructor(private userService:UserService,private formBuilder:FormBuilder,private toastr:ToastrService) {
    this.emailForm=formBuilder.group({
email:['',[Validators.required,Validators.email]]
    })
   }

  ngOnInit(): void {
  }
sendEmailReset(){
  this.isSubmitted=true
  let email=this.emailForm.controls['email'].value
  if(this.emailForm.valid){
  this.userService.sendResetPasswordEmail(email).subscribe((res:any) => {
this.resetPasswordToken=res.message
window.localStorage.setItem('resetPasswordToken',this.resetPasswordToken)
  }
  ,err => {
    this.emailError=true
    console.log(err.message)
  })
}
else { }
}
}
