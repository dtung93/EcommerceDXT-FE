import { Component, OnDestroy, OnInit } from '@angular/core';
import { TokenStorageService } from './service/token-storage.service';
import { Subscription } from 'rxjs';
import { EventBusService } from './service/event-bus.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private roles:string[]=[]
  isLoggedIn=false
  showAdminBoard=false
  showModeratorBoard=false
  username?:string
  eventBusSub?:Subscription
  showSideMenu=false
  constructor(private tokenStorageService:TokenStorageService,private eventBusService:EventBusService){}
  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.roles = user.roles;
      this.showAdminBoard = this.roles.includes('ROLE_ADMIN')||this.roles.includes('ROLE_MASTER');
      this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR')||this.roles.includes('ROLE_ADMIN')||this.roles.includes('ROLE_MASTER');
      this.username = user.username;
    }
    this.eventBusSub = this.eventBusService.on('logout', () => {
      this.logout();
    });
  }
  ngOnDestroy(): void {
    if (this.eventBusSub)
      this.eventBusSub.unsubscribe();
  }
  openSideMenu(){
    this.showSideMenu!=this.showSideMenu
  }
 
  logout(): void {
    this.tokenStorageService.signOut();
    this.isLoggedIn = false;
    this.roles = [];
    this.showAdminBoard = false;
    this.showModeratorBoard = false;
  }
}
