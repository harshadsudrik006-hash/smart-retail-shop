import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
selector:'app-dashboard',
standalone:true,
imports:[CommonModule, RouterLink],
templateUrl:'./dashboard.html',
styleUrl:'./dashboard.css'
})

export class Dashboard implements OnInit{

stats:any={};
lowStock:any[]=[];

constructor(private http:HttpClient){}

ngOnInit(){

const token = localStorage.getItem("token");

if(!token){
  alert("Login required");
  return;
}

const headers = new HttpHeaders({
  Authorization:`Bearer ${token}`
});


/* Dashboard Stats */
this.http.get("http://localhost:5000/api/admin/dashboard",{headers})
.subscribe({

next:(res:any)=>{
console.log("Dashboard API:",res);
this.stats=res;
},

error:(err)=>{
console.log("Dashboard Error:",err);
}

});


/* Low Stock Products */
this.http.get("http://localhost:5000/api/products/low-stock",{headers})
.subscribe({

next:(res:any)=>{
console.log("Low Stock:",res);
this.lowStock=res;
},

error:(err)=>{
console.log("Low Stock Error:",err);
}

});

}

}