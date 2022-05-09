import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TokenStorageService } from './service/token-storage.service';
import { Subscription } from 'rxjs';
import { EventBusService } from './service/event-bus.service';
import { CartService } from './service/cart.service';
import { roleName } from './model/role.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  cart:any
  showCart=false
 totalItems=0
  hasWidth=false
  private roles:string[]=[]
  avatar?=''
  isLoggedIn=false
  showFooter=false
  showAdminBoard=false
  showModeratorBoard=false
  username?:string
  eventBusSub?:Subscription
  showSideMenu=false
  showMasterBoard=false;
  @ViewChild('openSideBar') openSideBar?: ElementRef 
  static totalItems: any;
  constructor(private cartService: CartService,private tokenStorageService:TokenStorageService,private eventBusService:EventBusService){}
  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser(); 
     if(user.roles.includes(roleName.u)){
       this.showCart=true
     this.cartService.getCart().subscribe((res)=>{
       this.totalItems=res.totalItems;
     })
    }
      this.avatar=user.avatar
      this.roles = user.roles;
      this.showMasterBoard=this.roles.includes(roleName.ma)
      this.showAdminBoard = this.roles.includes(roleName.a)
      this.username = user.username;
      if(this.showAdminBoard||this.showMasterBoard){
      this.openNavButton()
}
      else{}
    }
    else{
    this.eventBusSub = this.eventBusService.on('logOut', () => {
      this.logOut();
    });}
  }
  ngOnDestroy(): void {
    if (this.eventBusSub)
      this.eventBusSub.unsubscribe();
  }
openNavButton(){
  this.hasWidth=!this.hasWidth
}
  logOut(): void {
    this.tokenStorageService.signOut();
    this.isLoggedIn = false;
    this.roles = [];
    this.showAdminBoard = false;
    this.showModeratorBoard = false;
    this.showMasterBoard=false
  }
}
