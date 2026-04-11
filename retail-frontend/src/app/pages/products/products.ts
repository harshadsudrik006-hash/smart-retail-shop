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

  products:any[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(){

    // 🔥 SINGLE SUBSCRIPTION (CLEAN)
    this.route.params.subscribe(params => {

      const subcategoryId = params['id'];

      this.route.queryParams.subscribe(query => {

        const search = query['q'];

        // 🔍 SEARCH MODE
        if(search){

          console.log("Searching:", search);

          this.products = []; // clear old data

          this.productService.searchProducts(search)
          .subscribe((res:any)=>{
            this.products = res;
          });

        }

        // 📦 SUBCATEGORY MODE
        else if(subcategoryId){

          console.log("SubCategory ID:", subcategoryId);

          this.products = []; // clear old data

          this.productService.getProductsBySubcategory(subcategoryId)
          .subscribe((res:any)=>{
            this.products = res;
          });

        }

        // ❌ NO DATA
        else{
          this.products = [];
        }

      });

    });

  }

}