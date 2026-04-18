import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  api = "https://smart-retail-shop-major-project.onrender.com/api";

  constructor(private http:HttpClient){}

  getCategories(){

    return this.http.get(`${this.api}/categories`);

  }

  getSubCategories(categoryId:string){

    return this.http.get(`${this.api}/subcategories/category/${categoryId}`);

  }

}