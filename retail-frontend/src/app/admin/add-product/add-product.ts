import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
selector:'app-add-product',
standalone:true,
imports:[CommonModule, FormsModule],
templateUrl:'./add-product.html',
styleUrl:'./add-product.css'
})
export class AddProduct implements OnInit{

name="";
price=0;
originalPrice=0;   // 🔥 NEW
weight="";         // 🔥 NEW
stock=0;
description="";

category="";
subCategory="";

image:any;
preview:any = null; // 🔥 IMAGE PREVIEW

categories:any[]=[];
subcategories:any[]=[];

constructor(private http:HttpClient, private router:Router){}

ngOnInit(){
this.loadCategories();
}

/* Load Categories */
loadCategories(){
this.http.get("http://localhost:5000/api/categories")
.subscribe((res:any)=>{
this.categories=res;
});
}

/* Load SubCategories */
loadSubCategories(){
this.http.get(`http://localhost:5000/api/subcategories/category/${this.category}`)
.subscribe((res:any)=>{
this.subcategories=res;
});
}

/* Image Select */
onFileChange(event:any){
this.image = event.target.files[0];

if(this.image){
  const reader = new FileReader();
  reader.onload = () => {
    this.preview = reader.result; // 🔥 preview
  };
  reader.readAsDataURL(this.image);
}
}

/* Submit */
submit(){

if(!this.name || !this.price || !this.category){
  alert("Please fill required fields");
  return;
}

const token = localStorage.getItem("token");

const headers = new HttpHeaders({
Authorization:`Bearer ${token}`
});

const formData = new FormData();

formData.append("name",this.name);
formData.append("price",this.price.toString());
formData.append("originalPrice",this.originalPrice.toString()); // 🔥
formData.append("weight",this.weight); // 🔥
formData.append("stock",this.stock.toString());
formData.append("description",this.description);
formData.append("category",this.category);
formData.append("subCategory",this.subCategory);

if(this.image){
formData.append("image",this.image);
}

this.http.post("http://localhost:5000/api/products",formData,{headers})
.subscribe({

next:()=>{
alert("Product Added ✅");
this.router.navigate(['/admin/products']);
},

error:(err)=>{
console.log(err);
alert("Error adding product");
}

});
}

goBack(){
window.history.back();
}

}