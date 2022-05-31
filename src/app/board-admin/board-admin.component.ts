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
  error=false
  email:any
  address:any
  phone:any
  username=''
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
  oldUser=new User()
  content?: string
  categories: any = [
    { name: 'Shoes' }, { name: 'Cars' }, { name: 'Health' },
    { name: 'Computers' }, { name: 'Garden' }, { name: 'Beauty' },
    { name: 'Home' }, { name: 'Clothing' }, { name: 'Sports' }, { name: 'Grocery' }
  ]
  selectedRoles: any = [
    { id: 1, name: 'ROLE_USER', tag: 'User' },
    { id: 2, name: 'ROLE_MODERATOR', tag: 'Moderator' },{id:3,name:'ROLE_ADMIN',tag:'Admin'},{id:4,name:'ROLE_MASTER',tag:'Master'}
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
  isSearched=false
  displayNumber=8
  displayItems(number:number){
    const params = this.getRequestParams(this.username,this.page=1, this.pageSize=number)
    this.userService.getUsers(params).subscribe((res) => {
      this.totalAccounts = res.totalUsers
      this.count = res.totalUsers
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })
      console.log(this.users)
    })
  }
  addUserPanel(){
   this.showUserPanel =!this.showUserPanel
   console.log(this.showUserPanel)
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
  getSearchParams(username:string,page:number){
    let params:any={}
   if(username)
   params[`username`]=username
   if(page)
   params[`page`]=page-1
    return params
  }
  eventSearch(){
    this.page=1
    this.searchUser()
  }
  searchUser(){
    this.isSearched=true
    const data=this.getSearchParams(this.username,this.page)
    this.userService.getUsers(data).subscribe((res:any)=>{
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })
      this.totalAccounts=res.totalUsers
      this.count=res.totalUsers
      this.page=res.currentPage+1
    })
  }
  getUsers() {
    const params = this.getRequestParams(this.username,this.getPage(), this.pageSize)
    this.userService.getUsers(params).subscribe((res) => {
      this.totalAccounts = res.totalUsers
      this.count = res.totalUsers
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
    this.error=false
  }
  isOpened: boolean = false

  isOpen() {
    this.isOpened = !this.isOpened
  }
 
  
  getUserDetail(id: number) {
    return this.userService.getUser(id).subscribe((res) => {
      this.selectedUser = res
      this.oldUser=res
      console.log(this.oldUser)
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
changeValue(event:any){
this.selectedUser.email=event.target.value
console.log(this.selectedUser.email)
}
  updateUser(){
    const data = {
      user:{
      id: this.oldUser.id,
      email: this.oldUser.email,
      username: this.oldUser.username,
      password: this.oldUser.password,
      address:this.oldUser.address,
      phone:this.oldUser.phone,
      enabled:this.oldUser.enabled
      },
      roles: [this.roleSelected],
      email: this.email?this.email:this.selectedUser.email,
      address:this.address?this.address:this.selectedUser.address,
      phone:this.phone?this.phone:this.selectedUser.phone
    }
    if(data.user.email==''){
      this.toastr.error('Error!',"Email must be set")     
    }
    else{
      this.userService.updateUser(data).subscribe((res:any) => {
        console.log(res)
        this.display = 'none'
        this.toastr.info("User " + res.data.data.user.username+" is updated")
        this.updateError==''
        this.error=false
      },(error)=>{
          this.error=true
          this.updateError=error.error.errorMessage
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
  clearFilter(){
    this.isSearched=false
   const data= this.getRequestParams(this.username="",this.page=1,this.pageSize)
    this.userService.getUsers(data).subscribe((res)=>{
      this.totalAccounts = res.totalUsers
      this.count = res.totalUsers
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })
    })
  }
  handlePageChange(event: number): void {
    this.page = event
    sessionStorage.setItem(Paging.PAGE_ADMIN_HOME,JSON.stringify(event))
   if(this.username==''){
    this.getUsers()
   }
   else{
    this.searchUser()
   }
  }

  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value
    this.page = this.page
    this.getUsers()
  }
}
