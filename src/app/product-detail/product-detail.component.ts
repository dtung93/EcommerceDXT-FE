import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../service/product.service';
import { TokenStorageService } from '../service/token-storage.service';
import { CartService } from '../service/cart.service';
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
product=new Product()
  constructor(private cartService:CartService,private toastr:ToastrService, private api:ProductService,private route:ActivatedRoute,private token:TokenStorageService) { }
  font='font-family:optima'
  padding='padding:5'
  info='background-color:#2d8bca ;margin:10px 15px 10px 5px;text-align:center;color:snow;font-size:25px'
  title='color:#638BA6;font-size:3rem;font-weight:bold'
  category='color:#A95C68;font-size:1rem'
  description='color:grey;font-weight:bold;font-size:15px;text-align:left'
  price='color:smoke;font-weight:bolder;font-size:2rem'
  edit='color:white;font-size:20px;width:100%;background-color:#318dca'
  addtocart='color:white;font-size:20px;width:100%;background-color:#239beb;'
  width='width:100%'
  isLoggedIn=false
  showButton=false
  roles:string[]=[]
  ngOnInit(): void {
    this.getProduct(this.route.snapshot.params['id'])
    if(this.token.getToken()){
      this.roles=this.token.getUser().roles
     if(this.roles.includes("ROLE_MODERATOR")||this.roles.includes("ROLE_ADMIN")||this.roles.includes('ROLE_MASTER')){
       this.showButton=true
     }
     else{this.showButton=false}
    }
    console.log(this.product);
  }
  showToast(id:any){
    this.toastr.info('Product'+' '+'#'+id+' is updated')
  }

getProduct(id:number){
  return this.api.getProductDetail(id).subscribe((s)=>{
    this.product=s
    console.log(s)
  })
}
display='none'
openModal(){
  this.display="block"
}
onCloseHandled(){
  this.display='none'
}
isOpened: boolean=false
isOpen(){
  this.isOpened=!this.isOpened
}

updateProduct():void{
  const data={
id:this.product.id,
name:this.product.name,
img:this.product.img,
description:this.product.description,
category:this.product.category,
price:this.product.price,
qty:this.product.qty
  }
this.api.updateProduct(data).subscribe((res)=>{
  console.log(res)
  this.display='none'
  this.showToast(res.id);
})
}
addProductToCart(){
  if(!this.token.getToken()){
    this.toastr.info('Please sign in to use this service')
  }
  else{
    const productId={id:this.product.id}
    const productName=this.product.name
  this.cartService.addToCart(productId).subscribe((res)=>{
    this.cartService.updateCartTotal(res.totalItems)
    this.toastr.info(productName+' added to cart')
  console.log('success')
  })
  }
}
}
