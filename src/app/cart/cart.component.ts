import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TokenStorageService } from '../service/token-storage.service';
import { UserService } from '../service/user.service';
import Swal from 'sweetalert2';
import { User } from '../model/user.model';
import { CartService } from '../service/cart.service';
import { isThisTypeNode } from 'typescript';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../app.component';
import { ProductService } from '../service/product.service';
import { Product } from '../model/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  constructor(private productService: ProductService, private toastr: ToastrService, private cartService: CartService, private userService: UserService, private token: TokenStorageService) { }

  ngOnInit(): void {
  if (this.token.getToken()){
    if (this.token.getUser().enabled==true){
      this.cartService.getCart().subscribe((res) => {
        console.log(res)
        this.cartService.updateCartTotal(res.totalItems)
        this.items = res.items.sort(function (a: any, b: any) {
          return parseFloat(a.product.id) - parseFloat(b.product.id)
        })
        this.totalItems = res.totalItems
        this.grandTotal = this.roundUpNumber(res.grandTotal)
      })
    }
    else{
      this.accountNotActivated=true
      this.toastr.error('Account not activated!')
    }
  }
  
  }
  @ViewChild('closeRemoveModal') closeRemoveModal?: ElementRef
  @ViewChild('closeEmptyCart') closeEmptyCart?: ElementRef
  selectedItemQuantity: any
  selectedItem: any
  items: any[] = []
  totalItems!: number
  grandTotal!: number
  currentUser: User = new User()
  maxQuantity=false
  accountNotActivated=false
  sortItems(max: any, min: any) {
    return max.id - min.id
  }
  checkItemQuantity(items: any) {
    let outOfStock=false
    items.forEach((x: any) => {
      if(x.outOfStock==true)
       outOfStock=true
    })
    return outOfStock
  }
  setItemQuantity(event: any, item: any) {
    this.selectedItem = item
    const data = {
      id: this.selectedItem.product.id,
      quantity: event.target.value
    }
    this.cartService.setItemQuantity(data).subscribe((res) => {
      this.items = res.items.sort(function (a: any, b: any) {
        return parseFloat(a.product.id) - parseFloat(b.product.id)
      })
      console.log(res)
      this.totalItems = res.totalItems
      this.grandTotal = res.grandTotal
      this.cartService.updateCartTotal(this.totalItems)

    })
  }

  removeItemFromCart(item: any) {
    this.selectedItem = item
    const productId = {
      id: item.product.id
    }
    this.cartService.deleteFromCart(productId).subscribe((res) => {
      this.items = res.items.filter((item: any) => item.id != productId)
      this.closeRemoveModal?.nativeElement.click()
      this.cartService.updateCartTotal(res.totalItems)
    }, error => { console.log('error item cannot be removed') })
  }
  emptyCart() {
    this.cartService.emptyCart().subscribe((res) => {
      this.closeEmptyCart?.nativeElement.click()
      this.items = []
      this.grandTotal = 0
      this.totalItems = 0
      this.toastr.info('Your cart is now empty')
      this.cartService.updateCartTotal(res.totalItems)
    })
  }
  roundUpNumber(number: number) {
    return Math.round(number * 100) / 100
  }
  nullItem() {
    this.selectedItem = null
  }
  getItem(item: Product) {
    this.selectedItem = item
    console.log(this.selectedItem)
  }
  decreaseQuantityByOne(id: number, item: any) {
    this.selectedItemQuantity = item
    const productId = { id: this.selectedItemQuantity.product.id }
    this.cartService.removeFromCartByOne(productId).subscribe((res: any) => {
      this.items = res.items.sort(function (a: any, b: any) {
        return parseFloat(a.product.id) - parseFloat(b.product.id)
      })
      console.log(res)
      this.totalItems = res.totalItems
      this.grandTotal = res.grandTotal
      this.cartService.updateCartTotal(res.totalItems)
    })
  }
  increaseQuantityByOne(id: number, item: any) {
    this.selectedItemQuantity = item
    const productId = { id: this.selectedItemQuantity.product.id }
    this.cartService.addToCart(productId).subscribe((res: any) => {
      this.items = res.items.sort(function (a: any, b: any) {
        return parseFloat(a.product.id) - parseFloat(b.product.id)
      })
      this.totalItems = res.totalItems
      this.grandTotal = res.grandTotal
      this.cartService.updateCartTotal(res.totalItems)
    })

  }
}
