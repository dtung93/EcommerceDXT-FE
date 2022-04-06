import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs';
const apiURL="http://localhost:8080/api/auth/"
const httpOptions ={
  headers: new HttpHeaders({'Content-Type':'application/json'})
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http:HttpClient) { }
  errorMsg?: string
  refreshToken(token:string){
    return this.http.post(apiURL+ 'refreshtoken',{
      refreshToken:token
    },httpOptions)
  }
  login(username: string, password: string): Observable<any> {
   return this.http.post(apiURL + 'signin', {
      username,
      password
    }, httpOptions,)

  }
 addUser(username:string,password:string,email:string,roles:[]):Observable<any>{
   const data={username,password,email,roles}
 return this.http.put('http://localhost:8080/api/user/update',data)

 }
  register(username:string, password:string,email:string,address:string,avatar:string,phone:string): Observable<any> {
    return this.http.post(apiURL + 'signup',
    {username,password,email,phone,avatar,address}, httpOptions);
  }
}
