import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartService } from '../../core/services/cart';

@Component({
  selector:'app-product-card',
  standalone:true,
  imports:[CommonModule],   // ✅ FIXED
  templateUrl:'./product-card.html',
  styleUrl:'./product-card.css'
})
export class ProductCard{

  @Input() product:any;

  constructor(
    private http:HttpClient,
    private cartService:CartService
  ){}

  addToCart(){

    // 🔥 STOCK CHECK
    if(!this.product.stock || this.product.stock <= 0){
      alert("❌ Product out of stock");
      return;
    }

    const token = localStorage.getItem("token");

    // 🔥 LOGIN CHECK
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

        alert("✅ Added to cart");

        // 🔥 IMPORTANT: UPDATE NAVBAR COUNT
        window.dispatchEvent(new Event('cartUpdated'));

      },
      error:(err)=>{
        console.log(err);
        alert("Error adding to cart");
      }
    });

  }

}