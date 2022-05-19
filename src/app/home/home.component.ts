import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { Product } from '../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../service/product.service';
import { TokenStorageService } from '../service/token-storage.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../service/cart.service';
import { roleName } from '../model/role.model';
import { Paging } from '../model/page.model';
import { ConsoleLogger } from '@angular/compiler-cli';
import { parseMappings } from '@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private spinner:NgxSpinnerService,private cartService: CartService, private fb: FormBuilder, private userService: UserService, private token: TokenStorageService, private toastr: ToastrService, private productService: ProductService) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(25)]],
      img: [''],
      category: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      qty: ['']
    })
  }
  ngOnInit(): void {
    //API call to get array of products
 
    if (this.token.getToken()) {
      this.roles = this.token.getUser().roles;
      if (this.roles?.includes(roleName.a)&&(this.token.getUser().enabled) || this.roles?.includes(roleName.mo)&&(this.token.getUser().enabled) || this.roles?.includes(roleName.ma)&&(this.token.getUser().enabled)) {
        this.notUser = true
      }
      if(!this.token.getUser().enabled){
      console.log(this.token.getUser().enabled)
      this.userNotActivated=true
      this.toastr.error('Your account is not activated yet')
      }
    }
    this.getProducts()

  }

  productName=''
  productForm: FormGroup
  products: Product[] = []
  selectedProduct?: Product
  currentUser: any
  isSubmitted = false;
  width = "width:100%"
  notUser = false
  paginationStyle = "color:red,background-color:green"
  isAdminOrMod = false
  sortValue: any
  hasCategory = false
  HasProducts: boolean = false
  content?: string

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
  outOfStock=false
  userNotActivated=false
  sortOptions = [
    { id: 1, name: 'Sort by ascending price', value: 'ascending' },
    { id: 2, name: 'Sort by descending price', value: 'descending' }
  ]
  categories: any = [
    { name: 'Shoes' }, { name: 'Cars' }, { name: 'Health' },
    { name: 'Computers' }, { name: 'Garden' }, { name: 'Beauty' },
    { name: 'Home' }, { name: 'Clothing' }, { name: 'Sports' }, { name: 'Grocery' }, { name: "Kids" }, { name: "Automotive" }, { name: "Toys" },
    { name: 'Movies' }, { name: 'Grocery' }
  ]
  sortedOptions(value: string) {
    this.sortValue = this.sortOptions.find(x => x.value == value)?.value
    this.sortProducts()
  }

  showDeleteToast(productname: string) {
    this.toastr.info(productname)
  }
  openModal(product: Product) {
    this.display = 'block'
    this.selectedProduct = product
  }
  onCloseHandled() {
    this.display = 'none'
  }

  showToast(id: number, name: string) {
    this.toastr.info(
      "Product id=" + id + " " + name + " is succesfully added to the inventory"
    )
  }
  submitSuccess(id: number, name: string,) {
    this.isSubmitted = false
    this.productForm.reset()
    this.showToast(id, name)
    setInterval(() => { location.reload() }, 1000)
  }
  submitProductForm() {
    this.isSubmitted = true
    if (this.productForm.valid) {
      const data = this.productForm.value
      return this.productService.addProduct(data).subscribe((res) => {
        this.submitSuccess(res.id, res.name)
      }, error => console.log(error.message))
    }
    else {
      return this.toastr.error('Failed to add product', 'Please check the fields again')
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
  getSearchParams(category:string,productName:string){
    let params:any={}
    if (productName) {
      params[`name`] = productName
    }
    if (category) {
      params[`category`] = category
      this.hasCategory = true
    }
    return params
  }
  getPage() {
    const page = sessionStorage.getItem(Paging.PAGE_HOME)
    this.page = page ? +page : 1
    return this.page
  }
  //http service to get and display the array of products, paging information from API with parameters category and name, page and page sizee
  getProducts(): void {

    const params = this.getRequestParams(this.category, this.name, this.getPage(), this.pageSize)
    this.productService.getProducts(params).subscribe(response => {
      this.spinner.hide()
      const { products, totalItems } = response
      this.products = products
      this.count = totalItems
      this.HasProducts = true
      console.log(response.products)
    }, error => { this.toastr.error('No products could be found') })
  }
  searchProducts(){
    this.page=this.page
    const params = this.getSearchParams(this.category,this.productName)
    console.log(params)
    this.productService.getProducts(params).subscribe(response => {
      const { products, totalItems } = response
      this.products = products
      this.count = totalItems
      this.HasProducts = true
      console.log(response)
    }, error => { this.toastr.error('No products could be found') })
  }

  //http service to get and display the array of products with no parameters
  backToResults(): void {
    this.name==null
    const params = this.getRequestParams(this.name = '', this.category = '', this.page, this.pageSize)
    this.productService.getProducts(params).subscribe(response => {
      const { products, totalItems } = response
      this.products = products //array of products
      this.count = totalItems
      console.log(response)
      this.keyword = !this.keyword
    }, error => {
      this.toastr.error('No products could be found!')
    })
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
    sessionStorage.setItem(Paging.PAGE_HOME, JSON.stringify(event))
    if (this.sortValue == null)
      this.getProducts();
    else {
      this.sortProducts()
    }
  }
  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value
    this.page = this.page
    this.getProducts()
  }
  delete(id: any): void {
    this.productService.deleteProduct(id).subscribe((res) => {
      console.log(id)
      const selectedProduct = this.products.find(x => x.id === id);
      this.products = this.products.filter(x => x.id != id)
      console.log(selectedProduct)
      this.display = 'none'
      this.showDeleteToast(selectedProduct?.name + ' is deleted')
    }, error => {
      this.toastr.error('You dont have the right or permission to do this action')
      this.display = 'none'
    })
  }
  addProductToCart(id: number) {
    if (this.roles?.includes(roleName.u)) {
      const productId = { id: id }
      this.cartService.addToCart(productId).subscribe((res) => {
        console.log(res)
        this.toastr.info('Product successfully added to cart')
        this.cartService.updateCartTotal(res.totalItems)
      }, error => { console.log(error.error.message) }
     )
    }
    else {
    this.toastr.error('You need to sign in to use this function')
    }
  }

}
