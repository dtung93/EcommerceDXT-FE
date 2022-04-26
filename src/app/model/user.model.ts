import { isConstructorDeclaration } from "typescript";

export class User{
  id!: number;
 username!: string 
 password!:string
 email!:string
 address!:string
 avatar!:string
 phone!:number
 roles:any[]=[]
 enabled!:boolean
//  constructor(id:number,username:string,password:string,email:string,address:string,avatar:string,roles:[]) {
//   this.id=id
//   this.username=username
//   this.password=password
//   this.address=address
//   this.email=email
//   this.avatar=avatar
//   this.roles=roles
// }
}

