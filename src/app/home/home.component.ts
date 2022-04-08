import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { Product } from '../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../service/product.service';
import { TokenStorageService } from '../service/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  paginationStyle = "color:red,background-color:green"
  isAdminOrMod = false
  sortValue: any
  hasCategory = false
  HasProducts: boolean = false
  content?: string
  products: Product[] = []
  selectedProduct?: Product
  isLoggedIn = false
  showButton = false
  display = 'none'
  modal = 'margin-left:25px'
  fontsize = '5px'
  page = 1
  count = 0
  pageSize = 8
  name = ''
  category = ''
  keyword: boolean = false
  roles?: any[] = []
  currentUser: any
  sortOptions = [
    { id: 1, name: 'Sort by ascending price', value: 'ascending' },
    { id: 2, name: 'Sort by descending price', value: 'descending' }
  ]
  sortedOptions(value: string) {
    this.sortValue = this.sortOptions.find(x => x.value == value)?.value
    this.sortProducts()
  }
  constructor(private userService: UserService, private token: TokenStorageService, private toastr: ToastrService, private productService: ProductService) { }
  showToast(productname: string) {
    this.toastr.error(productname, 'Notice')
  }
  openModal(product: Product) {
    this.display = 'block'
    this.selectedProduct = product
  }
  onCloseHandled() {
    this.display = 'none'
  }
  ngOnInit(): void {
    //API call to get array of products
    this.getProducts()
    if (this.token.getToken()) {
      this.roles = this.token.getUser().roles;
      if (this.roles?.includes("ROLE_ADMIN") || this.roles?.includes("ROLE_MODERATOR")) {
        this.isAdminOrMod = true
      }
    }
  }

  getRequestParams(category: string, searchTitle: string, page: number, pageSize: number): any {
    let params: any = {}
    if (searchTitle) {
      params[`name`] = searchTitle
    }
    if (category) {
      params[`category`] = category
      this.hasCategory = true
    }
    if (page) {
      params[`page`] = page - 1
    }
    if (pageSize) {
      params[`size`] = pageSize
    }
    return params
  }
  //http service to get and display the array of products, paging information from API with parameters category and name, page and page sizee
  getProducts(): void {
    const params = this.getRequestParams(this.category, this.name, this.page, this.pageSize)
    console.log(params)
    this.userService.getPublicContent(params).subscribe(response => {
      const { products, totalItems } = response
      this.products = products
      this.count = totalItems
      this.HasProducts = true
      console.log(response)
    }, error => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Products could not be loaded. Please check your connection to the server ',
      footer: '<a href="">Why is this issue?</a>',
      showConfirmButton: true,
      confirmButtonColor: '#2d8bca',
      color: 'red',
      timer: 7000
    }))
  }
  //http service to get and display the array of products with no parameters
  backToResults(): void {
    const params = this.getRequestParams(this.name = '', this.category = '', this.page, this.pageSize)
    this.userService.getPublicContent(params).subscribe(response => {
      const { products, totalItems } = response
      this.products = products //array of products
      this.count = totalItems
      console.log(response)
      this.keyword = !this.keyword
    }, error => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Cannot get any products. Please check your connection ' + error.message,
      footer: '<a href="">Why is this issue?</a>',
      showConfirmButton: true,
      confirmButtonColor: '#2d8bca',
      color: 'red',
      timer: 7000
    }))
  }
  getSortParams(page: number, pageSize: number, value: string) {
    let params: any = {}
    if (value) {
      params[`value`] = value
    }
    if (page) {
      params[`page`] = page - 1
    }
    if (pageSize) {
      params[`size`] = pageSize
    }
    return params
  }
  sortProducts() {
    const params = this.getSortParams(this.page, this.pageSize, this.sortValue);
    console.log(params)
    return this.productService.sortProduct(params).subscribe(response => {
      const { products, totalItems } = response
      this.products = products
      this.count = totalItems
      console.log(response)
    }, error => console.log(error))
  }
  handlePageChange(event: number): void {
    this.page = event
    if (this.sortValue == null)
      this.getProducts();
    else {
      this.sortProducts()
    }
  }
  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value
    this.page = 1
    this.getProducts()
  }
  searchTitle(): void {
    this.page = 1;
    this.keyword = true
    this.getProducts()
  }
  delete(id: any): void {
    this.productService.deleteProduct(id).subscribe((res) => {
      console.log(id)
      const selectedProduct = this.products.find(x => x.id === id);
      this.products = this.products.filter(x => x.id != id)
      console.log(selectedProduct)
      this.display = 'none'
      this.showToast(selectedProduct?.name + ' is deleted')
    }, error => {
      this.display = 'none'
    })
  }
}
