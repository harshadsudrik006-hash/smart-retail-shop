import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
providedIn:'root'
})
export class AdminService{

api="http://localhost:5000/api";

constructor(private http:HttpClient){}

/* Dashboard */
getDashboard(){
return this.http.get(`${this.api}/admin/dashboard`);
}

/* Users */
getUsers(){
return this.http.get(`${this.api}/admin/users`);
}

/* Orders */
getOrders(){
return this.http.get(`${this.api}/admin/orders`);
}

/* Products */
getProducts(){
return this.http.get(`${this.api}/products`);
}

addProduct(data:any){
return this.http.post(`${this.api}/products`,data);
}

deleteProduct(id:string){
return this.http.delete(`${this.api}/products/${id}`);
}

updateStock(id:string,data:any){
return this.http.patch(`${this.api}/products/stock/${id}`,data);
}

}