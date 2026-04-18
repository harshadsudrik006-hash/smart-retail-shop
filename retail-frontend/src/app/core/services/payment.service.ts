import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  // ✅ FIXED BASE URL
  private baseUrl = "https://smart-retail-shop-major-project.onrender.com/api/payment";

  constructor(private http: HttpClient) {}

  createOrder(amount: number) {
    return this.http.post(`${this.baseUrl}/create`, { amount });
  }

  getKey() {
    return this.http.get(`${this.baseUrl}/key`);
  }
}