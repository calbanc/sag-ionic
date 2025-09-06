import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { global } from '../global'
import { Observable } from 'rxjs';
import { dataModel } from '../home/dataModel';
@Injectable({
  providedIn: 'root'
})
export class MainService {
  public url:string="";
  constructor(
    public http:HttpClient
  ) { 

    this.url=global.url;
  }


  save(data:dataModel):Observable<any>{

    let json=JSON.stringify(data);
    let params="json="+json;
    let headers=new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
    return this.http.post(this.url+'sag/save',params,{headers:headers});
    
  }
  getdatabymonthyear(data:dataModel):Observable<any>{
    let json=JSON.stringify(data);
    let params="json="+json;
    let headers=new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
    return this.http.post(this.url+'sag/getdatabymonthyear',params,{headers:headers});
  }
  
  deleteRecord(id: number): Observable<any> {
    const params = `id=${id}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(this.url + 'sag/delete', params, { headers: headers });
  }
}
