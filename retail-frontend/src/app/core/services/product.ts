import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn:'root'
})
export class ProductService {

  api = "https://smart-retail-shop-major-project.onrender.com/api/products";

  constructor(private http: HttpClient){}

  // 🔥 Get by Subcategory
  getProductsBySubcategory(id:string){
    return this.http.get(`${this.api}/subcategory/${id}`);
  }

  // 🔥 Search Products
  searchProducts(query:string){
    return this.http.get(`${this.api}/search?q=${query}`);
  }

  // 🔥 Get Single Product (future use)
  getProductById(id:string){
    return this.http.get(`${this.api}/${id}`);
  }

  // 🔥 Get All Products (optional)
  getAllProducts(){
    return this.http.get(`${this.api}`);
  }

  imageSearch(data:any){
  return this.http.post(`${this.api}/image-search`, data);
}

}