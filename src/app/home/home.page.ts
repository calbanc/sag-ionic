import { Component, OnInit } from '@angular/core';
import {IonSelect,IonSelectOption,IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonModal, IonDatetime, IonDatetimeButton, IonItem, IonGrid, IonCol, IonRow, IonLabel, IonFab, IonFabButton, IonList, IonAvatar, IonImg, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonInput, IonToggle, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoIonic, ellipsisHorizontal, ellipsisVertical, exitOutline, addOutline } from 'ionicons/icons';
import { AlertController, LoadingController ,ToastController} from '@ionic/angular';
import { Router } from '@angular/router';
import { MainService } from './main.service';
import { dataModel } from './dataModel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs/dist/exceljs.min.js';

import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonFooter, IonInput, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonImg, IonAvatar, IonList,
    IonFabButton,
    IonFab,
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
    IonModal,
    IonLabel,
    IonDatetimeButton,
    CommonModule,
    FormsModule, IonSelectOption, IonSelect, IonToggle],
})
export class HomePage implements  OnInit  {
  selectedDate: string | null = null;
  
  public titulo:string='';
  public datosmodel:dataModel;
  public data:Sag[] | []=[];
  public presentingElement!: HTMLElement|null;  
  programaOptions: Opciones[] = [];
  actividadOptions: Opciones[] = [];

  constructor(
    private alertController:AlertController,
    private router:Router,
    private mainService:MainService,
    private loadingController:LoadingController,
    private toastController:ToastController,
    private http: HttpClient
  ) {
    addIcons({
      'logo-ionic': exitOutline,
      'add':addOutline,
      'ellipsis-horizontal': ellipsisHorizontal,
      'ellipsis-vertical': ellipsisVertical,
    });
    this.datosmodel=new dataModel(localStorage.getItem('username')!,"",  this.hhmmNow(), // inicio
    this.hhmmNow(),"","","","",false);
  }
  ngOnInit(): void {
    this.titulo = localStorage.getItem('username')!;
    const today = new Date();
    
    const formattedDate = today.toISOString().split('T')[0];
    
    this.datosmodel.fecha=formattedDate;
    this.selectedDate = this.datosmodel.fecha;
    this.getdata();
    this.presentingElement = document.querySelector('.ion-page');

    this.programaOptions = [
      { name: 'ORIGEN', code: 'O' },
      { name: 'USDA', code: 'U' },
      { name: 'MAPRO', code: 'M' },
      { name: 'FORESTAL', code: 'F' }
    ];
    
    this.actividadOptions = [
      { name: 'INSPECCION', code: 'I' },
    { name: 'MUESTREO', code: 'M' },
    { name: 'DESPACHO', code: 'D' },
    { name: 'TRATAMIENTO', code: 'T' },
    { name: 'OTRAS EN PLANTA', code: 'R' },
    { name: 'SITIO TRANSFERENCIA', code: 'ST' },
    { name: 'ACTIVIDADES OFICINA', code: 'OF' },
    { name: 'SUPERVISION', code: 'S' },
    { name: 'VERIFICACION EN PUNTOS DE SALIDA', code: 'V' },
    { name: 'COSTADO DE NAVE', code: 'CN' },
    { name: 'INSPECCION DE LOSA', code: 'IL' },
    { name: 'PREPARACION DE CARGA', code: 'PC' }
    ];


  }   
  private formatDateISO(d: Date | string): string {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  private readonly COL_ORDER = [
    'fecha','programa','actividad','sps','hora_inicio','hora_termino',
    'auto','total','rut','observacion'
  ] as const;
  
  
  private buildSagRows(): any[] {
    return (this.data ?? []).map(r => ({
      fecha: this.formatDateISO(r.fecha),
      programa: r.programa ?? '',
      actividad: r.actividad ?? '',
      sps: r.sps ?? '',
      hora_inicio: r.hora_inicio ?? '',
      hora_termino: r.hora_termino ?? '',
      auto: r.auto==1 ? 'SI' : 'NO'  ,
      total: this.calculateTimeDifference(r.hora_inicio, r.hora_termino),
      rut: r.rut ?? '',      
      observacion: r.observacion ?? ''
    }));
  }
  private excelTimeFromHHMM(hhmm: string): number | '' {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';
    return (h * 60 + m) / (24 * 60);
  }
  async descargarExcel(): Promise<void> {
    try {
      // 1) Cargar plantilla
      const arrayBuffer = await this.http
        .get('assets/Bd Seguimiento.xlsx', { responseType: 'arraybuffer' })
        .toPromise();
  
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(arrayBuffer as ArrayBuffer);
  
      // 2) Hoja y coordenadas
      const ws = wb.worksheets[0];
      const startRow = 17;  // FILA BASE (NO tocamos nada por encima)
      const startCol = 2;   // Columna B
  
      // 3) Datos ya mapeados por tu buildSagRows()
      const rows = this.buildSagRows(); // ← tu función
  
      if (!rows || rows.length === 0) {
        // Nada que escribir, solo descarga tal cual
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Bd Seguimiento.xlsx');
        return;
      }
  
      // 4) Insertar copias de la fila 18 *debajo de la 18*, sin tocar 1..17
      //    Hacemos N-1 duplicados *después* de la fila base.
      for (let k = 1; k < rows.length; k++) {
        ws.duplicateRow(startRow, 1, true); // inserta UNA copia inmediatamente debajo
      }
      // A partir de aquí existen filas [startRow .. startRow+rows.length-1] con
      // el estilo de la fila 18. Las filas 1..17 permanecen intactas.
  
      // 5) Escribir valores con tipos correctos (fecha = Date, hora = número Excel)
      rows.forEach((item, i) => {
        const rowNum = startRow + i;
        const row = ws.getRow(rowNum);
  
        this.COL_ORDER.forEach((key, j) => {
          const cell = row.getCell(startCol + j);
  
          switch (key) {
            case 'fecha': {
              cell.value = item[key] ? new Date(item[key]) : null;
              break;
            }
            case 'hora_inicio':
            case 'hora_termino': {
              cell.value = typeof item[key] === 'string'
                ? this.excelTimeFromHHMM(item[key])
                : item[key] ?? '';
              break;
            }
            case 'total': {
              // Si prefieres que Excel lo calcule con fórmula, usa:
              // cell.value = { formula: `G${rowNum}-F${rowNum}` };
              cell.value = typeof item[key] === 'string'
                ? this.excelTimeFromHHMM(item[key])
                : item[key] ?? '';
              break;
            }
            default: {
              cell.value = item[key] ?? '';
            }
          }
        });
  
        row.commit?.();
      });
  
      // 6) Descargar
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'Bd Seguimiento.xlsx');
  
      this.presentToast('Excel base completado con datos actuales.');
    } catch (e) {
      console.error('Error completando Excel base:', e);
      this.presentToast('No se pudo completar el Excel base.');
    }
  }

