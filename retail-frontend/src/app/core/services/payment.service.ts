import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private baseUrl = "http://localhost:5000/api/payment";

  constructor(private http: HttpClient) {}

  createOrder(amount: number) {
    return this.http.post(`${this.baseUrl}/create`, { amount });
  }

  getKey() {
    return this.http.get(`${this.baseUrl}/key`);
  }
}