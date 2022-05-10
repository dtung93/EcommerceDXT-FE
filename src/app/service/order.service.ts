import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
apiURL="http://localhost:8080/api/order/"
  constructor(private http:HttpClient) { }
getAllOrders():Observable<any>{
  return this.http.get(this.apiURL+'all-orders')
}
getOrderDetails(id:number):Observable<any>{
  return this.http.get(this.apiURL+`details/${id}`)
}
getOrder():Observable<any>{
  return this.http.get(this.apiURL+'my-order')
}
newOrder(data:any):Observable<any>{
return this.http.post(this.apiURL+'new-order',data)
}

}
