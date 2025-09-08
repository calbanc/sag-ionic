import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonRow,IonCol , IonGrid ,IonButton,IonInput, IonLabel, IonItem } from '@ionic/angular/standalone';
import { IonDatetime, IonDatetimeButton, IonModal } from '@ionic/angular/standalone';

import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, 
    IonRow, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule,
    IonCol,
    IonGrid,
    IonButton,
    IonInput
  ]
})
export class LoginPage implements OnInit {
  username: string = '';
  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    
    
    // Validar si hay un username guardado en localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      
      this.username = savedUsername;
      // Opcional: redirigir automáticamente si ya está logueado
      this.router.navigate(['home']);
    } else {
      
    }
  }

  guardarusuario(){ 
    localStorage.setItem('username', this.username);    
    this.router.navigate(['home']);  

  }

}
