import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';
import { confirmField } from '../service/validator';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetToken:any
  resetPassword:any
  isSubmitted=false
  passwordForm: FormGroup;
  constructor(private formBuilder:FormBuilder,private userService: UserService, private toastr: ToastrService) { 
this.passwordForm = formBuilder.group({
password:['',[Validators.required,Validators.minLength(6),Validators.maxLength(30)]],
confirmPassword:['',[Validators.minLength(6),Validators.maxLength(30)]]
},{validator:confirmField("password","confirmPassword")}
)

  }
  
  ngOnInit(): void {
  }
  getParams(resetToken:any,resetPassword:any){
    let params:any={}
    if(resetToken){
    params['token']=resetToken
    }
    if(resetPassword){
    params['password']=resetPassword     
    }
    return params
  }
updatePassword(){
  this.isSubmitted=true
  if(this.passwordForm.invalid||window.localStorage.getItem('resetPasswordToken')==null){
       this.toastr.error('An error has occurred. Please check the fields and try again')
       console.log(window.localStorage.getItem('resetPasswordToken'));
  }
  else{
 this.resetToken=window.localStorage.getItem('resetPasswordToken')
  this.resetPassword=this.passwordForm.controls['password'].value
  const data=this.getParams(this.resetToken,this.resetPassword)
  return this.userService.sendResetPassword(data).subscribe((res)=>{
    this.toastr.info('Your password has been successfully updated! Please login again')
    window.localStorage.removeItem('resetPasswordToken')
    setInterval(()=>window.location.href='/login',1000) 
  },err=>{
    this.toastr.error(err.message)
  })
  }
  return 
}
}


