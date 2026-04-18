import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector:'app-profile-address',
  standalone:true,   // ✅ ADDED (important)
  imports: [CommonModule],
  templateUrl:'./profile-address.html'
})
export class ProfileAddress implements OnInit{

  // ✅ ADDED GLOBAL API
  API = "https://smart-retail-shop-major-project.onrender.com/api";

  addresses:any[] = [];

  constructor(private http:HttpClient, private router:Router){}

  ngOnInit(){
    this.getAddresses();
  }

  getAddresses(){

    const token = localStorage.getItem("token");

    // ✅ UPDATED
    this.http.get(`${this.API}/address`,{
      headers:{ Authorization:`Bearer ${token}` }
    }).subscribe((res:any)=>{
      this.addresses = res;
    });
  }

  deleteAddress(id:any){

    const token = localStorage.getItem("token");

 
    // ✅ UPDATED
    this.http.delete(
      `${this.API}/address/${id}`,
      {headers:{ Authorization:`Bearer ${token}` }}
    ).subscribe(()=>{
      this.getAddresses();
    });
  }

  // 🔥 FIXED EDIT (unchanged)
  editAddress(a:any){

    localStorage.setItem("editAddress", JSON.stringify(a));

    this.router.navigate(['/add-address']);
  }
}