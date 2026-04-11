import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-email-login',
  standalone: true,
  templateUrl: './email.login.html',
  styleUrl: './email.login.css'
})

export class EmailLogin implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ){}

  ngOnInit(){

    const token = this.route.snapshot.paramMap.get('token');

    this.http.post("http://localhost:5000/api/auth/email-login-verify",{token})
    .subscribe((res:any)=>{

      localStorage.setItem("token",res.token);

      alert("Login Successful");

      this.router.navigate(["/"]);

    });

  }

}