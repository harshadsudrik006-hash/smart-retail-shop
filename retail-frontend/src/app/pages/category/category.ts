import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../../core/services/auth';

@Component({
  selector:'app-category',
  standalone:true,
  imports:[CommonModule],
  templateUrl:'./category.html',
  styleUrl:'./category.css'
})
export class Category implements OnInit{

  // ✅ ADDED (GLOBAL API)
  API = "https://smart-retail-shop-major-project.onrender.com/api";

  categories:any[]=[];
  subcategories:any[]=[];
  selectedCategoryId:string="";
  selectedSub:any=null;
  products:any[]=[];
  quantities:any = {};

  constructor(
    private route:ActivatedRoute,
    private http:HttpClient,
    private router:Router,
    private auth:Auth
  ){}

  ngOnInit(){

    this.route.paramMap.subscribe(params => {

      const categoryId = params.get("id");
      if(!categoryId) return;

      this.selectedCategoryId = categoryId;

      this.http.get(`${this.API}/categories`)   // ✅ FIXED
      .subscribe((res:any)=>{
        this.categories = res;
      });

      this.loadSubCategories(categoryId);

    });
  }

  loadSubCategories(categoryId:string){

    this.http.get(`${this.API}/subcategories/category/${categoryId}`)   // ✅ FIXED
    .subscribe((res:any)=>{

      this.subcategories = res;

      if(res.length > 0){
        this.selectSub(res[0]);
      }else{
        this.products = [];
      }

    });

  }

  selectSub(sub:any){

    this.selectedSub = sub;

    this.http.get(`${this.API}/products/subcategory/${sub._id}`)   // ✅ FIXED
    .subscribe((res:any)=>{

      this.products = res;

      this.products.forEach((p:any) => {

        const available = (p.stock || 0) - (p.reservedStock || 0);
        const currentQty = this.quantities[p._id] || 0;

        if(currentQty > available){
          this.quantities[p._id] = available;
        }

      });

    });

  }

  changeCategory(cat:any){

    this.selectedCategoryId = cat._id;

    this.products = [];
    this.subcategories = [];
    this.selectedSub = null;

    this.loadSubCategories(cat._id);

  }

  goBack(){
    this.router.navigate(['/']);
  }

  /* 🛒 CART */

  add(p:any){

    const available = (p.stock || 0) - (p.reservedStock || 0);

    if(available <= 0){
      alert("Out of stock ❌");
      return;
    }

    this.quantities[p._id] = 1;

    this.addToCart(p, 1);
  }

  increase(p:any){

    const available = (p.stock || 0) - (p.reservedStock || 0);
    const currentQty = this.quantities[p._id] || 0;

    if(currentQty >= available){
      alert(`Only ${available} items available ❌`);
      return;
    }

    this.quantities[p._id] = currentQty + 1;

    this.addToCart(p, 1);
  }

  decrease(p:any){

    const currentQty = this.quantities[p._id] || 0;

    if(currentQty > 1){

      this.quantities[p._id] = currentQty - 1;

      this.addToCart(p, -1);

    }else{

      delete this.quantities[p._id];
      this.removeFromCart(p);

    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("token");
  }

  addToCart(product:any, quantity:number){

    if (!this.isLoggedIn()) {
      const confirmLogin = confirm("Please login first");

      if (confirmLogin) {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.url }
        });
      }

      return;
    }

    const available = (product.stock || 0) - (product.reservedStock || 0);

    if (quantity > 0 && quantity > available) {
      alert(`Only ${available} items available ❌`);
      return;
    }

    const token = localStorage.getItem("token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post(
      `${this.API}/cart/add`,   // ✅ FIXED
      {
        productId: product._id,
        quantity: quantity
      },
      { headers }
    ).subscribe({

      next: () => {
        window.dispatchEvent(new Event('cartUpdated'));
      },

      error: (err) => {
        console.log("Cart Error:", err);

        alert(
          err?.error?.message ||
          `Only ${available} items available ❌`
        );
      }

    });
  }

  removeFromCart(product:any){

    const token = localStorage.getItem("token");

    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

    this.http.delete(
      `${this.API}/cart/${product._id}`,   // ✅ FIXED
      { headers }
    ).subscribe(()=>{
      window.dispatchEvent(new Event('cartUpdated'));
    });
  }

  isOutOfStock(p:any){
    return (p.stock - (p.reservedStock || 0)) <= 0;
  }
  
  isMaxReached(p:any){
    return this.quantities[p._id] >= (p.stock - (p.reservedStock || 0));
  }

}