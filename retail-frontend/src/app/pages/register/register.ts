import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { RouterLink } from '@angular/router';

@Component({
 selector:'app-register',
 standalone:true,
 imports:[FormsModule, RouterLink],
 templateUrl:'./register.html',
 styleUrl:'./register.css'
})

export class Register {

 name="";
 email="";
 password="";

 constructor(private auth:Auth){}

 register(){

  const data={
    name:this.name,
    email:this.email,
    password:this.password
  }

  this.auth.register(data).subscribe({

    next:(res:any)=>{
      alert("Register successful");
    },

    error:(err)=>{

      console.log("REGISTER ERROR:",err);

      if(err.error?.message){
        alert(err.error.message);
      }else{
        alert("Register failed");
      }

    }

  });

}

}