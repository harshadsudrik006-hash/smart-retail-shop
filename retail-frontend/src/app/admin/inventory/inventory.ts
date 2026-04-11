import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
selector:'app-inventory',
standalone:true,
imports:[CommonModule],
templateUrl:'./inventory.html',
styleUrl:'./inventory.css'
})
export class Inventory implements OnInit{

products:any[]=[];

constructor(private http:HttpClient){}

ngOnInit(){

this.http.get("http://localhost:5000/api/products")
.subscribe((res:any)=>{
this.products=res;
});

}

goBack(){
    window.history.back();
}

}