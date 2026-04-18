import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { io } from 'socket.io-client';

@Component({
selector:'app-dashboard',
standalone:true,
imports:[CommonModule, RouterLink],
templateUrl:'./dashboard.html',
styleUrl:'./dashboard.css'
})
export class Dashboard implements OnInit{

stats:any={};
lowStock:any[]=[];

// ✅ GLOBAL API
API = "https://smart-retail-shop-major-project.onrender.com";

// 🔥 SOCKET
socket:any;

constructor(private http:HttpClient){}

ngOnInit(){

const token = localStorage.getItem("token");

if(!token){
  alert("Login required");
  return;
}

const headers = new HttpHeaders({
  Authorization:`Bearer ${token}`
});

/* Dashboard Stats */
this.http.get(`${this.API}/api/admin/dashboard`,{headers})
.subscribe({

next:(res:any)=>{
console.log("Dashboard API:",res);
this.stats=res;
},

error:(err)=>{
console.log("Dashboard Error:",err);
}

});


/* Low Stock Products */
this.loadLowStock(headers);

/* 🔥 SOCKET CONNECTION (FIXED) */
this.socket = io(this.API);

/* 🔥 LISTEN LOW STOCK EVENT */
this.socket.on("lowStockAlert", (data:any)=>{
  console.log("⚠ Low Stock Alert:", data);

  // 🔥 AUTO REFRESH
  this.loadLowStock(headers);
});

}

/* 🔥 LOW STOCK FUNCTION */
loadLowStock(headers:any){
  this.http.get(`${this.API}/api/products/low-stock`,{headers})
  .subscribe({

  next:(res:any)=>{
  console.log("Low Stock:",res);
  this.lowStock=res;
  },

  error:(err)=>{
  console.log("Low Stock Error:",err);
  }

  });
}

}