import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
selector:'app-subcategories',
standalone:true,
imports:[CommonModule,FormsModule],
templateUrl:'./subcategories.html',
styleUrl:'./subcategories.css'
})

export class SubCategories implements OnInit{

categories:any[]=[];
subcategories:any[]=[];

name="";
selectedCategory="";

constructor(private http:HttpClient){}

ngOnInit(){

this.loadCategories();
this.loadSubCategories();

}

loadCategories(){

this.http.get("http://localhost:5000/api/categories")
.subscribe((res:any)=>{
this.categories=res;
});

}

loadSubCategories(){

this.http.get("http://localhost:5000/api/subcategories")
.subscribe((res:any)=>{
this.subcategories=res;
});

}

addSubCategory(){

const token = localStorage.getItem("token");

const headers = new HttpHeaders({
Authorization:`Bearer ${token}`
});

this.http.post(
"http://localhost:5000/api/subcategories",
{
name:this.name,
category:this.selectedCategory
},
{headers}
).subscribe(()=>{

alert("SubCategory Added");

this.name="";
this.selectedCategory="";

this.loadSubCategories();

});

}

deleteSubCategory(id:string){

const token = localStorage.getItem("token");

const headers = new HttpHeaders({
Authorization:`Bearer ${token}`
});

this.http.delete(
`http://localhost:5000/api/subcategories/${id}`,
{headers}
).subscribe(()=>{

alert("SubCategory Deleted");

this.loadSubCategories();

});

}

selectedSub:any=null;
updatedSubName:string='';

editSubCategory(sub:any){
this.selectedSub = sub;
this.updatedSubName = sub.name;
}

updateSubCategory(){
const token = localStorage.getItem("token");

this.http.put(
`http://localhost:5000/api/subcategories/${this.selectedSub._id}`,
{ name:this.updatedSubName },
{
headers:{ Authorization:`Bearer ${token}` }
}
).subscribe(()=>{
alert("Updated");
this.selectedSub=null;
this.loadSubCategories();
});
}

goBack(){
    window.history.back();
}

}