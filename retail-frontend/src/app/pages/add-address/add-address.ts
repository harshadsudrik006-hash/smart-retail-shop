import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector:'app-add-address',
  standalone:true,
  imports:[CommonModule, FormsModule],
  templateUrl:'./add-address.html',
  styleUrl:'./add-address.css'
})
export class AddAddress implements OnInit, AfterViewInit {

  // ✅ ADDED (GLOBAL API)
  API = "https://smart-retail-shop-major-project.onrender.com/api";

  map:any;
  marker:any;

  selected:any=null;

  searchText="";
  searchResults:any[]=[];
  searchTimeout:any;   // 🔥 debounce

  flat="";
  building="";
  floor="";
  landmark="";
  type="home";

  editMode=false;
  editId:any;

  constructor(private http:HttpClient, private router:Router){}

  ngOnInit(){

    const data = localStorage.getItem("editAddress");

    if(data){
      const a = JSON.parse(data);

      this.editMode = true;
      this.editId = a._id;

      this.flat = a.flat;
      this.building = a.building;
      this.floor = a.floor;
      this.landmark = a.landmark;
      this.type = a.type;

      this.selected = {
        display_name: a.address,
        lat: a.lat,
        lon: a.lng
      };

      localStorage.removeItem("editAddress");
    }
  }

  ngAfterViewInit(){

    setTimeout(()=>{

      this.map = L.map('map').setView([23.0225,72.5714],13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        .addTo(this.map);

      this.map.on('click',(e:any)=>{
        const {lat,lng} = e.latlng;
        this.setMarker(lat,lng);
        this.reverseGeocode(lat,lng);
      });

      if(this.selected){
        this.setMarker(this.selected.lat, this.selected.lon);
      }

      this.map.invalidateSize();

    },200);
  }

  /* 📌 MARKER */
  setMarker(lat:number,lng:number){
    if(this.marker){
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat,lng]).addTo(this.map);
    this.map.setView([lat,lng],15);
  }

  /* 🔍 SEARCH WITH DEBOUNCE */
  onSearchChange(){
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(()=>{
      this.searchAddress();
    }, 400);
  }

  searchAddress(){

    if(!this.searchText.trim()){
      this.searchResults=[];
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${this.searchText}&countrycodes=in&limit=5&addressdetails=1`;

    const headers = {
      'Accept-Language': 'en'
    };

    this.http.get(url, { headers }).subscribe((res:any)=>{
      this.searchResults = res;
    });
  }

  /* 📍 SELECT LOCATION */
  selectLocation(place:any){

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    this.setMarker(lat,lon);

    this.selected = {
      display_name: place.display_name,
      lat: lat,
      lon: lon
    };

    this.searchResults=[];
  }

  /* 📍 CURRENT LOCATION */
  getCurrentLocation(){

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos:any)=>{

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        this.setMarker(lat,lng);
        this.reverseGeocode(lat,lng);

      }, ()=>{
        alert("Location permission denied ❌");
      });
    }
  }

  /* 🌍 REVERSE */
  reverseGeocode(lat:number,lon:number){

    this.http.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    ).subscribe((res:any)=>{
      this.selected = res;
    });
  }

  /* 💾 SAVE */
  saveAddress(){

    if(!this.selected){
      alert("Select location first");
      return;
    }

    const token = localStorage.getItem("token");

    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

    const body = {
      address:this.selected.display_name,
      lat:this.selected.lat,
      lng:this.selected.lon,
      flat:this.flat,
      building:this.building,
      floor:this.floor,
      landmark:this.landmark,
      type:this.type
    };

    if(this.editMode && this.editId){

      this.http.put(
        `${this.API}/address/${this.editId}`,   // ✅ FIXED
        body,
        {headers}
      ).subscribe(()=>{
        alert("Updated ✅");
        this.router.navigate(['/profile']);
      });

    }else{

      this.http.post(
        `${this.API}/address`,   // ✅ FIXED
        body,
        {headers}
      ).subscribe(()=>{
        alert("Saved ✅");
        this.router.navigate(['/profile']);
      });
    }
  }
}