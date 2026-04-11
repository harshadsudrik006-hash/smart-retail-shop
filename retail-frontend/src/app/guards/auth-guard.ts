import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  const token = localStorage.getItem("token");

  if (token) {
    return true;
  }

  alert("Login required");
  return false;
};