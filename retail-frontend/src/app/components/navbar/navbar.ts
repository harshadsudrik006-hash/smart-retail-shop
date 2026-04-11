import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔥 ADD
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { ProductService } from '../../core/services/product';
import { CartService } from '../../core/services/cart';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  searchText:string = "";
  user:any = null;
  role:string = '';
  fileInput:any;
  socket:any;

  cartCount:number = 0;

  constructor(
    private router:Router,
    private auth:Auth,
    private productService:ProductService,
    private cartService:CartService,
    private http:HttpClient,
    private cd: ChangeDetectorRef   // 🔥 ADD
  ){}

  ngOnInit(){

    this.auth.user$.subscribe(u=>{
      this.user = u;
      this.role = u?.role || '';
    });

    // 🔥 KEEP (but ignore)
    this.cartService.cartCount$.subscribe(count=>{
      // ignore local cart
    });

    // 🔥 LOAD INITIAL COUNT
    this.loadCartCount();

    // 🔥 LISTEN EVENT (REAL-TIME FIX)
    window.addEventListener('cartUpdated', ()=>{
      this.loadCartCount();

      // 🔥 FORCE UI UPDATE
      this.cd.detectChanges();
    });

  }

  // 🔥 BACKEND CART COUNT
  loadCartCount(){

    const token = localStorage.getItem("token");

    if(!token){
      this.cartCount = 0;
      return;
    }

    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

    this.http.get("http://localhost:5000/api/cart", {headers})
    .subscribe((res:any)=>{

      const items = res?.items || [];

      let count = 0;

      items.forEach((item:any)=>{
        count += item.quantity;
      });

      this.cartCount = count;

      // 🔥 FORCE UPDATE (important)
      this.cd.detectChanges();

    });

  }

  // 🔍 SEARCH
  search(){
    if(!this.searchText.trim()) return;

    this.router.navigate(['/products'], {
      queryParams: { q: this.searchText }
    });
  }

  // 📸 IMAGE SEARCH
  onImageSearch(event:any){
    const file = event.target.files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append("image", file);

    this.productService.imageSearch(formData)
    .subscribe((res:any)=>{
      if(res?.name){
        this.searchText = res.name;
        this.search();
      }else{
        alert("No product found");
      }
    });
  }

  triggerFileInput(input:any){
    input.click();
  }

  goHome() {
    const role = this.role || localStorage.getItem('role');

    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } 
    else if (role === 'delivery') {
      this.router.navigate(['/delivery']);
    } 
    else {
      this.router.navigate(['/']);
    }
  }

  logout(){
    this.auth.logout();
    this.router.navigate(['/']);
  }

  goProfile(){
    this.router.navigate(['/profile']);
  }

  goCart(){
    this.router.navigate(['/cart']);
  }

}