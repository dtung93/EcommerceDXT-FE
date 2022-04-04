import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
const apiURL="http://localhost:8080/api"
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }
  getPublicContent(params:any): Observable<any> {
    return this.http.get(apiURL + '/products', { params });
  }
  getUserBoard(token:any): Observable<any> {
    return this.http.get(apiURL + '/user',  {responseType: 'text' });
  }
  getModeratorBoard(): Observable<any> {
    return this.http.get(apiURL + '/mod', { responseType: 'text' });
  }
  getAdminBoard(): Observable<any> {
    return this.http.get(apiURL + '/admin', { responseType: 'text' });
  }
  getUsers(params:any):Observable<any>{
    return this.http.get(apiURL+ '/admin/users',{ params })
  }
  getUser(id:number):Observable<User>{
    return this.http.get<User>(apiURL+`/user/${id}`)
  }
  updateUser(data:any):Observable<User>{
    return this.http.put<User>(apiURL+'/user/update',data)
  }
  deleteUser(id:number):Observable<void>{
    return this.http.delete<void>(`${apiURL}/admin/delete/${id}`)
  }
  updateRole(data:any):Observable<User>{
 return this.http.put<User>('http://localhost:8080/api/role/update',data)
  }
}