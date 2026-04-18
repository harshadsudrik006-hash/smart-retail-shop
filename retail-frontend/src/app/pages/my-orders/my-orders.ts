import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { io } from "socket.io-client";

@Component({
  selector:'app-my-orders',
  standalone:true,
  imports:[CommonModule, RouterLink],
  templateUrl:'./my-orders.html',
  styleUrl:'./my-orders.css'
})
export class MyOrders implements OnInit, OnDestroy{

  // ✅ ADDED (GLOBAL API)
  API = "https://smart-retail-shop-major-project.onrender.com";

  orders:any[]=[];
  socket:any;

  loading:boolean = false; // ✅ FIX ADDED

  constructor(private http:HttpClient){}

  ngOnInit(){
    this.loadOrders();

    // ❌ OLD
    // this.socket = io("http://localhost:5000");

    // ✅ UPDATED
    this.socket = io(this.API);

    this.socket.on("orderUpdated", ()=>{
      console.log("🔔 User update");
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

    this.loading = true; // ✅ START LOADING

    this.http.get(
      `${this.API}/api/orders/my-orders`,   // ✅ FIXED
      { headers: this.getHeaders() }
    ).subscribe({
      next:(res:any)=>{
        this.orders = res || [];
        this.loading = false; // ✅ STOP LOADING
      },
      error:(err)=>{
        console.log("❌ Error loading orders:", err);
        this.orders = [];
        this.loading = false; // ✅ STOP EVEN ON ERROR
      }
    });

  }

  downloadInvoice(id:any){
    window.open(
      `${this.API}/api/orders/invoice/${id}`,   // ✅ FIXED
      "_blank"
    );
  }

}