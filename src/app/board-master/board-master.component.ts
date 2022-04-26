import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../service/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../model/user.model';
import { TokenStorageService } from '../service/token-storage.service';
import { confirmField } from '../service/validator';
import { AuthService } from '../service/auth.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-board-master',
  templateUrl: './board-master.component.html',
  styleUrls: ['./board-master.component.scss']
})
export class BoardMasterComponent implements OnInit {
  errorMessage: string=''
 addUserRole={id:1,
  name:'ROLE_USER',
  tag:'User'}
  isSubmitted = false;
  userForm!: FormGroup
  isAdmin = false
  isMaster = false
  currentUserRole = '';
  currentUsername: any
  usernameoremail:string=''
  roleSelected={id:null, name:''}
  noUserError:string=''
  font = 'font-family:optima'
  padding = 'padding:5'
  info = 'background-color:#97C5E3 ;margin:10px 15px 10px 5px;text-align:center;color:snow;font-size:25px'
  title = 'color:#638BA6;font-size:3rem;font-weight:bold'
  category = 'color:#A95C68;font-size:1rem'
  description = 'color:grey;font-weight:bold;font-size:15px;text-align:left'
  price = 'color:smoke;font-weight:bolder;font-size:2rem'
  edit = 'color:white;font-size:20px;width:100%;background-color:#2179B3'
  width = 'width:100%;backround-color:#145580'
  selectedUser = new User()
  content?: string
  categories: any = [
    { name: 'Shoes' }, { name: 'Cars' }, { name: 'Health' },
    { name: 'Computers' }, { name: 'Garden' }, { name: 'Beauty' },
    { name: 'Home' }, { name: 'Clothing' }, { name: 'Sports' }, { name: 'Grocery' }
  ]
  selectedRoles: any = [
    { id: 1, name: 'ROLE_USER', tag: 'User' },
    { id: 2, name: 'ROLE_MODERATOR', tag: 'Moderator' }, { id: 3, name: "ROLE_ADMIN", tag: 'Admin' },
    {id:4,name:'ROLE_MASTER',tag:'Master'}
  ]
  optionRoles:any=[
 "user","mod","admin","master"
  ]
  role: any[] = []
  page = 1
  count = 0
  pageSize = 6
  keyword = false
  roles: any[] = []
  users: any[] = []
  totalAccounts = 0
  showUserPanel = false
  updateError=''
  display = 'none'
  @ViewChild('closeAddUser') closeAddUser?: ElementRef 
  @ViewChild('closeDeleteModal') closeDeleteModal?:ElementRef
  addUserPanel() {
    this.showUserPanel = !this.showUserPanel
    console.log(this.showUserPanel)
  }
  addUser() {
    this.isSubmitted = true
    if (this.userForm.invalid) { 
     this.toastr.error('Failed to add new user, Please check your input fields again')
    }
    else {
      const data = {
        username: this.userForm.get('username')?.value,
        email: this.userForm.get('email')?.value,
        password: this.userForm.controls['password'].value,
        address:this.userForm.controls['address'].value,
        phone:this.userForm.controls['phone'].value,
        // roles:this.findByRoleId(this.userForm.controls['role'].value)
        role:[this.userForm.controls['role'].value]
      }

this.userService.addUser(data).subscribe((res)=>{
this.closeAddUser?.nativeElement.click()
this.toastr.info("New account is successfully added")
},error=>{this.errorMessage=error.error.message })
    }
  }
  findByRoleId(id: any) {
    const roleItem = this.selectedRoles.find((role:any)=>+role.id===+id)
    return ( roleItem ) ? [roleItem] : null
  }

  getValueSelected(event: any) {
    this.roleSelected = event
  }
  getRequestParams(usernameoremail: string, page: number, pageSize: number) {
    let params: any = {}
    if (usernameoremail)
      params[`usernameoremail`] = usernameoremail
    params[`page`] = page - 1
    if (pageSize)
      params[`size`] = pageSize
    return params
  }
  checkMasterRole(role: any) {
    let hasMasterRole = false;
    role.forEach((x: any) => {
      if (x.name === 'ROLE_MASTER')
        hasMasterRole = true
    })
    return hasMasterRole
  }
  checkAdminRole(role: any) {
    let hasAdminRole = false
    role.forEach((x: any) => {
      if (x.name === "ROLE_ADMIN")
        hasAdminRole = true
    })
    return hasAdminRole
  }

