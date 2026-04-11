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

  orders:any[]=[];
  otpInputs:any = {};
  socket:any;

  constructor(private http:HttpClient){}

  ngOnInit(){
    this.loadOrders();

    this.socket = io("http://localhost:5000");

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
      "http://localhost:5000/api/orders/my-delivery-orders",
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

    // ✅ SUCCESS
    (pos)=>{
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      console.log("📍 Sending:", lat, lng);

      this.http.put(
        `http://localhost:5000/api/orders/location/${order._id}`,
        { lat, lng },
        { headers:this.getHeaders() }
      ).subscribe();
    },

    // ✅ ERROR CALLBACK
    (err)=>{
      console.error("GPS error:", err);
    },

    // ✅ OPTIONS
    {
      enableHighAccuracy:true
    }

  );

}

  sendOTP(order:any){
    this.http.post(
      `http://localhost:5000/api/orders/delivery-otp/${order._id}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe(()=> alert("OTP sent 📲"));
  }

  verifyOTP(order:any){
    const otp = this.otpInputs[order._id];

    this.http.post(
      `http://localhost:5000/api/orders/verify-delivery/${order._id}`,
      { otp },
      { headers: this.getHeaders() }
    ).subscribe(()=>{
      alert("Delivered ✅");
    });
  }

}