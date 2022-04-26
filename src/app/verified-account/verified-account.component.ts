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
  verifyToken: any = ''
  isVerified :boolean=false
  verifyMessage = ''
  test:any={}
  constructor(private activatedRoute: ActivatedRoute, private userService: UserService) {

  }

ngOnInit(): void {
   this.getVerifyToken()
  }

 getVerifyToken() {
    this.verifyToken = this.activatedRoute.snapshot.queryParamMap.get('verify-code')
 this.userService.getVerificationStatus(this.verifyToken).subscribe((res) => {
 if(JSON.stringify(res).includes("successfully")){
   this.isVerified=true
 }
 if(JSON.stringify(res).includes("Invalid")){
   this.isVerified=false
 }
   }
   ,error=>{console.log(error.error.message);})

  }
}