  checkModeratorRole(role: any) {
    let hasModeratorRole = false
    role.forEach((x: any) => {
      if (x.name === "ROLE_MODERATOR")
        hasModeratorRole = true
    })
    return hasModeratorRole
  }
  getUsers() {
    const params = this.getRequestParams(this.usernameoremail, this.page, this.pageSize)
    this.userService.getUsers(params).subscribe((res) => {
      this.totalAccounts = res.totalItems
      this.count = res.totalItems
      console.log(this.currentUserRole)
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })
      console.log(this.users)
    },()=>{ this.noUserError='No users could be found'})
  }
  checkRoleCondition(user: any) {
    const hasRole = user.roles.some((r: any) => r.name === 'ROLE_ADMIN' || r.name === 'ROLE_MASTER')
    if (this.currentUserRole == "ROLE_ADMIN" && hasRole)
      return false;
    return true;
  }

  addRole(id: any) {
    if (this.checkRole(id)) {
      this.selectedUser.roles.push(this.roleSelected)
      console.log(this.roleSelected)
    }

  }

  checkRole(id: any) {
    const existRole = this.selectedUser.roles.find((role: { id: any; }) => role.id === id)
    return (this.selectedUser.roles
      && this.selectedUser.roles.length < 1
      && !existRole)
  }
  openModal() {
    this.display = "block"
  }
  onCloseHandled() {
    this.display = 'none'
  }
  isOpened: boolean = false

  isOpen() {
    this.isOpened = !this.isOpened
  }
 
  constructor(private authService: AuthService, private fb: FormBuilder, private userService: UserService, private toastr: ToastrService, private token: TokenStorageService) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      address:[],
      role:['user'],
      confirmPassword: ['', [Validators.minLength(6), Validators.maxLength(50)]],
      phone:['',[Validators.required,Validators.maxLength(15)]],
      email: ['', [Validators.email, Validators.required, Validators.minLength(8)]]
    }, {
      validator: confirmField("password", "confirmPassword")
    })
  }
  ngOnInit(): void {
    this.userService.getMasterBoard().subscribe(res => {
      this.content = res
    }, error => { this.content = JSON.parse(error.message) })
    this.getUsers()
    if (this.token.getToken()) {
      this.currentUserRole = this.token.getUser().roles
      this.currentUsername = this.token.getUser().username
      if (this.currentUserRole == "ROLE_MASTER")
        this.isMaster = true
    }
  }
  getUserDetail(id: number) {
    return this.userService.getUser(id).subscribe((res) => {
      this.selectedUser = res
      this.roleSelected= this.selectedRoles.find((selectedRole:any)=>selectedRole.id===res.roles[0].id)
    })
  }

  userModal(id: number) {
    this.openModal()
    this.getUserDetail(id)
  }

  updateUser(): void {
    const data = {
      id: this.selectedUser.id,
      email: this.selectedUser.email,
      username: this.selectedUser.username,
      password: this.selectedUser.password,
      address:this.selectedUser.address,
      phone:this.selectedUser.phone,
      roles: [this.roleSelected],
      enabled:this.selectedUser.enabled
    }
    console.log(data);
    if (data.roles.length === 0 || data.roles.length == null) {
      this.toastr.error("Role must not be empty")
    }
    else
      this.userService.updateUser(data).subscribe((res: any) => {
        console.log(res)
        this.display = 'none'
        this.toastr.info("User #" + res.id + " is updated")
      },()=>{ this.updateError="Mail or phone numbers may already be in use. Please check again"})
  }
  showToast(username: string) {
    this.toastr.error(username+ ' has been deleted')
  }
  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe((res: any) => {
      console.log(id)
      this.selectedUser = this.users.find(user => user.id === id)
      this.closeDeleteModal?.nativeElement.click()
      this.users = this.users.filter(user => user.id != id)
      this.showToast(this.selectedUser.username)
    }, (error: any) => {
      this.toastr.warning("Cannot delete user! An error has occured", error.message)
    })
  }
  searchUsername() {
    this.page = this.page
    this.keyword = true
    this.getUsers()
  }
  handlePageChange(event: number): void {
    this.page = event
    this.getUsers()
  }

  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value
    this.page = 1
    this.getUsers()
  }


}
