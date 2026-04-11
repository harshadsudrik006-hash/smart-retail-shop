import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  categories:any[]=[];
  homeData:any[]=[];

  quantities:any = {};

  // CHAT
  messages:any[]=[];
  userMsg="";
  showChat=false;

constructor(
  private http:HttpClient,
  private chat:ChatService,
  private router:Router   // 🔥 ADD THIS
){}

  ngOnInit(){

    this.http.get("http://localhost:5000/api/categories")
    .subscribe((res:any)=>{
      this.categories = res;
    });

    this.http.get("http://localhost:5000/api/products")
    .subscribe((res:any)=>{

      const grouped:any = {};

      res.forEach((p:any)=>{
        const cat = p.category?.name || "Other";

        if(!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
      });

      this.homeData = Object.keys(grouped).map(key=>({
        title:key,
        products:grouped[key].slice(0,10)
      }));

    });

  }

  // CART LOGIC
  add(p:any){
    this.quantities[p._id] = 1;
    this.addToCart(p,1);
  }

  increase(p:any){
  this.quantities[p._id]++;

  // ✅ ALWAYS SEND +1 ONLY
  this.addToCart(p, 1);
}

decrease(p:any){

  if(this.quantities[p._id] > 1){
    this.quantities[p._id]--;

    // ✅ SEND -1 USING SAME API
    this.addToCart(p, -1);

  }else{
    delete this.quantities[p._id];
    this.removeFromCart(p);
  }

}

addToCart(product:any, quantity:number){

  const token = localStorage.getItem("token");

  if(!token){
    alert("Please login first ❌");
    this.router.navigate(['/login']);
    return;
  }

  this.http.post(
    "http://localhost:5000/api/cart/add",
    {
      productId: product._id,
      quantity: quantity   // ✅ now can be +1 OR -1
    },
    {
      headers:{
        Authorization:`Bearer ${token}`
      }
    }
  ).subscribe({
    next:()=>{
      console.log("Cart updated ✅");

      // 🔥 UPDATE NAVBAR
      window.dispatchEvent(new Event('cartUpdated'));
    },
    error:(err)=>{
      console.log("Cart error:", err);
    }
  });

}

removeFromCart(product:any){

  const token = localStorage.getItem("token");

  if(!token){
    console.log("User not logged in");
    return;
  }

  this.http.delete(
    `http://localhost:5000/api/cart/${product._id}`,
    {
      headers:{
        Authorization:`Bearer ${token}`
      }
    }
  ).subscribe({
    next:()=>{
      console.log("Removed from cart ✅");

      // 🔥🔥🔥 IMPORTANT LINE
      window.dispatchEvent(new Event('cartUpdated'));

    },
    error:(err)=>{
      console.log("Remove error:", err);
    }
  });

}

  // CHAT
  toggleChat(){
    this.showChat = !this.showChat;
  }

//   send(){

//   if(!this.userMsg.trim()) return;

//   this.messages.push({text:this.userMsg,type:'user'});

//   const msg = this.userMsg;
//   this.userMsg="";

//   this.chat.sendMessage(msg).subscribe({
//     next:(res:any)=>{

//       let botMsg:any = {
//         type:'bot',
//         text: res.reply
//       };

//       // 🔥 CONVERT BULLET TEXT → LIST
//       if(res.reply && res.reply.includes("•")){

//         const lines = res.reply.split("\n").filter((l:string)=>l.includes("•"));

//         const list = lines.map((l:string)=>{
//           const parts = l.replace("•","").split("₹");

//           return {
//             name: parts[0]?.trim(),
//             price: parts[1]?.split(" ")[0] || ""
//           };
//         });

//         botMsg = {
//           type:'bot',
//           text: res.reply.split("\n")[0], // title
//           list: list
//         };
//       }

//       this.messages.push(botMsg);
//     },
//     error:()=>{
//       this.messages.push({text:'Server error ❌',type:'bot'});
//     }
//   });

// }

send(){

  if(!this.userMsg.trim()) return;

  this.messages.push({text:this.userMsg,type:'user'});

  const msg = this.userMsg;
  this.userMsg="";

  this.chat.sendMessage(msg).subscribe({
    next:(res:any)=>{

      // 🟢 TEXT RESPONSE
      if(res.type === 'text'){
        this.messages.push({
          type:'bot',
          text: res.reply
        });
      }

      // 🟢 LIST / PRODUCTS RESPONSE
      else if(res.type === 'list' || res.type === 'products'){
        this.messages.push({
          type:'bot',
          text: res.title,
          list: res.data   // 🔥 IMPORTANT
        });
      }

    },
    error:()=>{
      this.messages.push({text:'Server error ❌',type:'bot'});
    }
  });

}

}