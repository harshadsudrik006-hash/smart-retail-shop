import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector:'app-admin-products',
  standalone:true,
  imports:[CommonModule, RouterModule],
  templateUrl:'./products.html',
  styleUrl:'./products.css'
})
export class Products implements OnInit{

  products:any[] = [];

  // 🔥 FIXED API (NO LOCALHOST)
  api = "https://smart-retail-shop-major-project.onrender.com/api/products";

  constructor(private http:HttpClient){}

  ngOnInit(){

    const token = localStorage.getItem("token");

    this.http.get(this.api,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .subscribe((res:any)=>{
      this.products = res;
    });

  }

  deleteProduct(id:string){

    const token = localStorage.getItem("token");

    this.http.delete(`${this.api}/${id}`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .subscribe(()=>{

      alert("Product deleted");

      this.products = this.products.filter(p=>p._id !== id);

    });

  }

  goBack(){
    window.history.back();
  }

  downloadExcel(){

    const token = localStorage.getItem("token");

    fetch(`${this.api}/stock-excel`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then(res => res.blob())
    .then(blob => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "stock-report.xlsx";
      a.click();

    });

  }

}