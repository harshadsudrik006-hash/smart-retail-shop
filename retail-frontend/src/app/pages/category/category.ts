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

      // Load categories (LEFT MENU)
      this.http.get("http://localhost:5000/api/categories")
      .subscribe((res:any)=>{
        this.categories = res;
      });

      // Load subcategories
      this.loadSubCategories(categoryId);

    });
  }

  loadSubCategories(categoryId:string){

    this.http.get(`http://localhost:5000/api/subcategories/category/${categoryId}`)
    .subscribe((res:any)=>{

      this.subcategories = res;

      if(res.length > 0){
        this.selectSub(res[0]); // default first
      }else{
        this.products = []; // no subcategory
      }

    });

  }

  selectSub(sub:any){

    this.selectedSub = sub;

    this.http.get(`http://localhost:5000/api/products/subcategory/${sub._id}`)
    .subscribe((res:any)=>{
      this.products = res;
    });

  }

  // 🔥 FIXED CATEGORY SWITCH
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
    this.quantities[p._id] = 1;
    this.addToCart(p, 1);
  }

  increase(p:any){
    this.quantities[p._id]++;
    this.addToCart(p, this.quantities[p._id]);
  }

  decrease(p:any){
    if(this.quantities[p._id] > 1){
      this.quantities[p._id]--;
      this.addToCart(p, this.quantities[p._id]);
    }else{
      delete this.quantities[p._id];
      this.removeFromCart(p);
    }
  }

  // 🔥 NEW: LOGIN CHECK FUNCTION
  isLoggedIn(): boolean {
    return !!localStorage.getItem("token");
  }
addToCart(product:any, quantity:number){

  // ❌ NOT LOGGED IN
  if (!this.isLoggedIn()) {
    const confirmLogin = confirm("Please login first");

    if (confirmLogin) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }

    return; // STOP execution
  }

  // ✅ LOGGED IN
  const token = localStorage.getItem("token");

  const headers = new HttpHeaders({
    Authorization:`Bearer ${token}`
  });

  this.http.post("http://localhost:5000/api/cart/add",
  {
    productId: product._id,
    quantity: quantity
  },
  { headers }).subscribe();
}

  removeFromCart(product:any){

    const token = localStorage.getItem("token");

    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

    this.http.delete(
      `http://localhost:5000/api/cart/${product._id}`,
      { headers }
    ).subscribe();
  }

}