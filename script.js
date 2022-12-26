$('#top-message').carousel({
    interval: 2000
});

const dropdown = $(".dropdown");
const dropdownToggle = $(".dropdown-toggle");
const dropdownMenu = $(".dropdown-menu");
const showClass = "show";
$(window).on("load resize", function() {
  if (this.matchMedia("(min-width: 768px)").matches) {
    dropdown.hover(
      function() {
        const $this = $(this);
        $this.addClass(showClass);
        $this.find(dropdownToggle).attr("aria-expanded", "true");
        $this.find(dropdownMenu).addClass(showClass);
      },
      function() {
        const $this = $(this);
        $this.removeClass(showClass);
        $this.find(dropdownToggle).attr("aria-expanded", "false");
        $this.find(dropdownMenu).removeClass(showClass);
      }
    );
  } else {
    dropdown.off("mouseenter mouseleave");
  }
});

let products = [];
fetch('/katalog.json').then(response => response.json()).then(data => {
  data.forEach(datum => {
      products.push(datum.products);
  });
  products = products
      .flat()
      .filter(product => product.inStock);
});

initBrands();


function initBrands() {
    fetch('/katalog.json').then(response => response.json()).then(data => {
        let _products = []
        let productNames = [];

        data.forEach(datum => {
            _products.push(datum.products);
        });
        _products = _products.flat();

        productNames = _products.map(product => product.brand);
        productNames = productNames.filter(function(item, pos) {
          return productNames.indexOf(item) == pos;
        })
        
        fillNames(productNames);
        filterProducts(productNames[0])
        
    });
}

function productFilter(brand = null) {
    fetch('/katalog.json').then(response => response.json()).then(data => {
        let _products = []
        data.forEach(datum => {
            _products.push(datum.products);
        });
        _products = _products.flat();
        if (brand) {
            _products = _products.filter(product => product.brand === brand);
        }
        fillProducts(_products);
    });

}

function fillNames(productNames) {
  const productNameHtml = productNames.map(productName => `
      <li class="product-names">
        <button type="button" class="btn btn-default" data-target="#product${productName}" onclick="filterProducts('${productName}')">${productName}</button>
      </li>
      `).join('');
   document.getElementById('product-names').innerHTML = productNameHtml;
}

function fillProducts(products) {
    let html = '';
    products.forEach(product => {
        const oldPrice = product.oldPrice ? `${product.oldPrice} TL` : '';
        const hasDiscount = product.oldPrice ? 'discount' : '';
        html += `
            <div class="col col-xs-12 col-sm-12 col-md-4">
                <div class="card">
                    <img src="${product.image}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title
                        ">${product.brand}</h5>
                        <p class="card-text">${product.name}</p>
                        <span class="new-price ${hasDiscount}">${product.price} TL</span>
                        <span class="old-price">${oldPrice}</span>
                        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#productModal" onclick="addCart('${product.productId}')">Sepete Ekle</button>
                    </div>
                </div>
            </div>
            `;
    });
    document.getElementById('products').innerHTML = html;
}

function filterProducts(brand) {
    let products = []
    fetch('/katalog.json').then(response => response.json()).then(data => {
        data.forEach(datum => {
            products.push(datum.products);
        });
        products = products
            .flat()
            .filter(product => product.inStock)
            .filter(product => product.brand === brand);
        fillProducts(products);
    });
}

function addCart(productId) {
  let cartTotal = localStorage.getItem('cartTotal') ?  parseFloat(localStorage.getItem('cartTotal')) : 0;
  let product = products.find(product => product.productId === productId);
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let cartProduct = cart.find(product => product.productId === productId);
  if (product.stockCount <= 0) {
    alert('Stokta bu üründen kalmamıştır.'); // TODO popup olacak
  }

  if (cartProduct) {
      cartProduct.quantity += 1;
  } else {
      cart.push({...product, quantity: 1 });
  }
  product.stockCount -= 1;

  cartTotal += product.price;
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('cartTotal', cartTotal);
  updateCart();
  showInfo();
}


function updateCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let html = '';
  cart.forEach(product => {
      html += `
          <div class="row">
              <div class="col-3">
                  <img src="${product.image}" alt="" class="img-fluid">
              </div>
              <div class="col-9">
                  <h5>${product.brand} ${product.name}</h5>
                  <p>${product.price} TL</p>
                  <p>Adet: ${product.quantity}</p>
              </div>
          </div>
          <hr class="my-4">
          `;
  });
  document.getElementById('cart').innerHTML = html;

  const cartTotal = localStorage.getItem('cartTotal') ? parseFloat(localStorage.getItem('cartTotal')) : 0;
  document.getElementById('cartTotal').innerText = `${cartTotal} TL`;
}

function clearCart() {
  localStorage.removeItem('cart');
  localStorage.removeItem('cartTotal');
  updateCart();
}

function showInfo() {
    $('#infoDialog').removeClass('hide').addClass('show');
    setTimeout(() => { $('#infoDialog').removeClass('show').addClass('hide'); }, 5000);

}