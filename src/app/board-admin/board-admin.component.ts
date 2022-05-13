import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../service/user.service';
import { ProductService } from '../service/product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../model/user.model';
import { ToastrService } from 'ngx-toastr';
import { ConsoleLogger } from '@angular/compiler-cli/private/localize';
import Swal from 'sweetalert2'
import { TokenStorageService } from '../service/token-storage.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { roleName } from '../model/role.model';
import { Paging } from '../model/page.model';
@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.scss']
})
export class BoardAdminComponent implements OnInit {
  constructor(private fb:FormBuilder,private userService: UserService, private toastr: ToastrService, private token: TokenStorageService) {
  }
  ngOnInit(): void {
    this.userService.getAdminBoard().subscribe(res => {
      this.content = res
    }, error => { this.content = JSON.parse(error.error).message })
    this.getUsers()
    if (this.token.getToken()) {
      this.currentUserRole = this.token.getUser().roles
      this.currentUsername = this.token.getUser().username
      if (this.currentUserRole == roleName.ma)
        this.isMaster = true
      if (this.currentUserRole == roleName.a)
        this.isAdmin = true
    }
  }
  updateError=''
  isSubmitted=false
  userForm!: FormGroup 
  isAdmin = false
  isMaster = false
  currentUserRole = '';
  currentUsername: any
  usernameoremail:string=''
  roleSelected={id:null,name:''}
  font = 'font-family:optima'
  padding = 'padding:5'
  info = 'background-color:#97C5E3 ;margin:10px 15px 10px 5px;text-align:center;color:snow;font-size:25px'
  title = 'color:#638BA6;font-size:3rem;font-weight:bold'
  category = 'color:#A95C68;font-size:1rem'
  description = 'color:grey;font-weight:bold;font-size:15px;text-align:left'
  price = 'color:smoke;font-weight:bolder;font-size:2rem'
  edit = 'color:white;font-size:20px;width:100%;background-color:#2179B3'
  width = 'width:100%;backround-color:#145580'
  @ViewChild('closeDeleteModal') closeDeleteModal?: ElementRef 
  selectedUser = new User()
  content?: string
  categories: any = [
    { name: 'Shoes' }, { name: 'Cars' }, { name: 'Health' },
    { name: 'Computers' }, { name: 'Garden' }, { name: 'Beauty' },
    { name: 'Home' }, { name: 'Clothing' }, { name: 'Sports' }, { name: 'Grocery' }
  ]
  selectedRoles: any = [
    { id: 1, name: 'ROLE_USER', tag: 'User' },
    { id: 2, name: 'ROLE_MODERATOR', tag: 'Moderator' }, { id: 3, name: "ROLE_ADMIN", tag: 'Admin' }
  ]
  page = 1
  count = 0
  pageSize = 6
  keyword = false
  roles: any[] = []
  users: any[] = []
  totalAccounts = 0
  showUserPanel = false
  display = 'none'
  addUserPanel(){
   this.showUserPanel =!this.showUserPanel
   console.log(this.showUserPanel)
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
      if (x.name ==roleName.ma)
        hasMasterRole = true
    })
    return hasMasterRole
  }
  checkAdminRole(role: any) {
    let hasAdminRole = false
    role.forEach((x: any) => {
      if (x.name ===roleName.a)
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
  getPage(){
   const page= sessionStorage.getItem(Paging.PAGE_ADMIN_HOME)
   this.page=page?+page:1
   return this.page
  }
  getUsers() {
    const params = this.getRequestParams(this.usernameoremail,this.getPage(), this.pageSize)
    this.userService.getUsers(params).subscribe((res) => {
      this.totalAccounts = res.totalItems
      this.count = res.totalItems
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })
      console.log(this.users)
    })
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
    const existRole = this.selectedUser.roles.find(role => role.id === id)
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
 
  
  getUserDetail(id: number) {
    return this.userService.getUser(id).subscribe((res) => {
      this.selectedUser = res
      this.roleSelected=this.selectedRoles.find((role:any)=>role.id === res.roles[0].id)
    })
  }

  deleteRole(index: any) {
    this.selectedUser.roles?.splice(index, 1)
    console.log(this.selectedUser.roles)
  }
  userModal(id: number) {
   
    this.getUserDetail(id);
    this.openModal()
  }

  updateUser(){
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
    if(data.roles.length<1||data.roles==null||data.email==''){
      this.toastr.error('Error!',"Email must be set")     
    }
    else{
      this.userService.updateUser(data).subscribe((res:any) => {
        console.log(res)
        this.display = 'none'
        this.toastr.info("User #" + res.data.user.id+" is updated")
      },error=>{
          this.updateError="Email or phone numbers may already be in use"
          this.selectedUser==null
      })
    }
  }
  showToast(username: string) {
    this.toastr.error(username+ ' has been deleted!')
  }
  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe((res) => {
      console.log(id)
      this.selectedUser = this.users.find(user => user.id === id);
      this.users = this.users.filter(user => user.id != id)
      this.closeDeleteModal?.nativeElement.click()
      this.showToast(this.selectedUser.username)
    }, error => {
      this.toastr.warning("Cannot delete user! An error has occured", error.message)
    })
  }
  searchUsername() {
    this.page = this.page
    this.keyword = true
    this.getUsers()
  }
  handlePageChange(event: number): void {
    sessionStorage.setItem(Paging.PAGE_ADMIN_HOME,JSON.stringify(event))
    this.page = event
    this.getUsers()
  }

  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value
    this.page = this.page
    this.getUsers()
  }
}
