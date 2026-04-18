import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { io } from "socket.io-client";

@Component({
  selector:'app-delivery-dashboard',
  standalone:true,
  imports:[CommonModule, FormsModule],
  templateUrl:'./delivery-dashboard.html',
  styleUrl:'./delivery-dashboard.css'
})
export class DeliveryDashboard implements OnInit, OnDestroy{

  // ✅ ADDED (GLOBAL API)
  API = "https://smart-retail-shop-major-project.onrender.com";

  orders:any[]=[];
  otpInputs:any = {};
  socket:any;

  constructor(private http:HttpClient){}

  ngOnInit(){
    this.loadOrders();

    // ❌ OLD
    // this.socket = io("http://localhost:5000");

    // ✅ UPDATED
    this.socket = io(this.API);

    this.socket.on("orderUpdated", ()=>{
      this.loadOrders();
    });
  }

  ngOnDestroy(){
    if(this.socket){
      this.socket.disconnect();
    }
  }

  getHeaders(){
    return new HttpHeaders({
      Authorization:`Bearer ${localStorage.getItem("token")}`
    });
  }

  loadOrders(){
    this.http.get(
      `${this.API}/api/orders/my-delivery-orders`,   // ✅ FIXED
      { headers: this.getHeaders() }
    ).subscribe((res:any)=>{
      this.orders = res || [];
    });
  }

  // 🔥 LIVE TRACKING
  startTracking(order:any){

    if(!navigator.geolocation){
      alert("GPS not supported ❌");
      return;
    }

    navigator.geolocation.watchPosition(

      (pos)=>{
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        this.http.put(
          `${this.API}/api/orders/location/${order._id}`,   // ✅ FIXED
          { lat, lng },
          { headers:this.getHeaders() }
        ).subscribe();
      },

      (err)=>{
        console.error("GPS error:", err);
      },

      {
        enableHighAccuracy:true
      }
    );
  }

  sendOTP(order:any){
    this.http.post(
      `${this.API}/api/orders/delivery-otp/${order._id}`,   // ✅ FIXED
      {},
      { headers: this.getHeaders() }
    ).subscribe(()=> alert("OTP sent 📲"));
  }

  verifyOTP(order:any){
    const otp = this.otpInputs[order._id];

    this.http.post(
      `${this.API}/api/orders/verify-delivery/${order._id}`,   // ✅ FIXED
      { otp },
      { headers: this.getHeaders() }
    ).subscribe(()=>{
      alert("Delivered ✅");
      this.loadOrders();
    });
  }

  // 💰 MARK PAYMENT
  markPaid(order:any){
    this.http.put(
      `${this.API}/api/orders/payment/${order._id}`,   // ✅ FIXED
      {},
      { headers: this.getHeaders() }
    ).subscribe(()=>{
      alert("Cash Received ✅");
      this.loadOrders();
    });
  }

}