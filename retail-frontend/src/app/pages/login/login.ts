import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Auth } from '../../core/services/auth';

declare const google:any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  email: string = "";
  password: string = "";

  // 🔥 NEW: return URL store
  returnUrl: string = "/";

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute   // 🔥 ADD THIS
  ) {}

  ngOnInit(){

    // 🔥 GET RETURN URL
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || "/";

    google.accounts.id.initialize({
      client_id: "508010564221-lnrvaci9ho46saognags6ih4gon461h8.apps.googleusercontent.com",
      callback: this.handleGoogle.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",
        size: "large",
        width: 260
      }
    );

  }

  /* ================= REDIRECT ================= */
  redirectUser(user:any){

    switch(user?.role){

      case "admin":
      case "manager":
        this.router.navigate(["/admin"]);
        break;

      case "staff":
        this.router.navigate(["/admin/inventory"]);
        break;

      case "delivery":
        this.router.navigate(["/delivery"]);
        break;

      default:
        // 🔥 IMPORTANT CHANGE
        this.router.navigateByUrl(this.returnUrl);
    }

  }

  /* ================= GOOGLE RESPONSE ================= */
  handleGoogle(response:any){

    const idToken = response.credential;

    this.auth.googleLogin({ token: idToken }).subscribe({

      next: (res:any) => {

        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.user.role);

        this.auth.setUser(res.user);

        alert("Google Login Successful ✅");

        this.redirectUser(res.user);

      },

      error: (err) => {
        console.log("GOOGLE LOGIN ERROR:", err);
        alert("Google login failed ❌");
      }

    });

  }

  /* ================= NORMAL LOGIN ================= */
  login(){

    if(!this.email || !this.password){
      alert("Please enter email and password");
      return;
    }

    const data = {
      email: this.email,
      password: this.password
    };

    this.auth.login(data).subscribe({

      next: (res:any) => {

        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.user.role);

        this.auth.setUser(res.user);

        alert("Login Successful ✅");

        this.redirectUser(res.user);

      },

      error: (err) => {

        console.log("LOGIN ERROR:", err);

        if(err.error?.message){
          alert(err.error.message);
        } else {
          alert("Login failed. Check backend.");
        }

      }

    });

  }

}