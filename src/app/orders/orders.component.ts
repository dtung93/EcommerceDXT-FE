import { Component, OnInit } from '@angular/core';
import { roleName } from '../model/role.model';
import { OrderService } from '../service/order.service';
import { TokenStorageService } from '../service/token-storage.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  roles:any[]=[]
  constructor(private token:TokenStorageService,private orderService:OrderService) { }
  orders:any[]=[]
  ngOnInit(): void {
    if(this.token.getToken()){
      this.roles = this.token.getUser().roles;
      if(this.roles.includes(roleName.u)){
    this.orderService.getOrder().subscribe((res)=>{
      this.orders=res
      console.log(this.orders)
    })}
    else{
      this.orderService.getAllOrders().subscribe((res)=>{
        this.orders=res
      })
    }
  }
  }
}
