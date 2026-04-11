import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    alert("Login required");
    return false;
  }

  if (role === "admin") {
    return true;
  }

  alert("Admin access only ❌");
  return false;
};