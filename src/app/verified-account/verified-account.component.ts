import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-verified-account',
  templateUrl: './verified-account.component.html',
  styleUrls: ['./verified-account.component.scss']
})
export class VerifiedAccountComponent implements OnInit {
  verifyToken:any=''
  isVerified=false
  verifyMessage=''
  constructor(private activatedRoute:ActivatedRoute,private userService: UserService) { 
  
  }

  ngOnInit(): void {
 this.getVerifyToken()
  }

 getVerifyToken(){
  this.verifyToken= this.activatedRoute.snapshot.queryParamMap.get('verify-code')
  return this.userService.getVerificationStatus(this.verifyToken).subscribe((res)=>{
    this.isVerified = true
  },error=>{
    this.isVerified=false
    console.log(error)
    this.verifyMessage=error.message.toString()
  })
 }
}
