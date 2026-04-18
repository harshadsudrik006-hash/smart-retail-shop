import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartService } from '../../core/services/cart';

@Component({
  selector:'app-product-card',
  standalone:true,
  imports:[CommonModule],
  templateUrl:'./product-card.html',
  styleUrl:'./product-card.css'
})
export class ProductCard{

  @Input() product:any;

  quantity:number = 0;

  constructor(
    private http:HttpClient,
    private cartService:CartService
  ){}

  // 🔥 UPDATED ADD TO CART
  addToCart(){

    const available = (this.product.stock || 0) - (this.product.reservedStock || 0);

    // ❌ OLD STOCK CHECK
    // if(!this.product.stock || this.product.stock <= 0){

    // ✅ NEW STOCK CHECK
    if(available <= 0){
      alert("❌ Product out of stock");
      return;
    }

    // ❌ OLD LIMIT CHECK
    // if(this.quantity >= this.product.stock){

    // ✅ NEW LIMIT CHECK
    if(this.quantity >= available){
      alert(`Only ${available} items available ❌`);
      return;
    }

    const token = localStorage.getItem("token");

    if(!token){
      alert("Please login first");
      return;
    }

    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

    this.http.post(
      "http://localhost:5000/api/cart/add",
      {
        productId:this.product._id,
        quantity:1
      },
      {headers}
    ).subscribe({

      next:()=>{
        this.quantity++;
        window.dispatchEvent(new Event('cartUpdated'));
      },

      error:(err)=>{

        console.log("Cart Error:", err);

        let message = "Stock limit exceeded ❌";

        if(err?.error?.message){
          message = err.error.message;
        }

        setTimeout(()=>{
          alert(message);
        },0);

      }

    });

  }

  // 🔥 INCREASE
  increase(){

    const available = (this.product.stock || 0) - (this.product.reservedStock || 0);

    // ❌ OLD
    // if(this.quantity >= this.product.stock){

    // ✅ NEW
    if(this.quantity >= available){
      alert(`Only ${available} items available ❌`);
      return;
    }

    this.addToCart();
  }

  // 🔥 DECREASE
  decrease(){

    const token = localStorage.getItem("token");

    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

    if(this.quantity > 1){

      this.http.post(
        "http://localhost:5000/api/cart/add",
        {
          productId:this.product._id,
          quantity:-1
        },
        {headers}
      ).subscribe(()=>{
        this.quantity--;
        window.dispatchEvent(new Event('cartUpdated'));
      });

    }else{

      this.http.delete(
        `http://localhost:5000/api/cart/${this.product._id}`,
        {headers}
      ).subscribe(()=>{
        this.quantity = 0;
        window.dispatchEvent(new Event('cartUpdated'));
      });

    }
  }

}