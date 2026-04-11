import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartKey = "cart";

  // 🔥 LIVE COUNT
  private cartCount = new BehaviorSubject<number>(this.getCart().length);
  cartCount$ = this.cartCount.asObservable();

  getCart(){
    return JSON.parse(localStorage.getItem(this.cartKey) || "[]");
  }

  addToCart(product:any){

    let cart = this.getCart();
    cart.push(product);

    localStorage.setItem(this.cartKey, JSON.stringify(cart));

    // 🔥 UPDATE COUNT
    this.cartCount.next(cart.length);
  }

  removeFromCart(index:number){

    let cart = this.getCart();
    cart.splice(index,1);

    localStorage.setItem(this.cartKey, JSON.stringify(cart));

    this.cartCount.next(cart.length);
  }

  clearCart(){
    localStorage.removeItem(this.cartKey);
    this.cartCount.next(0);
  }

  getTotal(){

    let cart = this.getCart();
    let total = 0;

    cart.forEach((item:any)=>{
      total += item.price;
    });

    return total;
  }

}