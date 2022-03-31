
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../service/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TokenStorageService } from '../service/token-storage.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  updateRoles=[]
  internetError=false
  loginError=false
  display='none'
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  form: any = {
    username: null,
    email: null,
    password: null
  };
  openModal(){
    this.display='block'
  }
  onCloseHandled(){
    this.display='none'
  }
  constructor(private spinner:NgxSpinnerService,private authService:AuthService,private tokenStorage:TokenStorageService,private toastr:ToastrService) { }

  ngOnInit(): void {
    //display modal form when component is initiated
    this.openModal()
    if (this.tokenStorage.getToken()) {
      this.display='none'
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
  }
  //welcome message
  signInSuccess(username:string){
    this.toastr.success("Hello "+ username+"!")
  }
  //Get username, password and post it to API by http service. API authenticates and returns access token(and refresh token) depends on the role of the logged in account
  onSubmit(): void {
    const { username, password } = this.form;
    this.authService.login(username, password).subscribe(
      data => {       
        this.tokenStorage.saveToken(data.accessToken);//save user access token to storage
        this.tokenStorage.saveRefreshToken(data.refreshToken)//save refresh token to storage
        this.tokenStorage.saveUser(data);//save user information to storage including tokens
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;//get user roles  
        this.spinner.show()
        setInterval(()=>window.location.href='/home',2000)   
      },
      //Error message if cannot or fail to communicate with API
      err => {
        if(err.status==401){
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          color:'red',
          showConfirmButton:true,
          confirmButtonColor:"#186192",
          text: 'Login failed! Wrong username or password',
          footer: '<a href="">Why is this issue?</a>'
        })
        this.loginError=true
        this.isLoginFailed = true;
      }
      else{
      this.isLoginFailed=true
      this.internetError=true
      Swal.fire(  {icon: 'error',
      title: 'Oops...',
      color:'red',
      showConfirmButton:true,
      confirmButtonColor:"#186192",
      text: 'Login failed! No internet connection',
      footer: '<a href="">Why is this issue?</a>'
    })
      }
    }
    );
  }
  //reload page
  reloadPage(): void {
    window.location.reload();
  }
}
