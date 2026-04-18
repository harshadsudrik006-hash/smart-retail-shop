import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector:'app-track-order',
  standalone:true,
  imports:[CommonModule],
  templateUrl:'./track-order.html',
  styleUrl:'./track-order.css'
})
export class TrackOrder implements OnInit, OnDestroy{

  // ✅ ADDED (GLOBAL API)
  API = "https://smart-retail-shop-major-project.onrender.com/api";

  order:any;
  map:any;
  marker:any;
  intervalId:any;

  constructor(
    private route:ActivatedRoute,
    private http:HttpClient,
    private router:Router
  ){}

  ngOnInit(){

    const id = this.route.snapshot.paramMap.get("id");
    const token = localStorage.getItem("token");

    if(!token){
      this.router.navigate(['/login']);
      return;
    }

    // 🔥 FIRST LOAD
    this.loadOrder(id, token);

    // 🔥 AUTO REFRESH EVERY 5 SEC
    this.intervalId = setInterval(()=>{
      this.loadOrder(id, token);
    },5000);
  }

  ngOnDestroy(){
    if(this.intervalId){
      clearInterval(this.intervalId);
    }
  }

  loadOrder(id:any, token:any){

    this.http.get(
      `${this.API}/orders/track/${id}`,   // ✅ FIXED
      {
        headers:{ Authorization:`Bearer ${token}` }
      }
    ).subscribe((res:any)=>{

      this.order = res;

      // ✅ wait for DOM render
      setTimeout(() => {
        this.initMap();
      }, 100);

    });
  }

  initMap(){

    let lat = 23.0225;
    let lng = 72.5714;

    // ✅ SAFE CHECK
    if(
      this.order?.deliveryLocation &&
      this.order.deliveryLocation.lat != null &&
      this.order.deliveryLocation.lng != null
    ){
      lat = Number(this.order.deliveryLocation.lat);
      lng = Number(this.order.deliveryLocation.lng);
    }

    // ❌ EXTRA SAFETY
    if(isNaN(lat) || isNaN(lng)){
      console.log("Invalid location, using default");
      lat = 23.0225;
      lng = 72.5714;
    }

    // ✅ CREATE MAP ONLY ONCE
    if(!this.map){

      this.map = L.map('map').setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'© OpenStreetMap'
      }).addTo(this.map);

      this.marker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup("Order Location")
        .openPopup();

    } 
    else {

      this.map.setView([lat, lng], 15);

      if(this.marker){
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }

    }
  }

}