  async presentToast(mensaje:string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }
  getProgramaName(code: string): string {
    const programa = this.programaOptions.find(p => p.code === code);
    return programa ? programa.name : code;
  }

  getActividadName(code: string): string {
    const actividad = this.actividadOptions.find(a => a.code === code);
    return actividad ? actividad.name : code;
  }

  async getdata(){
    const loading =await this.loadingController.create(
      {
        message:'Cargando datos ...'
      }
    )
    loading.present();
    this.mainService.getdatabymonthyear(this.datosmodel!).subscribe(
      response=>{
        if(response.status=="success"){
          loading.dismiss();
          console.log(response);
          this.data=response.sag;
          
        }
      },error=>{
          loading.dismiss();
        console.log(error);
        }
    );
  }

  async save(){
    const loading =await this.loadingController.create(
      {
        message:'Guardando datos ...'
      }
    )
    loading.present();

     var auto=0;
     if(this.datosmodel.auto){
      auto=1;
     }

     this.datosmodel.auto=auto;
    this.mainService.save(this.datosmodel!).subscribe(
      response=>{
        if(response.status=="success"){
          loading.dismiss();
          this.presentToast("Datos guardados correctamente");
          console.log(response);
          this.getdata();
          
          
        }
      },error=>{
          loading.dismiss();
        console.log(error);
        }
    );
  }


 
  private hhmmNow(): string {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  
  calculateTimeDifference(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '-';
    
    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      let diffHours = endHours - startHours;
      let diffMinutes = endMinutes - startMinutes;
      
      if (diffMinutes < 0) {
        diffHours--;
        diffMinutes += 60;
      }
      
      // Handle negative time difference (overnight)
      if (diffHours < 0) {
        diffHours += 24;
      }
      
      return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
    } catch (e) {
      console.error('Error calculating time difference:', e);
      return '-';
    }
  }

  onDateChange(event: CustomEvent) {
    this.selectedDate = event.detail.value; // string en formato ISO (YYYY-MM-DD o ISO completo)
    console.log(this.selectedDate);
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
      this.datosmodel!.fecha=this.selectedDate!;
      dt?.confirm();   
              // Confirma el valor (emite ionChange/ionConfirm)
      modal.dismiss('ok');     // Cierra el modal
    }
    confirm2(modal: IonModal) {
      const dt = document.getElementById('datetime2') as HTMLIonDatetimeElement;
      
      this.datosmodel!.fecha=this.selectedDate!;
      dt?.confirm();   
              // Confirma el valor (emite ionChange/ionConfirm)
      modal.dismiss('ok');     // Cierra el modal
    }
    confirm3(modal: IonModal) {
      const dt = document.getElementById('datetime3') as HTMLIonDatetimeElement;
      
      this.datosmodel!.fecha=this.selectedDate!;
      dt?.confirm();   
              // Confirma el valor (emite ionChange/ionConfirm)
      modal.dismiss('ok');     // Cierra el modal
    }
    confirm4(modal: IonModal) {
      const dt = document.getElementById('datetime4') as HTMLIonDatetimeElement;
      
      this.datosmodel!.fecha=this.selectedDate!;
      dt?.confirm();   
              // Confirma el valor (emite ionChange/ionConfirm)
      modal.dismiss('ok');     // Cierra el modal
    }
    async guardar(modal:IonModal){
      
     await this.save();

      modal.dismiss('ok');     // Cierra el modal
    }

   async  eliminar(registro:number){

    const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Rendicion',
        message:'Desea eliminar el registro',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
            
            }
          }, {
            text: 'Eliminar',
            handler:async () => {
             const loading =await this.loadingController.create(
                {
                  message:'Eliminando datos ...'
                }
              )
              loading.present();
              this.mainService.deleteRecord(registro).subscribe(
                response=>{
                  if(response.status=="success"){
                    loading.dismiss();
                    console.log(response);
                    this.getdata();
                    this.presentToast("Datos eliminados correctamente");
                    
                  }
                },error=>{
                    loading.dismiss();
                  console.log(error);
                  }
              ); 
            }
          }
        ]
      });
      await alert.present();
  



      
    }
    

  
}

export interface Dataresponse {
  status:  string;
  code:    string;
  message: string;
  sag:     Sag[];
}

export interface Sag {
  rut:          string;
  fecha:        Date;
  sps:          string;
  hora_inicio:  string;
  hora_termino: string;
  programa:     string;
  actividad:    string;
  id:           number;
  auto:         number;
  observacion:  string;
}
interface Opciones {
  name: string;
  code: string;
}