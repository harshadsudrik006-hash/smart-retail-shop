import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductService } from '../../core/services/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  products: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(){

    this.route.params.subscribe(params => {

      const subcategoryId = params['id'];

      this.route.queryParams.subscribe(query => {

        const search = query['q'];

        this.loadProducts(search, subcategoryId);

        // 🔁 RETRY (important for Render sleep issue)
        setTimeout(() => {
          if(this.products.length === 0){
            this.loadProducts(search, subcategoryId);
          }
        }, 3000);

      });

    });

  }

  // 🔥 MAIN FUNCTION
  loadProducts(search:any, subcategoryId:any){

    this.loading = true;

    if(search){

      this.productService.searchProducts(search)
        .subscribe({
          next: (res:any)=>{
            this.products = res;
            this.loading = false;
          },
          error: ()=>{
            this.loading = false;
          }
        });

    }

    else if(subcategoryId){

      this.productService.getProductsBySubcategory(subcategoryId)
        .subscribe({
          next: (res:any)=>{
            this.products = res;
            this.loading = false;
          },
          error: ()=>{
            this.loading = false;
          }
        });

    }

    else{
      this.products = [];
      this.loading = false;
    }

  }

}