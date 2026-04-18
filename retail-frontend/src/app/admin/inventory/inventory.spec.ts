import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
selector:'app-inventory',
standalone:true,
imports:[CommonModule],
templateUrl:'./inventory.html',
styleUrls:['./inventory.css']   // ✅ FIXED (styleUrl → styleUrls)
})

export class Inventory implements OnInit{

// ✅ ADD THIS
API = "https://smart-retail-shop-major-project.onrender.com/api";

products:any[]=[];

constructor(private http:HttpClient){}

ngOnInit(){

const token = localStorage.getItem("token");

const headers = new HttpHeaders({
Authorization:`Bearer ${token}`
});

// ❌ OLD
// this.http.get("http://localhost:5000/api/products",{headers})

// ✅ FIXED
this.http.get(`${this.API}/products`,{headers})
.subscribe((res:any)=>{

this.products=res;

});

}

}