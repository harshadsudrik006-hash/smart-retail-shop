import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector:'app-profile-address',
  imports: [CommonModule],
  templateUrl:'./profile-address.html'
})
export class ProfileAddress implements OnInit{

  addresses:any[] = [];

  constructor(private http:HttpClient, private router:Router){}

  ngOnInit(){
    this.getAddresses();
  }

  getAddresses(){

    const token = localStorage.getItem("token");

    this.http.get("http://localhost:5000/api/address",{
      headers:{ Authorization:`Bearer ${token}` }
    }).subscribe((res:any)=>{
      this.addresses = res;
    });
  }

  deleteAddress(id:any){

    const token = localStorage.getItem("token");

    this.http.delete(
      `http://localhost:5000/api/address/${id}`,
      {headers:{ Authorization:`Bearer ${token}` }}
    ).subscribe(()=>{
      this.getAddresses();
    });
  }

  // 🔥 FIXED EDIT
  editAddress(a:any){

    localStorage.setItem("editAddress", JSON.stringify(a));

    this.router.navigate(['/add-address']);
  }
}