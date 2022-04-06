import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../service/token-storage.service';
import { UserService } from '../service/user.service';
import Swal from 'sweetalert2';
import { User } from '../model/user.model';
import { ConsoleLogger } from '@angular/compiler-cli';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  roleSelected: any = null
  display = 'none'
  isAdmin = false
  isModerator = false
  isUser=false
  isMaster=false
  selectedUser=new User()
  selectedUserRoles: any[] = []
  width = 'width:100%;backround-color:#145580'
  selectedRoles: any = [
    { id: 1, name: 'ROLE_USER', tag: 'User' },
    { id: 2, name: 'ROLE_MODERATOR', tag: 'Moderator' }, { id: 3, name: "ROLE_ADMIN", tag: 'Admin' }
  ]
  constructor(private token: TokenStorageService, private userService: UserService, private toastr: ToastrService) { }

  ngOnInit():void {
    if (this.token.getToken()) {
      this.selectedUser = this.token.getUser()
    if(this.selectedUser.roles.find(element=>element=='ROLE_MASTER'))
      this.isAdmin=true
    if(this.selectedUser.roles.find(element=>element=='ROLE_ADMIN'))
      this.isAdmin=true
    if(this.selectedUser.roles.find(element=>element=='ROLE_MODERATOR'))
      this.isModerator=true
    }
  }
  getUserDetail(id: number) {
    this.userService.getUser(id).subscribe((res) => {
      this.selectedUser = res
      this.selectedUser.roles = res.roles  
      console.log(this.selectedUser)
    })
  }

  closeModal() {
    this.display = 'none'
  }
  userModal() {
    this.display = 'block'
    console.log(this.selectedUser)
  }
  updateRole():void{
    const data={
      id:this.selectedUser.id,
      roles:this.selectedUser.roles
    }
  this.userService.updateRole(data).subscribe((res)=>{
console.log(res)
this.display='none'
this.toastr.info('Your role is updated')
  })
  }
  testModal(){
    console.log(this.selectedUser.username)
  }
  updateUser(): void {
    const data = {
      id: this.selectedUser.id,
      email: this.selectedUser.email,
      username: this.selectedUser.username,
      password: this.selectedUser.password,
      address:this.selectedUser.address,
      phone:this.selectedUser.phone,
      roles: [this.roleSelected]
    }

      this.userService.updateUser(data).subscribe((res) => {
        console.log(res)
        this.display = 'none'
        this.toastr.info("Your account is updated!")
      },error=>{
        console.log(error.message)
      })
  }

  addRole(id: any) {
    if (this.checkRole(id)) {
      this.selectedUser.roles.push(this.roleSelected)
    }
  }
  checkRole(id: any) {
    const existRole = this.selectedUser.roles.find((role:any) => role.id === id)
    return (this.selectedUser.roles
      && this.selectedUser.roles.length < 1
      && !existRole)
  }

  deleteRole(index: any) {
    this.selectedUser.roles?.splice(index, 1)
    console.log(this.selectedUser.roles)
  }

  onChangeRole(event: any) {
    console.log( event.target.value);
    const roleUpdate = this.selectedRoles.find((r: any) => r.id == event.target.value)
    console.log(roleUpdate);
    const roleParam = {
      id: roleUpdate.id,
      name: roleUpdate.name
    }
    this.selectedUser.roles = [roleParam];
  }

}
