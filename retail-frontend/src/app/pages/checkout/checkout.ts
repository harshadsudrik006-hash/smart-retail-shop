import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector:'app-checkout',
  standalone:true,
  imports:[CommonModule, FormsModule],
  templateUrl:'./checkout.html',
  styleUrl:'./checkout.css'
})
export class Checkout implements OnInit{

  otp = "";
  otpSent = false;
  otpArray: string[] = ["", "", "", "", "", ""];

  paymentMethod = "online";

  addresses:any[]=[];
  selectedAddress:any=null;

  cartTotal=0;
  finalAmount=0;
  discount=0;

  usePoints = false;
  userPoints = 0;

  qrImage:string = "";

  constructor(private http:HttpClient){}

  ngOnInit(){
    this.loadAddresses();
    this.loadCartTotal();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    this.userPoints = user?.points || 0;
  }

  getHeaders(){
    return {
      headers: new HttpHeaders({
        Authorization:`Bearer ${localStorage.getItem("token")}`
      })
    };
  }

  loadAddresses(){
    this.http.get("http://localhost:5000/api/address", this.getHeaders())
      .subscribe((res:any)=>{
        this.addresses = res;
      });
  }

  loadCartTotal(){
    this.http.get("http://localhost:5000/api/cart", this.getHeaders())
      .subscribe((res:any)=>{
        let total = 0;

        res.items.forEach((item:any)=>{
          total += item.product.price * item.quantity;
        });

        this.cartTotal = total;
        this.applyBestCoupon();
      });
  }

  applyBestCoupon(){
    this.http.post(
      "http:///api/coupons/best",
      { cartTotal:this.cartTotal },
      this.getHeaders()
    ).subscribe({
      next:(res:any)=>{
        this.discount = res.discount || 0;
        this.finalAmount = res.finalAmount || this.cartTotal;
      },
      error:()=>{
        this.discount = 0;
        this.finalAmount = this.cartTotal;
      }
    });
  }

  // 🔥 VALIDATION FUNCTION
  canUsePoints(){
    return this.userPoints >= 100 && this.cartTotal >= 100;
  }

  // 🔥 FINAL AMOUNT
  getFinalAmount(){

    let amount = this.finalAmount || this.cartTotal;

    if(
      this.usePoints &&
      this.canUsePoints()
    ){
      amount -= Math.min(this.userPoints, amount);
    }

    return Math.round(amount);
  }

  // 🔥 USED POINTS
  getUsedPoints(){

    let amount = this.finalAmount || this.cartTotal;

    if(
      this.usePoints &&
      this.canUsePoints()
    ){
      return Math.min(this.userPoints, amount);
    }

    return 0;
  }

  proceed(){

    if(!this.selectedAddress){
      alert("⚠️ Please select address");
      return;
    }

    if(this.paymentMethod === "cod"){
      this.sendOTP();
    } 
    else if(this.paymentMethod === "qr"){
      this.generateQR();
    }
    else {
      this.payNow();
    }
  }

  payNow(){

    const amount = this.getFinalAmount();

    this.http.get("http://localhost:5000/api/payment/key")
      .subscribe((keyRes:any)=>{

        this.http.post(
          "http://localhost:5000/api/payment/create",
          { amount },
          this.getHeaders()
        ).subscribe((orderRes:any)=>{

          const options:any = {
            key: keyRes.key,
            amount: orderRes.order.amount,
            currency: "INR",
            name: "Smart Retail",
            description: "Order Payment",
            order_id: orderRes.order.id,

            handler: ()=>{
              alert("✅ Payment Successful");
              this.sendOTP();
            },

            theme: { color: "#28a745" }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();

        });

      });

  }

  generateQR(){

    const amount = this.getFinalAmount();

    this.http.post(
      "http://localhost:5000/api/payment/qr",
      { amount },
      this.getHeaders()
    ).subscribe((res:any)=>{
      this.qrImage = res.qrCode;
    },()=>{
      alert("QR generation failed ❌");
    });

  }

  confirmQRPayment(){
    alert("✅ Payment Done");
    this.sendOTP();
  }

  sendOTP(){
    this.http.post(
      "http://localhost:5000/api/orders/send-otp",
      {},
      this.getHeaders()
    ).subscribe(()=>{
      this.otpSent=true;
      alert("📲 OTP sent");
    });
  }

  moveNext(event:any, index:number){
    const value = event.target.value;
    this.otpArray[index-1] = value;

    if(value && event.target.nextElementSibling){
      event.target.nextElementSibling.focus();
    }

    this.otp = this.otpArray.join("");
  }

  placeOrder(){

    if(!this.otp){
      alert("Enter OTP");
      return;
    }

    this.http.post(
      "http://localhost:5000/api/orders/place",
      {
        otp:this.otp,
        addressId:this.selectedAddress._id,
        paymentMethod:this.paymentMethod,
        paymentId:this.paymentMethod === "online" ? "razorpay" : "qr",
        usePoints:this.usePoints,
        discount:this.discount
      },
      this.getHeaders()
    ).subscribe(()=>{
      alert("🎉 Order placed successfully");

      window.location.reload();
    });

  }

}