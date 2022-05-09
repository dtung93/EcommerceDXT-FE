import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from '../service/cart.service';
import { CheckOutService } from '../service/check-out.service';
import { PaymentApiKey } from '../model/paymentApiKey.model';
@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  disabled = false
  success=false
  failure=false
  amount:any
  constructor(private cartService:CartService,private fb: FormBuilder, private checkOutService: CheckOutService) {

  }
 getPaymentInformation(){

 }
  ngOnInit(): void {
    this.cartService.getCart().subscribe((res:any)=>{
      this.amount=res.grandTotal
    })
    this.invokeStripe()
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
      description: 'Confirm payment of '+amount+'?',
      amount: amount * 100,
      currency: 'USD',
      email:"tungboi@yahoo.ca"
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
