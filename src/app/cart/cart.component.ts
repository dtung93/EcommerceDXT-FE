import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../service/token-storage.service';
import { UserService } from '../service/user.service';
import Swal from 'sweetalert2';
import { User } from '../model/user.model';
import { CartService } from '../service/cart.service';
import { isThisTypeNode } from 'typescript';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  selectedItem:any
items:any[]=[]
totalItems:any
grandTotal:any
currentUser:User=new User()

  constructor(private toastr: ToastrService,private cartService:CartService,private userService: UserService,private token: TokenStorageService) { }

  ngOnInit(): void {

this.cartService.getCart().subscribe((res)=>{
this.cartService.updateCartTotal(res.totalItems)
this.items=res.items
this.totalItems=res.totalItems
this.grandTotal=res.grandTotal
})
  }
setItemQuantity(event:any,item:any){
 this.selectedItem=item
 const data={
   id:this.selectedItem.product.id,
   quantity:event.target.value
 }
 this.cartService.setItemQuantity(data).subscribe((res)=>{
  this.items=res.items
  this.totalItems=res.totalItems
  this.grandTotal=res.grandTotal
  this.cartService.updateCartTotal(this.totalItems)

 })
}

removeItemFromCart(item:any){
  this.selectedItem=item
 const productId={
   id:item.product.id
 }
 this.cartService.deleteFromCart(productId).subscribe((res)=>{
this.toastr.success(item.product.name+'has been removed from cart')
this.cartService.updateCartTotal(res.totalItems)
 },error=>{ console.log('error item cannot be removed')})
}


}
