import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../service/cart.service';
import { CheckOutService } from '../service/check-out.service';
import { PaymentApiKey } from '../model/paymentApiKey.model';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../service/product.service';
@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  orderForm!:FormGroup
  disabled = false
  success=false
  failure=false
  isSubmitted=false
  amount:any
  items:any[]=[]
  grandTotal!:number
  totalItems!:number
  constructor(private productService:ProductService,private toastr:ToastrService,private cartService:CartService,private fb: FormBuilder, private checkOutService: CheckOutService) {
this.orderForm=this.fb.group({
name:['',[Validators.required,]],
address:['',[Validators.required]],
phone:['',[Validators.required]],
email:['',[Validators.required,Validators.email]]
})

 }
  ngOnInit(): void {
    this.cartService.getCart().subscribe((res:any)=>{
      this.amount=res.grandTotal
      this.totalItems=res.totalItems
      this.items=res.items
    })
    this.invokeStripe()
  }
  
  checkProductQuantity(){
    this.cartService.getCart().subscribe((res:any)=>{
     this.items=res.items.map((item:any)=>{
       let outStock=item.quantity<=item.product.qty
       return{...item,outOfStock:outStock}
     })
    })
  }
submitForm(){
  this.isSubmitted=true
  if(this.orderForm.invalid){
    this.toastr.error('Please check your input again')
  }
  else{
    this.checkProductQuantity()
   if( this.items.every((item:any)=>item.quantity<=item.product.qty)){
     return this.initializePayment(this.amount)
   }
  }
}
  paymentHandler: any = null;
  
  initializePayment(amount: number) {

     const paymentHandler = (<any>window).StripeCheckout.configure({
      key: PaymentApiKey.PUBLIC_KEY,
      locale: 'auto',
      token: function (stripeToken: any) {
        console.log({ stripeToken })
        paymentstripe(stripeToken)
      }
    });

    const paymentstripe = (stripeToken: any) => {
      const params={
        amount:amount,
        currency:'USD',
        description:'TEST',
        stripeEmail:stripeToken.email,
        stripeToken:stripeToken.id,
        stripTokenType:stripeToken.type
      }
      this.checkOutService.checkout(params).subscribe((data: any) => {
        console.log(data);
        if (data.data === "success") {
          this.success = true
        }
        else {
          this.failure = true
        }
      });
    };
 

     paymentHandler.open({
      name: 'Checkout with Stripe',
      description: 
      'Confirm payment of '+amount+'?',
      amount: amount * 100,
      currency: 'USD',
      email:'Email address: '+ this.orderForm.controls['email'].value
    });
  }
  
  submitCheckout(stripeToken:any){
    const data={
      amount:this.paymentHandler.amount,
      currency:this.paymentHandler.currency,
      description:this.paymentHandler.description,
      stripeEmail:stripeToken.email,
      stripeToken:stripeToken.id,
      stripTokenType:stripeToken.type
    }
    this.checkOutService.checkout(data).subscribe(()=>{console.log('success')})
  }
  invokeStripe() {
    if (!window.document.getElementById('stripe-script')) {
      const script = window.document.createElement("script");
      script.id = "stripe-script";
      script.type = "text/javascript";
      script.src = "https://checkout.stripe.com/checkout.js";
      window.document.body.appendChild(script);
    }
  }

}
