const fs = require('fs')
const glob = require("glob")
const path = require('path')

const frontendPath = '../../HM/hm-frontend'
// const frontendPath = '../hm-frontend'

let fileList = []

process.on('exit', async () => {
  console.log({fileCounter, toWriteCounter , doneCounter, replaced: matched})
  // fs.writeFileSync('en.json', JSON.stringify(json), (err) => {
  //   if (err) return console.log(filePath, err)
  //   console.log(' Write Done: en.json')
  // })
  fs.writeFileSync('keyNotFound.txt', keyNotFound, (err) => {
    if (err) return console.log(filePath, err)
    console.log(' Write Done: eport.txt')
  })
  fs.writeFileSync('keyFounded.txt', keyFounded, (err) => {
    if (err) return console.log(filePath, err)
    console.log(' Write Done: eport.txt')
  })
})

getDirectories(frontendPath, function (err, res) {
  if (err) {
    console.log('Error', err)
  } else {
    fileList = res.filter(item => {
      return fs.lstatSync(item).isFile() && ['.vue', '.js'].includes(path.extname(item)) && !item.includes('node_modules')
    })
    readFiles(fileList, replacei18n)
  }
})

async function getDirectories (src, callback) {
  glob(src + '/**/*', callback)
}
function readFiles (filePaths, onFileContent) {
  filePaths.forEach((filePath) => {
    fs.readFile(filePath, 'utf-8', function(err, content) {
      if (err) {
        console.log(err)
        return
      }
      onFileContent(filePath, content)
    })
  })
}
let fileCounter = 0
let doneCounter = 0
let toWriteCounter = 0
let matched = 0
let keyNotFound
let keyFounded
function replacei18n (filePath, content) {
  if (!content.includes("$t(")) {
    return
  }
  fileCounter++
  if (path.basename(filePath) /*=== 'EditShippingAddress.vue'*/) {
    keyNotFound += filePath + '\n'
    keyFounded += filePath + '\n'
    const originalContent = content.toString()
    let i18nContent = content.split('\n').filter((line) => line.includes("$t("))
    const jsonInArray = nestedObjectToArray(json)
    if (i18nContent.length === 0) {
      return
    }
    i18nContent.forEach(line => {
      line = line.trim()
      if (line.split('$t(').length > 2) {
        const tmpLines = []
        tmpLines.push(line.substring(line.indexOf('$t('), line.lastIndexOf('$t(') - 2))
        tmpLines.push(line.substring(line.lastIndexOf('$t('), line.length))
        doReplace(tmpLines[0])
        doReplace(tmpLines[1])
      } else {
        doReplace(line)
      }
      function doReplace(line) {
        if (!line.includes("'") && !line.includes("\"") ) {
          return
        }
        const tmp = line.substring(
          line.indexOf("$t"), 
          line.length
        )
        line = tmp.substring(0, tmp.indexOf(")") + 1)
        const value = line.substring(4, line.length - 2)
        if (!value || value.includes('(') || value.includes('[') || value.includes('{') || value.includes('_')) {
          return
        }
        if (json[value]) {
          console.log(value, json[value])
          return
        }
        matched++
       
        const jsonLine = jsonInArray.filter(item => item.substring(item.lastIndexOf('@') + 1, item.length) === value)
        if (jsonLine.length) {
          let key = jsonLine[0].substring(0, jsonLine[0].lastIndexOf('@'))
          key = key.replace(/@/g, '.')
          const newLine = line.replace(value, key)
          content = content.replace(line, newLine)
          keyFounded += `\t ${line} \n`
        } else if (jsonLine.length === 0) {
          // report 
          keyNotFound += `\t ${line} \n`

          // const newKey = value.trim().toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, '_')
          // json[newKey] = value
          // const newLine = line.replace(value, newKey)
          // content = content.replace(line, newLine)
        } else {
          console.log('Smt wroong to json line =============================', filePath)
        }
      }
    })
    if (originalContent !== content) {
      toWriteCounter++
      // write file
      fs.writeFile(filePath, content, (err) => {
        if (err) return console.log(filePath, err)
        doneCounter++
      })
    }
  }
}

function nestedObjectToArray(obj) {
  if (typeof(obj) !== "object"){
      return [obj]
  }
  var result = []
  if (obj.constructor === Array){
      obj.map(function(item) {
          result = result.concat(nestedObjectToArray(item))
      })
  } else {
      Object.keys(obj).map(function(key) {
          if(obj[key]) {
              var chunk = nestedObjectToArray(obj[key])
              chunk.map(function(item) {
                  result.push(key+"@"+item)
              })
          } else {
              result.push(key)
          }
      })
  }
  return result
}

