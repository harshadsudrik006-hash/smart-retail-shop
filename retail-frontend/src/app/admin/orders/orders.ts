import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { io } from "socket.io-client";

@Component({
selector:'app-orders',
standalone:true,
imports:[CommonModule,FormsModule],
templateUrl:'./orders.html',
styleUrl:'./orders.css'
})
export class Orders implements OnInit, OnDestroy{

orders:any[]=[];
deliveryBoys:any[]=[];
socket:any;

constructor(private http:HttpClient){}

ngOnInit(){
this.loadOrders();
this.loadDeliveryBoys();

// 🔥 SOCKET
this.socket = io("http://localhost:5000");

this.socket.on("orderUpdated", ()=>{
  console.log("🔔 Admin update");
  this.loadOrders();
});
}

ngOnDestroy(){
  if(this.socket){
    this.socket.disconnect();
  }
}

/* Load Orders */
loadOrders(){

const headers = new HttpHeaders({
Authorization:`Bearer ${localStorage.getItem("token")}`
});

this.http.get("http://localhost:5000/api/admin/orders",{headers})
.subscribe((res:any)=>{
  this.orders = res || [];
});
}

/* Load Delivery Boys */
loadDeliveryBoys(){

const headers = new HttpHeaders({
Authorization:`Bearer ${localStorage.getItem("token")}`
});

this.http.get("http://localhost:5000/api/orders/delivery-boys",{headers})
.subscribe((res:any)=>{
  this.deliveryBoys = Array.isArray(res) ? res : [];
});
}

/* Update Status */
updateStatus(order:any){

const headers = new HttpHeaders({
Authorization:`Bearer ${localStorage.getItem("token")}`
});

this.http.put(
`http://localhost:5000/api/orders/${order._id}/status`,
{ status: order.status },
{ headers }
).subscribe(()=>{
  alert("Updated ✅");
});
}

/* Assign Delivery */
assignDelivery(order:any){

if(!order.deliveryBoy){
  alert("Select delivery boy");
  return;
}

const headers = new HttpHeaders({
Authorization:`Bearer ${localStorage.getItem("token")}`
});

this.http.put(
`http://localhost:5000/api/orders/assign/${order._id}`,
{ deliveryBoyId: order.deliveryBoy },
{ headers }
).subscribe(()=>{
  alert("Assigned ✅");
});
}

goBack(){
    window.history.back();
}

}