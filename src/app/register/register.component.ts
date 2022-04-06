import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
form:any={
  username:null,
  email:null,
  password:null,
  avatar:null,
  address:null,
  phone:null
}
isSuccessful=false
isSignedUpFailed=false
errorMessage=''
  constructor(private authService:AuthService) { }

  ngOnInit(): void {
  }
  onSubmit():void{
    const{username,email,password,avatar,phone,address}=this.form
    console.log(this.form)
    // this.authService.register(username,email,password,avatar,address,phone).subscribe(res=>{
    //   console.log(res)
    //   this.isSuccessful=true
    //   this.isSignedUpFailed=false
    // },error=>{
    //   this.errorMessage=error.message
    //   this.isSignedUpFailed=true
    //   console.log(this.errorMessage)
    // })
  }

}
