import { Component, OnInit } from '@angular/core';
import { EmailValidator, Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../service/cart.service';
import { CheckOutService } from '../service/check-out.service';
import { PaymentApiKey } from '../model/paymentApiKey.model';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../service/product.service';
import { OrderService } from '../service/order.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  isClicked=false
  date = new Date()
  cart: any
  outOfStock = false
  orderForm!: FormGroup
  disabled = false
  success = false
  failure = false
  isSubmitted = false
  amount: any
  items: any[] = []
  grandTotal!: number
  totalItems!: number
  constructor(private spinner: NgxSpinnerService, private orderService: OrderService, private productService: ProductService, private toastr: ToastrService, private cartService: CartService, private fb: FormBuilder, private checkOutService: CheckOutService) {
    this.orderForm = this.fb.group({
      name: ['', [Validators.required,]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    })

  }
  ngOnInit(): void {
    this.cartService.getCart().subscribe((res: any) => {
      this.cart = res
      this.amount = res.grandTotal
      this.totalItems = res.totalItems
      this.items = res.items
      console.log(this.cart)
    })
    this.invokeStripe()
  }

  checkProductQuantity() {
    this.cartService.getCart().subscribe((res: any) => {
      this.cart = res
      this.items = res.items.sort(function (a: any, b: any) {
        return parseFloat(a.product.id) - parseFloat(b.product.id)
      }).map((item: any) => {
        let outStock = item.quantity > item.product.qty
        return { ...item, outOfStock: outStock }

      })
      if (this.items.every((item: any) => item.quantity <= item.product.qty)) {
        return this.initializePayment(this.amount)
       
      }
      else {
        this.outOfStock = true
      }
    })
  }
  submitForm() {
    this.isSubmitted = true
    if (this.orderForm.invalid) {
      this.toastr.error('Please check your input again')
    }
    else {
      this.isClicked=true
      this.checkProductQuantity()

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
      const params = {
        amount: amount,
        currency: 'USD',
        description: 'TEST',
        stripeEmail: stripeToken.email,
        stripeToken: stripeToken.id,
        stripTokenType: stripeToken.type
      }
      const orderDetails = {
        name: this.orderForm.controls['name'].value,
        date: this.date,
        cart: this.cart,
        email: this.orderForm.controls['email'].value,
        address: this.orderForm.controls['address'].value,
        phone: this.orderForm.controls['phone'].value
      }
      console.log(orderDetails)

      this.checkOutService.checkout(params).subscribe((data: any) => {
        console.log(data);

        if (data.status === 'succeeded') {
          this.cartService.updateCartTotal(0)
          this.orderService.newOrder(orderDetails).subscribe((res) => {
            console.log(res)
            this.spinner.show()
            setInterval(() => location.href = "/my-orders", 2000)
          })
        }
        else {
          this.failure = true
        }
      });
    };


    paymentHandler.open({
      name: 'Checkout with Stripe',
      description:
        'Confirm payment of ' + amount + '?',
      amount: amount * 100,
      currency: 'USD',
      email: 'Email address: ' + this.orderForm.controls['email'].value
    });
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
