import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector:'app-profile',
  standalone:true,
  imports:[CommonModule, RouterModule, FormsModule],
  templateUrl:'./profile.html',
  styleUrl:'./profile.css'
})
export class Profile implements OnInit {

  section:string = "orders";
  user:any;
  orders:any[] = [];
  addresses:any[] = [];

  filterStatus:string = "All";

  constructor(
    public auth:Auth,
    private http:HttpClient,
    private router:Router
  ){}

  ngOnInit(){

    // 🔐 SECURITY CHECK
    if(!localStorage.getItem("token")){
      this.router.navigate(['/login']);
      return;
    }

    this.auth.user$.subscribe(u => this.user = u);

    this.loadOrders();
    this.loadAddresses();
  }

  changeSection(s:string){
    this.section = s;
  }

  getHeaders(){
    return {
      headers:new HttpHeaders({
        Authorization:`Bearer ${localStorage.getItem("token")}`
      })
    };
  }

  // 🚀 LOGOUT FIX
  logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  /* ---------------- ORDERS ---------------- */

  loadOrders(){
    this.http.get("http://localhost:5000/api/orders/my-orders", this.getHeaders())
      .subscribe((res:any)=>{
        this.orders = res;
      });
  }

  filteredOrders(){
    if(this.filterStatus === "All") return this.orders;
    return this.orders.filter(o => o.status === this.filterStatus);
  }

  repeatOrder(orderId:string){
    this.http.post(
      `http://localhost:5000/api/orders/repeat/${orderId}`,
      {},
      this.getHeaders()
    ).subscribe(()=>{
      alert("Order repeated ✅");
      this.loadOrders();
    });
  }

  cancelOrder(orderId:string){
    this.http.put(
      `http://localhost:5000/api/orders/cancel/${orderId}`,
      {},
      this.getHeaders()
    ).subscribe(()=>{
      alert("Order Cancelled ❌");
      this.loadOrders();
    });
  }

  // 🔥 ONLY ADD THIS FUNCTION (rest same hai)

trackOrder(orderId:string){
  this.router.navigate(['/track-order', orderId]);
}

  /* ---------------- PROFILE ---------------- */

  updateProfile(){
    this.http.put(
      "http://localhost:5000/api/auth/update-profile",
      {
        name:this.user.name,
        phone:this.user.phone
      },
      this.getHeaders()
    ).subscribe(()=>{
      alert("Profile Updated ✅");
    });
  }

  /* ---------------- ADDRESS ---------------- */

  loadAddresses(){
    this.http.get("http://localhost:5000/api/address", this.getHeaders())
      .subscribe((res:any)=>{
        this.addresses = res;
      });
  }

  editAddress(a:any){
    this.router.navigate(['/add-address'],{
      state:{ address:a }
    });
  }

  deleteAddress(id:any){
    this.http.delete(
      `http://localhost:5000/api/address/${id}`,
      this.getHeaders()
    ).subscribe(()=>{
      this.loadAddresses();
    });
  }

}