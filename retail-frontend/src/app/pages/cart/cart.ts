import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector:'app-cart',
  standalone:true,
  imports:[CommonModule, RouterLink],
  templateUrl:'./cart.html',
  styleUrl:'./cart.css'
})
export class Cart implements OnInit{

  items:any[]=[];
  total=0;

  constructor(private http:HttpClient){}

  ngOnInit(){
    this.loadCart();
  }

  getHeaders(){
    return {
      headers:new HttpHeaders({
        Authorization:`Bearer ${localStorage.getItem("token")}`
      })
    };
  }

  loadCart(){

    this.http.get("http://localhost:5000/api/cart", this.getHeaders())
    .subscribe((res:any)=>{

      this.items = res?.items || [];

      this.calculateTotal();
    });
  }

increaseQty(item:any){

  // 🔥 FRONTEND CHECK
  if(item.quantity >= item.product.stock){
    alert(`Only ${item.product.stock} items available ❌`);
    return;
  }

  this.http.post(
    "http://localhost:5000/api/cart/add",
    {
      productId:item.product._id,
      quantity:1
    },
    this.getHeaders()
  ).subscribe({

    next: () => this.loadCart(),

    // 🔥 HANDLE BACKEND ERROR
    error: (err) => {
      alert(err.error?.message || "Out of Stock ❌");
    }

  });
}

  decreaseQty(item:any){

    if(item.quantity === 1){
      this.removeItem(item);
      return;
    }

    this.http.post(
      "http://localhost:5000/api/cart/add",
      {
        productId:item.product._id,
        quantity:-1
      },
      this.getHeaders()
    ).subscribe(()=>this.loadCart());
  }

  removeItem(item:any){

    this.http.delete(
      `http://localhost:5000/api/cart/${item.product._id}`,
      this.getHeaders()
    ).subscribe(()=>this.loadCart());
  }

  calculateTotal(){

    this.total = 0;

    this.items.forEach(item=>{
      this.total += item.product.price * item.quantity;
    });
  }

}