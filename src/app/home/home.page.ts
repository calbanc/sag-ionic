import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,IonButtons,IonButton,IonIcon, IonModal, IonDatetime ,IonDatetimeButton, IonItem, IonGrid, IonCol,IonRow, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoIonic, ellipsisHorizontal, ellipsisVertical, exitOutline } from 'ionicons/icons';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';




@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonLabel, 
    IonCol, 
    IonGrid, 
    IonItem, 
    IonDatetime, 
    IonModal, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonDatetime,
    IonRow,
    IonDatetimeButton],
})
export class HomePage implements  OnInit  {
  selectedDate: string | null = null;
  public titulo:string='';

  ngOnInit(): void {

    
    this.titulo=localStorage.getItem('username')!;
  }

  constructor(
    private alertController:AlertController,
    private router:Router
  ) {
    addIcons({
      'logo-ionic': exitOutline,
      'ellipsis-horizontal': ellipsisHorizontal,
      'ellipsis-vertical': ellipsisVertical,
    });
  }

  onDateChange(event: CustomEvent) {
    this.selectedDate = event.detail.value; // string en formato ISO (YYYY-MM-DD o ISO completo)
    console.log('Fecha seleccionada:', this.selectedDate);
  }

      async cerrarsesion(){


        
      const alert = await this.alertController.create({
        mode:'ios',
        header: 'Cerrar Sesion',
        message:'Desea cerrar sesion',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
             
            
            }
          }, {
            text: 'Cerrar Sesion',
            handler: () => {
              localStorage.removeItem('username');
              this.router.navigate(['login']);
            
              
            }
          }
        ]
      });
  
       await alert.present();
    }

    cancel() {
      console.log('Usuario canceló');
      this.selectedDate = null;
    }
  
    confirm(modal: IonModal) {
      const dt = document.getElementById('datetime') as HTMLIonDatetimeElement;
      console.log(this.selectedDate);
      dt?.confirm();   
              // Confirma el valor (emite ionChange/ionConfirm)
      modal.dismiss('ok');     // Cierra el modal
    }
  
}
