import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../service/token-storage.service';
import { UserService } from '../service/user.service';
import Swal from 'sweetalert2';
import { User } from '../model/user.model';
import { ConsoleLogger } from '@angular/compiler-cli';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { confirmField } from '../service/validator';
import { roleName } from '../model/role.model';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  constructor(private fb: FormBuilder, private token: TokenStorageService, private userService: UserService, private toastr: ToastrService) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      confirmNewPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]]
    }, { validator: confirmField('newPassword', 'confirmNewPassword') })
this.updateProfileForm=this.fb.group({
id:[],
email:['',[Validators.required]],
phone:['',[Validators.required]],
address:['',[Validators.required]]
})
  }
  ngOnInit(): void {
    if (this.token.getToken()) {
      let userId=this.token.getUser().id
      this.userService.getUser(userId).subscribe((res)=>{
          this.selectedUser=res
          console.log(this.selectedUser)
          if (this.selectedUser.enabled == true) {
            if (this.selectedUser.roles.find((element) => element.name == roleName.ma)) {
              this.isMaster = true
              console.log('Master? ' + this.isMaster)
            }
            if (this.selectedUser.roles.find(element => element.name == roleName.a)) {
              this.isAdmin = true
              console.log("Admin? " + this.isAdmin)
            }
            if (this.selectedUser.roles.find(element => element.name == roleName.mo))
             { this.isModerator = true
            console.log("Moderator? " + this.isModerator)}
          }
          else {
            this.isDisabled = true
            this.toastr.error('Account not activated!')
          }
      })
  
    }
  }
  address:any
  phone:any
  email:any
  pushBottom = false
  username: string = ''
  isSubmitted = false
  changePasswordForm: FormGroup
  updateProfileForm:FormGroup
  passwordError: string = ''
  roleSelected: any = null
  display = 'none'
  isDisabled = false
  isAdmin = false
  isModerator = false
  isUser = false
  isMaster = false
  selectedUser = new User()
  selectedUserRoles: any[] = []
  width = 'width:100%;backround-color:#145580'
  updateProfileError=''
  selectedRoles: any = [
    { id: 1, name: 'ROLE_USER', tag: 'User' },
    { id: 2, name: 'ROLE_MODERATOR', tag: 'Moderator' }, { id: 3, name: "ROLE_ADMIN", tag: 'Admin' }
  ]

  @ViewChild('closeUpdateModal') closeUpdateModal?: ElementRef

  getUserDetail(id: number) {
    this.userService.getUser(id).subscribe((res) => {
      this.selectedUser = res
      this.selectedUser.roles = res.roles
      this.email=res.email
      this.phone=res.phone
      this.address=res.address
    })
  }

  closeModal() {
    this.display = 'none'
  }
  userModal() {
    this.display = 'block'
  }
  updateRole(): void {
    const data = {
      id: this.selectedUser.id,
      roles: this.selectedUser.roles
    }
    this.userService.updateRole(data).subscribe((res) => {
      console.log(res)
      this.display = 'none'
      this.toastr.info('Your role has changed! Please login again')
      setInterval(
        () => {
          window.location.href = '/home', 1000
          this.token.signOut()
        }
      )
    })
  }
  testModal() {
    console.log(this.selectedUser.username)
  }
  updateUser(): void {
    const data = {
      id: this.selectedUser.id,
      email: this.selectedUser.email,
      username: this.selectedUser.username,
      password: this.selectedUser.password,
      address: this.selectedUser.address,
      phone: this.selectedUser.phone,
      roles: [this.selectedUser.roles[0]],
      enabled: this.selectedUser.enabled
    }
    this.userService.updateUser(data).subscribe((res) => {
      console.log(res)
      this.closeUpdateModal?.nativeElement.click();
      this.toastr.info("Your account is updated!")
    }, error => {
      console.log(error.error.errorMessage)
      this.updateProfileError=error.error.errorMessage
    })
  }

  addRole(id: any) {
    if (this.checkRole(id)) {
      this.selectedUser.roles.push(this.roleSelected)
    }
  }
  checkRole(id: any) {
    const existRole = this.selectedUser.roles.find((role: any) => role.id === id)
    return (this.selectedUser.roles
      && this.selectedUser.roles.length < 1
      && !existRole)
  }

  deleteRole(index: any) {
    this.selectedUser.roles?.splice(index, 1)
    console.log(this.selectedUser.roles)
  }

  onChangeRole(event: any) {
    console.log(event.target.value);
    const roleUpdate = this.selectedRoles.find((r: any) => r.id == event.target.value)
    console.log(roleUpdate);
    const roleParam = {
      id: roleUpdate.id,
      name: roleUpdate.name
    }
    this.selectedUser.roles = [roleParam];
    console.log(this.selectedUser.roles)
  }
  submitChangePasswordForm() {
    this.isSubmitted = true
    if (this.changePasswordForm.invalid) {
      this.passwordError = "Error when updating password"
      this.pushBottom = true
    }
    else {
      this.pushBottom = false
      const data = {
        username: this.selectedUser.username,
        oldPassword: this.changePasswordForm.controls['oldPassword'].value,
        newPassword: this.changePasswordForm.controls['newPassword'].value
      }
      this.userService.changePassword(data).subscribe((res) => {
        this.toastr.info('Your password has changed successfully! Please login again')
        setInterval(
          () => {
            window.location.href = '/login', 1000
            this.token.signOut()
          }
        )
      }, error => { this.passwordError = "You have entered a wrong password" })
    }
  }
  resetForm() {
    this.pushBottom = false
    this.isSubmitted = false
  }
}
