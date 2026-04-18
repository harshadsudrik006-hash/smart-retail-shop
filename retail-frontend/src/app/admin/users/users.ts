import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  API = "https://smart-retail-shop-major-project.onrender.com"; // ✅ ADD THIS

  users: any[] = [];
  filteredUsers: any[] = [];
  searchText: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  // 🔹 COMMON HEADER METHOD
  getHeaders() {
    const token = localStorage.getItem("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 🔹 LOAD USERS
  loadUsers() {
    this.loading = true;

    this.http.get(`${this.API}/api/admin/users`, {
      headers: this.getHeaders()
    })
    .subscribe({
      next: (res: any) => {
        this.users = res;
        this.filteredUsers = res;
        this.loading = false;
      },
      error: () => {
        alert("Failed to load users");
        this.loading = false;
      }
    });
  }

  // 🔹 SEARCH
  onSearch() {
    const value = this.searchText.toLowerCase();

    this.filteredUsers = this.users.filter(u =>
      u.name.toLowerCase().includes(value) ||
      u.email.toLowerCase().includes(value) ||
      u.role.toLowerCase().includes(value)
    );
  }

  // 🔹 UPDATE ROLE
  updateRole(user: any) {

    this.http.put(
      `${this.API}/api/admin/user-role`,
      {
        userId: user._id,
        role: user.role
      },
      { headers: this.getHeaders() }
    )
    .subscribe({
      next: () => {
        this.showToast("✅ Role updated successfully");
      },
      error: () => {
        this.showToast("❌ Failed to update role");
      }
    });
  }

  // 🔹 DELETE CONFIRM
  confirmDelete(user: any) {
    const ok = confirm(`Delete ${user.name}?`);
    if (ok) {
      this.deleteUser(user._id);
    }
  }

  // 🔹 DELETE USER
  deleteUser(id: string) {

    this.http.delete(
      `${this.API}/api/admin/users/${id}`,
      { headers: this.getHeaders() }
    )
    .subscribe({
      next: () => {
        this.showToast("🗑️ User deleted");
        this.loadUsers();
      },
      error: () => {
        this.showToast("❌ Delete failed");
      }
    });
  }

  // 🔹 SIMPLE TOAST
  showToast(message: string) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.className = 'custom-toast';

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2500);
  }

  // 🔹 BACK
  goBack() {
    window.history.back();
  }
}