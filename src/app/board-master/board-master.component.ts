import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, EmailValidator, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../service/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../model/user.model';
import { TokenStorageService } from '../service/token-storage.service';
import { confirmField } from '../service/validator';
import { AuthService } from '../service/auth.service';
import Swal from 'sweetalert2';
import { roleName } from '../model/role.model';
import { Paging } from '../model/page.model';
@Component({
  selector: 'app-board-master',
  templateUrl: './board-master.component.html',
  styleUrls: ['./board-master.component.scss']
})
export class BoardMasterComponent implements OnInit {
  constructor(private authService: AuthService, private fb: FormBuilder, private userService: UserService, private toastr: ToastrService, private token: TokenStorageService) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      role: ['user'],
      confirmPassword: ['', [Validators.minLength(6), Validators.maxLength(50)]],
      email: ['', [Validators.email, Validators.required, Validators.minLength(8)]]
    }, {
      validator: confirmField("password", "confirmPassword")
    })
    this.updateUserForm = this.fb.group({
      id: [],
      roleSelected: [],
      email: ['', [Validators.email, Validators.maxLength(100), Validators.minLength(6)]],
      role: [],
      address: [],
      phone: []
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
      if (this.currentUserRole == roleName.ma)
        this.isMaster = true
    }

  }


  @ViewChild('closeAddUser') closeAddUser?: ElementRef
  @ViewChild('closeDeleteModal') closeDeleteModal?: ElementRef
  @ViewChild('adduser') adduser?: ElementRef
  errorMessage: string = ''
  addUserRole = {
    id: 1,
    name: 'ROLE_USER',
    tag: 'User'
  }
  username = ''
  isSubmitted = false;
  userForm!: FormGroup
  updateUserForm!: FormGroup
  isAdmin = false
  isMaster = false
  error=false
  currentUserRole = '';
  currentUsername: any
  usernameoremail: string = ''
  roleSelected = { id: null, name: '' }
  noUserError: string = ''
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
  oldUser = new User()
  content?: string
  categories: any = [
    { name: 'Shoes' }, { name: 'Cars' }, { name: 'Health' },
    { name: 'Computers' }, { name: 'Garden' }, { name: 'Beauty' },
    { name: 'Home' }, { name: 'Clothing' }, { name: 'Sports' }, { name: 'Grocery' }
  ]
  selectedRoles: any = [
    { id: 1, name: 'ROLE_USER', tag: 'User' },
    { id: 2, name: 'ROLE_MODERATOR', tag: 'Moderator' }, { id: 3, name: "ROLE_ADMIN", tag: 'Admin' },
    { id: 4, name: 'ROLE_MASTER', tag: 'Master' }
  ]
  optionRoles: any = [
    "user", "mod", "admin", "master"
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
  updateError = ''
  display = 'none'
  addUserFailed = false
  isSearched = false
  displayUserNumber = 6
  updateUserSubmitted = false
  displayUser(displayNumber: number) {
    const params = this.getRequestParams(this.username, this.page = 1, this.pageSize = displayNumber)
    this.userService.getUsers(params).subscribe((res) => {
      this.totalAccounts = res.totalUsers
      this.count = res.totalUsers
      console.log(this.currentUserRole)
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })
      console.log(this.users)
    }, () => { this.noUserError = 'No users could be found' })

  }

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
        // roles:this.findByRoleId(this.userForm.controls['role'].value)
        role: [this.userForm.controls['role'].value]
      }

      this.userService.addUser(data).subscribe(() => {
        this.closeAddUser?.nativeElement.click()
        this.toastr.info("New account is successfully added")
      }, error => {
        this.addUserFailed = true
        console.log(error.error.message)
        this.errorMessage = error.error.message
      })
    }
  }
  findByRoleId(id: any) {
    const roleItem = this.selectedRoles.find((role: any) => +role.id === +id)
    return (roleItem) ? [roleItem] : null
  }

  getValueSelected(event: any) {
    this.roleSelected = event
  }

  getRequestParams(username: string, page: number, pageSize: number) {
    let params: any = {}
    if (username)
      params[`username`] = username
    params[`page`] = page - 1
    if (pageSize)
      params[`size`] = pageSize
    return params
  }
  getSearchParams(username: string, page: number,size:number) {
    let params: any = {}
    if (username)
      params[`username`] = username
    if (page)
      params[`page`] = page - 1
      if(size)
      params[`size`]=size
    return params
  }
    
  eventSearch() {
    this.page = 1
    this.searchUser()
  }
  searchUser() {
    this.isSearched = true
    const data = this.getSearchParams(this.username, this.page,this.pageSize)
    return this.userService.getUsers(data).subscribe((res: any) => {
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })

      console.log(res)
      this.totalAccounts = res.totalUsers
      this.count = res.totalUsers
      this.page = res.currentPage + 1
      console.log(this.users)

    })
  }
  checkMasterRole(role: any) {
    let hasMasterRole = false;
    role.forEach((x: any) => {
      if (x.name === roleName.ma)
        hasMasterRole = true
    })
    return hasMasterRole
  }
  checkAdminRole(role: any) {
    let hasAdminRole = false
    role.forEach((x: any) => {
      if (x.name === roleName.a)
        hasAdminRole = true
    })
    return hasAdminRole
  }

  checkModeratorRole(role: any) {
    let hasModeratorRole = false
    role.forEach((x: any) => {
      if (x.name === roleName.mo)
        hasModeratorRole = true
    })
    return hasModeratorRole
  }
  getPage() {
    const page = sessionStorage.getItem(Paging.PAGE_MASTER_HOME)
    this.page = page ? +page : 1
    return this.page
  }
  getUsers() {
    const params = this.getRequestParams(this.username, this.getPage(), this.pageSize)
    this.userService.getUsers(params).subscribe((res) => {
      this.totalAccounts = res.totalUsers
      this.count = res.totalUsers
      console.log(this.currentUserRole)
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })
      console.log(this.users)
    }, () => { this.noUserError = 'No users could be found' })
  }
  clearFilter() {
    this.username = ''
    this.isSearched = false
    this.page=1
    const params = this.getRequestParams(this.username, this.page, this.pageSize)
    this.userService.getUsers(params).subscribe((res) => {
      this.totalAccounts = res.totalUsers
      this.count = res.totalUsers
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })

    }, () => { this.noUserError = 'No users could be found' })
  }
  checkRoleCondition(user: any) {
    const hasRole = user.roles.some((r: any) => r.name === roleName.a || r.name === roleName.ma)
    if (this.currentUserRole == roleName.a && hasRole)
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
    this.selectedUser == null
   this.error=false
    this.updateError==''
  }
  isOpened: boolean = false

  isOpen() {
    this.isOpened = !this.isOpened
  }


  getUserDetail(id: number) {
    return this.userService.getUser(id).subscribe((res) => {
      this.selectedUser = res
      this.oldUser=res
      console.log(this.selectedUser)
      this.roleSelected = this.selectedRoles.find((selectedRole: any) => selectedRole.id === res.roles[0].id)
    })
  }

  userModal(id: number) {
    this.openModal()
    this.getUserDetail(id)
  }

  updateUser(): void {
    const data = {
      roles: this.updateUserForm.controls['roleSelected'].value ? this.updateUserForm.controls['roleSelected'].value : this.selectedUser.roles[0]
    }
    const roles = [data.roles].map((role: any) => {
      return {
        id: role.id,
        name: role.name
      }
    })
    this.updateUserSubmitted=true
    const params = {
      user: {
        id: this.selectedUser.id,
        username: this.selectedUser.username,
        address: this.selectedUser.address,
        email: this.selectedUser.email,
        phone: this.selectedUser.phone
      },
      address: this.updateUserForm.controls['address'].value ? this.updateUserForm.controls['address'].value : this.selectedUser.address,
      email: this.updateUserForm.controls['email'].value ? this.updateUserForm.controls['email'].value : this.selectedUser.email,
      phone: this.updateUserForm.controls['phone'].value ? this.updateUserForm.controls['phone'].value : this.selectedUser.phone,
      roles: roles ? roles : this.selectedUser.roles[0]
    }

if(this.updateUserForm.invalid){
  this.toastr.error('Error submitting form. Please check your inputs again')
}
else{
    this.userService.updateUser(params).subscribe((res: any) => {
      console.log(res)
      this.display = 'none'
      this.toastr.info("User " + res.data.data.user.username + " is updated")
      this.error=false
    }, (error) => {
      this.error=true
      this.updateUserForm.controls['email'].value==""
      this.updateError = error.error.errorMessage
    })
  }
  }
  showToast(username: string) {
    this.toastr.error(username + ' has been deleted')
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
  handlePageChange(event: number): void {
    this.page = event
    sessionStorage.setItem(Paging.PAGE_MASTER_HOME, JSON.stringify(event))
    if (this.username == '') {
      this.getUsers()
    }
    else {
      this.searchUser()
    }

  }

  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value
    this.page = this.page
    this.getUsers()
  }


}
