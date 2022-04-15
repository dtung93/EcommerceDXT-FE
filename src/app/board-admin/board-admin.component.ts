import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../service/user.service';
import { ProductService } from '../service/product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../model/user.model';
import { ToastrService } from 'ngx-toastr';
import { ConsoleLogger } from '@angular/compiler-cli/private/localize';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import Swal from 'sweetalert2'
import { TokenStorageService } from '../service/token-storage.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.scss']
})
export class BoardAdminComponent implements OnInit {
  isSubmitted=false
  userForm!: FormGroup 
  isAdmin = false
  isMaster = false
  currentUserRole = '';
  currentUsername: any
  username: any
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
    const params = this.getRequestParams(this.username, this.page, this.pageSize)
    this.userService.getUsers(params).subscribe((res) => {
      this.totalAccounts = res.totalItems
      this.count = res.totalItems
      console.log(this.currentUserRole)
      this.users = res.users?.map((user: any) => {
        return { ...user, editable: this.checkRoleCondition(user) }
      })
      console.log(this.users)
    })
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
      if (this.currentUserRole == "ROLE_MASTER")
        this.isMaster = true
      if (this.currentUserRole == "ROLE_ADMIN")
        this.isAdmin = true
    }
  }
  getUserDetail(id: number) {
    return this.userService.getUser(id).subscribe((res) => {
      this.selectedUser = res
      this.selectedUser.roles = res.roles
      console.log(this.selectedUser.roles)
    })
  }

  deleteRole(index: any) {
    this.selectedUser.roles?.splice(index, 1)
    console.log(this.selectedUser.roles)
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
      roles: [this.roleSelected]
    }
    if(data.roles.length<1||data.roles==null){
      this.toastr.error('Error!','Roles must not be empty. Please select a role')     
    }
    else{
      this.userService.updateUser(data).subscribe((res) => {
        this.display = 'none'
        this.toastr.info("User #" + res.id + " is updated")
      },error=>{
          console.log(error.message)
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
    this.page = event
    this.getUsers()
  }

  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value
    this.page = this.page
    this.getUsers()
  }
}
