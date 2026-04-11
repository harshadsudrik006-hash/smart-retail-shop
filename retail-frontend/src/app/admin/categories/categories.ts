import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
selector:'app-categories',
standalone:true,
imports:[CommonModule,FormsModule],
templateUrl:'./categories.html',
styleUrl:'./categories.css'
})
export class Categories implements OnInit{

categories:any[]=[];
name="";

selectedCategory:any=null;
updatedName="";

constructor(private http:HttpClient){}

ngOnInit(){
this.loadCategories();
}

loadCategories(){
this.http.get("http://localhost:5000/api/categories")
.subscribe((res:any)=>{
this.categories=res;
});
}

addCategory(){
const token = localStorage.getItem("token");

this.http.post(
"http://localhost:5000/api/categories",
{ name:this.name },
{
headers:{ Authorization:`Bearer ${token}` }
}
).subscribe(()=>{
alert("Category Added");
this.name="";
this.loadCategories();
});
}

editCategory(cat:any){
this.selectedCategory = cat;
this.updatedName = cat.name;
}

updateCategory(){
const token = localStorage.getItem("token");

this.http.put(
`http://localhost:5000/api/categories/${this.selectedCategory._id}`,
{ name:this.updatedName },
{ headers:{ Authorization:`Bearer ${token}` } }
).subscribe(()=>{
alert("Updated");
this.selectedCategory=null;
this.loadCategories();
});
}

deleteCategory(id:string){
const token = localStorage.getItem("token");

this.http.delete(
`http://localhost:5000/api/categories/${id}`,
{ headers:{ Authorization:`Bearer ${token}` } }
).subscribe(()=>{
alert("Deleted");
this.loadCategories();
});
}

goBack(){
window.history.back();
}
}