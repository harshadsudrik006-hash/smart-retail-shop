import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [

  // USER
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home)
  },

  {
    path: 'category/:id',
    loadComponent: () =>
      import('./pages/category/category').then(m => m.Category)
  },

  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products').then(m => m.Products)
  },

  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/products/products').then(m => m.Products)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.Register)
  },

  {
    path: 'email-login/:token',
    loadComponent: () =>
      import('./pages/email.login/email.login').then(m => m.EmailLogin)
  },

  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart').then(m => m.Cart)
  },

  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout').then(m => m.Checkout)
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.Profile)
  },

  {
    path: 'add-address',
    loadComponent: () =>
      import('./pages/add-address/add-address').then(m => m.AddAddress)
  },

  {
    path: 'profile-address',
    loadComponent: () =>
      import('./pages/profile-address/profile-address').then(m => m.ProfileAddress)
  },

  // DELIVERY
  {
    path: 'delivery',
    loadComponent: () =>
      import('./pages/delivery-dashboard/delivery-dashboard').then(m => m.DeliveryDashboard)
  },

  {
    path: 'my-orders',
    loadComponent: () =>
      import('./pages/my-orders/my-orders').then(m => m.MyOrders)
  },

  {
    path: 'track-order/:id',
    loadComponent: () =>
      import('./pages/track-order/track-order').then(m => m.TrackOrder)
  },

  // ADMIN
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/dashboard/dashboard').then(m => m.Dashboard)
  },

  {
    path: 'admin/products',
    loadComponent: () =>
      import('./admin/products/products').then(m => m.Products)
  },

  {
    path: 'admin/products/add',
    loadComponent: () =>
      import('./admin/add-product/add-product').then(m => m.AddProduct)
  },

  {
    path: 'admin/products/edit/:id',
    loadComponent: () =>
      import('./admin/edit-product/edit-product').then(m => m.EditProduct)
  },

  {
    path: 'admin/users',
    loadComponent: () =>
      import('./admin/users/users').then(m => m.Users)
  },

  {
    path: 'admin/orders',
    loadComponent: () =>
      import('./admin/orders/orders').then(m => m.Orders)
  },

  {
    path: 'admin/inventory',
    loadComponent: () =>
      import('./admin/inventory/inventory').then(m => m.Inventory)
  },

  {
    path: 'admin/categories',
    loadComponent: () =>
      import('./admin/categories/categories').then(m => m.Categories)
  },

  {
    path: 'admin/subcategories',
    loadComponent: () =>
      import('./admin/subcategories/subcategories').then(m => m.SubCategories)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}