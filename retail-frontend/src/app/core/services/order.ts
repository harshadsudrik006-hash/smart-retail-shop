import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn:'root'
})
export class OrderService{

  api = "https://smart-retail-shop-major-project.onrender.com/api/orders";

  constructor(private http:HttpClient){}

  getHeaders(){
    const token = localStorage.getItem("token");

    return new HttpHeaders({
      Authorization:`Bearer ${token}`
    });
  }

  // ✅ USER ORDERS
  getMyOrders(){
    return this.http.get(`${this.api}/my-orders`, {
      headers: this.getHeaders()
    });
  }

  placeOrder(data:any){
    return this.http.post(`${this.api}/place`, data, {
      headers: this.getHeaders()
    });
  }

}