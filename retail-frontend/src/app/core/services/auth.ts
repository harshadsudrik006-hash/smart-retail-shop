import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  api = "http://localhost:5000/api/auth";

  // 🔥 USER STATE
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // =========================
  // API CALLS
  // =========================
  register(data:any){
    return this.http.post(`${this.api}/register`, data);
  }

  login(data:any){
    return this.http.post(`${this.api}/login`, data);
  }

  googleLogin(data:any){
    return this.http.post(`${this.api}/google-login`, data);
  }

  // =========================
  // USER MANAGEMENT
  // =========================

  setUser(user:any){
    localStorage.setItem("user", JSON.stringify(user));
    this.userSubject.next(user);
  }

  getUserFromStorage(){
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.userSubject.next(null);
  }

}