const json = {
  "$": "$",
  "login": "Login",
  "dashboard": {
    "my_account": {
      "_": "Account Information",
      "contact": "Contact Infomation",
      "address": "Address Infomation",
      "address_book": "Address Book",
      "address_default": "Default Addresses",
      "address_billing": "Default billing address",
      "address_shipping": "Default shipping address"
    }
  },
  "account": {
    "_": "Account",
    "my_account": "My Account",
    "address_book": "Address Book",
    "my_orders": "My Orders",
    "logout": "Logout",
    "register": "Register",
    "sign_up": {
      "_": "Create an account",
      "text_1": "Fast and easy check out",
      "text_2": "Easy access to your order history and status",
      "title": "Create New Customer Account",
      "sub_title_personal": "PERSONAL INFORMATION",
      "sub_title_info": "SIGN-IN INFORMATION",
      "btn_name": "CREATE AN ACCOUNT",
      "catcha": "Please type the letters and numbers below"
    },
    "sign_in": {
      "_": "SIGN IN",
      "description": "If you have an account, sign in with your email address.",
      "new_customer": "New Customers",
      "create_description": "Creating an account has many benefits: check out faster, keep more than one address, track orders and more.",
      "create_an_account": "CREATE AN ACCOUNT",
      "forgot_password": "Forgot password ?"
    },
    "forgot_pass": {
      "title": "Forgot Your Password",
      "description": "Please enter your email address below to receive a password reset link.",
      "email": "Email",
      "capcha": "Please type the letters and numbers below",
      "btn_name": "Reset My Password"
    },
    "form": {
      "name": "Name",
      "email": "Email",
      "text_below_email": "You can create an account after checkout",
      "enter_email": "Enter your email",
      "password": "Password",
      "enter_password": "Enter your password",
      "first_name": "First name",
      "last_name": "Last name",
      "full_name": "Full name",
      "re_password": "Password confirm",
      "company": "Company",
      "telephone": "Telephone",
      "fax": "Fax",
      "general_subscription": "General Subscription",
      "save_information": "Save Information",
      "save_address": "Save Address",
      "save_password": "Save Password",
      "current_password": "Current Password",
      "new_password": "New Password",
      "confirm_new_password": "Confirm New Password",
      "change_password": "Change Password",
      "address": {
        "_": "Address",
        "street_address": "Street Address",
        "street_address2": "Street Address 2",
        "city": "City",
        "state/province": "State/Province",
        "zip/postal_code": "Zip/Postal Code",
        "country": "Country",
        "state_select_placeholder": "Please select a region, state or province",
        "state_input_placeholder": "Please enter a region, state or province"
      },
      "dob": "Date of Birth",
      "gender": "Gender"
    }
  },
  "cart": {
    "current_product": "{0} product in your cart",
    "current_products": "{0} products in your cart",
    "subtotal": "Cart Subtotal",
    "edit": "View and edit cart"
  },
  "protect_your_phone": "Protect Your Phone",
  "protect_your_tablet": "Protect Your Tablet",
  "go_to_checkout": "Go to checkout",
  "read_more": "Read More",
  "learn_more": "Learn More",
  "add_to_cart": "Add to cart",
  "product": {
    "_": "Product",
    "availability": "Availability",
    "in_stock": "In Stock",
    "out_of_stock": "Out of Stock",
    "unavailable": "Unavailable",
    "sold_out": "Sold out",
    "sku": "SKU",
    "details": "Details",
    "reviews_section": "Reviews section",
    "installation": "Installation",
    "qty": "Qty",
    "item": "Item",
    "price": "Price",
    "row_total": "Row total"
  },
  "shopping_cart": "Shopping Cart",
  "summary": "Order Summary",
  "estimate_shipping_and_tax": "Estimate shipping and tax",
  "country": "Country",
  "state/province": "State/Province",
  "subtotal": "Subtotal",
  "tax": "Tax",
  "checkout_with_multiple_addresses": "Check Out with Multiple Addresses",
  "apply_discount_code": "Apply discount code",
  "enter_discount_code": "Enter discount code",
  "apply_discount": "Apply discount",
  "update_cart": "Update Cart",
  "now_shopping_by": "Now Shopping By",
  "sort_by": "Sort By",
  "show": "Show",
  "set_ascending_direction": "Set Ascending direction",
  "set_descending_direction": "Set descending direction",
  "clear_all": "Clear All",
  "max": "Max",
  "min": "Min",
  "shopping_options": "Shopping options",
  "previous_product": "Previous Product",
  "next_product": "Next Product",
  "added_text": "You added {0} to your",
  "page_not_found": "Page not found",
  "an_error_occurred": "An error occurred",
  "shipping": "Shipping",
  "review_and_payment": "Review & Payment",
  "shipping_address": "Shipping Address",
  "contact_information": "Contact Information",
  "payment_methods": "Payment methods",
  "checkout": "Checkout",
  "cart_empty_text": "You have no items in your shopping cart",
  "total": "Total",
  "not_yet_calculated": "Not yet calculated",
  "address_empty_text": "You dont have any address, please create new below",
  "create_new_address": "Create new address",
  "create": "Create",
  "cancel": "Cancel",
  "save": "Save",
  "edit": "Edit",
  "update_new_address": "Update new address",
  "save_card": "Save card",
  "new_card": "New card",
  "exist_cards": "Select existing cards",
  "select_or_create_address": "Select or create new address",
  "select_payment_profile": "Select a payment profile",
  "newsletter": {
    "title": "BE THE FIRST TO KNOW",
    "description1": "Get all the latest information on New Device Protection, Sales and Offers.",
    "description2": "Sign up for our newsletter today."
  },
  "subscribe": "Subscribe",
  "see_all_results": "See all results",
  "from": "From",
  "continue_shopping": "Continue shopping",
  "checkout_success": "Checkout success",
  "order": {
    "_": "Order",
    "order_detail": "Order Detail",
    "order_number": "Order Number",
    "order_date": "Order Date",
    "order_status": "Order Status",
    "total_tax_price": "Total tax price",
    "discount_amount": "Discount amount",
    "subtotal_price": "Subtotal price",
    "total_price": "Total price",
    "total_refunded": "Total refunded",
    "total_paid": "Total paid",
    "subtotal": "Subtotal",
    "discount": "Discount",
    "row_total": "Row total",
    "payment_information": "Payment Information",
    "payment_method": "Payment Method",
    "order_not_found": "Order not found",
    "shipping_address": "Shipping address",
    "billing_address": "Billing address",
    "address_information": "Address Information",
    "order_total": "Order total",
    "payment_&_shipping_method": "Payment & Shipping Method",
    "shipping_information": "Shipping Information",
    "billing_information": "Billing information",
    "items_ordered": "Items Ordered",
    "order_information": "Order Information",
    "created_at": "Created At",
    "bill_to": "Bill to",
    "ship_to": "Ship to",
    "status": "Status",
    "shipping_method": "Shipping method",
    "method": "Method",
    "card_type": "Card Type",
    "last_4": "Last 4",
    "not_have_payment_methods": "Not have payment methods",
    "order_items": "Order items",
    "summary": "Summary",
    "shipping": "Shipping",
    "shipping_fee": "Shipping fee",
    "tax": "Tax",
    "grand_total": "Grand Total"
  },
  "shipping_fee_label": "Handling",
  "back": "Back",
  "email": "Email",
  "tracking": "Tracking",
  "details": "Details",
  "item_shipped": "Item shipped",
  "parcel": "Parcel",
  "quantity_added": "Quantity Added",
  "added_to_basket": "Added to Basket",
  "delete": "Delete",
  "set_as_default_shipping": "Set as default shipping",
  "set_as_default_billing": "Set as default billing",
  "discount": "Discount",
  "form": "From",
  "to": "To",
  "suggested": "Suggested",
  "New_Arrivals": "New Arrivals",
  "Bestsellers": "Bestsellers",
  "Price_Low_to_High": "Price Low to High",
  "Price_High_to_Low": "Price High to Low",
  "Brand_A-Z": "Brand A-Z",
  "Brand_Z-A": "Brand Z-A",
  "product_replacements": {
    "_": "Product Replacements",
    "order_lookup": "Order Lookup",
    "required_info": "Required Information",
    "order_info": "Order Information",
    "replacement_detail": "Replacement Detail",
    "email_address": "Email Address",
    "order_number": "Order Number",
    "product_to_replace": "Product to Replace",
    "comment": "Message",
    "reason": "Reason for Replacement",
    "use_order_address": "Use Address from Order",
    "unrecognized_order_number": "Unrecognized Order Number",
    "fourth-and-more-replacement-attempts": "Fourth (and More) Replacement Attempts",
    "product-block": "Products Blocked"
  }
}