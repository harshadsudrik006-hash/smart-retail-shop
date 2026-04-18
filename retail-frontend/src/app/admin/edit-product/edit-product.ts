import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
selector:'app-edit-product',
standalone:true,
imports:[CommonModule, FormsModule],
templateUrl:'./edit-product.html',
styleUrl:'./edit-product.css'
})
export class EditProduct implements OnInit{

// ✅ GLOBAL API
API = "https://smart-retail-shop-major-project.onrender.com/api";

id="";
name="";
price=0;
stock=0;
image:any;
preview="";

constructor(
private route:ActivatedRoute,
private http:HttpClient,
private router:Router
){}

ngOnInit(){
this.id = this.route.snapshot.paramMap.get("id") || "";
this.loadProduct();
}

/* Load Product */
loadProduct(){

this.http.get(`${this.API}/products`)
.subscribe((res:any)=>{

const product = res.find((p:any)=>p._id === this.id);

if(product){
  this.name = product.name;
  this.price = product.price;
  this.stock = product.stock;
  this.preview = product.image;
}

});

}

/* Image Select */
onFileChange(event:any){

this.image = event.target.files[0];

const reader = new FileReader();

reader.onload = ()=>{
this.preview = reader.result as string;
};

reader.readAsDataURL(this.image);

}

/* Update */
update(){

const token = localStorage.getItem("token");

const headers = new HttpHeaders({
Authorization:`Bearer ${token}`
});

const formData = new FormData();

formData.append("name",this.name);
formData.append("price",this.price.toString());
formData.append("stock",this.stock.toString());

if(this.image){
formData.append("image",this.image);
}

this.http.put(
`${this.API}/products/${this.id}`,
formData,
{headers}
).subscribe({

next:()=>{
alert("Product Updated");
this.router.navigate(['/admin/products']);
},

error:(err)=>{
console.log(err);
alert("Update failed");
}

});

}

goBack(){
window.history.back();
}

}