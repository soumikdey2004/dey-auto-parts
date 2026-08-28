const body=document.body,toast=document.querySelector('.toast');let timer;
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2400)}
body.dataset.theme=localStorage.getItem('dey-theme')||'default';
document.querySelector('#theme-toggle').addEventListener('click',()=>{const themes=['default','dark','light'];const theme=themes[(themes.indexOf(body.dataset.theme)+1)%themes.length];body.dataset.theme=theme;localStorage.setItem('dey-theme',theme);notify(`${theme[0].toUpperCase()+theme.slice(1)} theme enabled`)});
const languageStage=document.querySelector('#language-stage'),loginStage=document.querySelector('#login-stage'),languageNote=document.querySelector('#language-note');
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{languageStage.classList.remove('active');loginStage.classList.add('active');languageNote.textContent=`Continue in ${button.dataset.language}.`}));
document.querySelector('#back-language').addEventListener('click',()=>{loginStage.classList.remove('active');languageStage.classList.add('active')});
document.querySelector('#login-stage').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.querySelector('#user-name').value.trim();
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;
    try {
        const response = await fetch('http://localhost:3000/api/auth', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('dey-customer', JSON.stringify({ name, email }));
            body.classList.remove('onboarding-active');
            document.querySelector('#sign-in span').innerHTML = `Hello, ${name.split(' ')[0] || 'rider'}<br><b>MY ACCOUNT</b>`;
            window.scrollTo(0, 0); notify(`Welcome to Dey Auto Parts, ${name}`);
        } else { notify(data.message); }
    } catch (error) { console.error("Error:", error); notify("Server connection failed! Node.js চালু আছে কি?"); }
});
document.querySelector('#search-form').addEventListener('submit',event=>{event.preventDefault();const query=event.currentTarget.querySelector('input').value.trim();if(query)notify(`Searching for “${query}”`)});
document.querySelector('#sign-in').addEventListener('click',()=>notify('You are signed in to your rider account.'));
document.querySelector('.whatsapp').addEventListener('click',()=>window.open('https://wa.me/918373008821?text=Hello%20Dey%20Auto%20Parts%2C%20I%20need%20help%20with%20my%20order.', '_blank', 'noopener'));
const menu=document.querySelector('.mobile-menu'),nav=document.querySelector('.main-nav');menu.addEventListener('click',()=>nav.classList.toggle('open'));
const bikeModels={
    Hero:[['Splendor Plus','https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'],['HF Deluxe','https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80'],['Xtreme 125R','https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80'],['Karizma XMR','https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80']],
    Honda:[['Shine 125','https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80'],['SP 125','https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80'],['Unicorn','https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'],['CB350','https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80']],
    Apache:[['RTR 160','https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'],['RTR 200 4V','https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80'],['RR 310','https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80'],['RTR 310','https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80']],
    'Royal Enfield':[['Classic 350','https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'],['Bullet 350','https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80'],['Hunter 350','https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80'],['Meteor 350','https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80']],
    KTM:[['Duke 200','https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80'],['Duke 390','https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80'],['RC 200','https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80'],['Adventure 390','https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80']],
    Pulsar:[['Pulsar 125','https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80'],['Pulsar N160','https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80'],['Pulsar NS200','https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80'],['Pulsar RS200','https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80']],
    Suzuki:[['Access 125','https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80'],['Gixxer 155','https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80'],['V-Strom SX','https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80'],['Burgman Street','https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80']],
    Yamaha:[['MT-15','https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80'],['R15','https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80'],['FZ-S','https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80'],['RayZR 125','https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80']]
};
const modelBrowser=document.querySelector('#model-browser'),modelGrid=document.querySelector('#model-grid');
function showModels(brand){
    const models=bikeModels[brand]; if(!models)return;
    document.querySelector('#selected-brand-label').textContent=`${brand.toUpperCase()} MOTORCYCLES`;
    document.querySelector('#selected-brand-name').textContent=brand;
    modelGrid.innerHTML=models.map(([model,image])=>`<button class="model-card" data-model="${model}" data-brand="${brand}"><img src="${image}" alt="${brand} ${model} motorcycle"><span>${brand}</span><strong>${model}</strong><small>View compatible parts →</small></button>`).join('');
    modelBrowser.hidden=false;
    document.querySelectorAll('.brand-grid button').forEach(button=>button.classList.toggle('active',button.dataset.brand===brand));
    modelBrowser.scrollIntoView({behavior:'smooth',block:'nearest'});
}
document.querySelectorAll('.brand-grid button').forEach(button=>button.addEventListener('click',()=>showModels(button.dataset.brand)));
document.querySelectorAll('[data-brand-link]').forEach(link=>link.addEventListener('click',()=>showModels(link.dataset.brandLink)));
document.querySelector('.close-models').addEventListener('click',()=>{modelBrowser.hidden=true;document.querySelectorAll('.brand-grid button').forEach(button=>button.classList.remove('active'))});
modelGrid.addEventListener('click',event=>{const card=event.target.closest('.model-card');if(card)notify(`${card.dataset.brand} ${card.dataset.model} এর পার্টস দেখানো হচ্ছে।`)});
document.querySelectorAll('.category-grid article').forEach(item=>item.addEventListener('click',()=>notify(`Showing ${item.innerText.replace(/\n/g,' ')}.`)));
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        const productList = document.getElementById('product-list');
        if (data.success && data.data.length > 0) {
            productList.innerHTML = '';
            data.data.forEach(product => {
                const productCard = document.createElement('div'); productCard.className = 'product-card';
                productCard.innerHTML = `<img class="product-image-box" src="${product.image_url || fallbackMotorcycleImage}" alt="${escapeHtml(product.part_name)}" loading="lazy" onerror="this.src='${fallbackMotorcycleImage}'"><h3 class="product-title">${escapeHtml(product.part_name)}</h3><p class="product-category">${escapeHtml(product.brand_name)} | ${escapeHtml(product.category)}</p><div class="product-price">₹${product.price}</div><button class="add-to-cart-btn" data-featured-product="${product.id}">Add to Cart</button>`;
                productCard.querySelector('.add-to-cart-btn').addEventListener('click', () => addPartToCart({ id: product.id, part_name: product.part_name, price: product.price }));
                productList.appendChild(productCard);
            });
        } else { productList.innerHTML = '<p style="color: #94a3b8; text-align: center; width: 100%;">No products available right now.</p>'; }
    } catch (error) { console.error("Error loading products:", error); document.getElementById('product-list').innerHTML = '<p style="color: #ef4444; text-align: center; width: 100%;">Failed to connect to server. Check console.</p>'; }
}
function addToCart(name, price) { if(typeof notify === 'function') { notify(`Added to cart: ${name} (₹${price})`); } else { alert(`Added to cart: ${name} (₹${price})`); } }
setTimeout(loadProducts, 500);

// API-driven catalogue, cart, and mock checkout. The original dashboard stays in the DOM and is
// only hidden while a visitor is browsing a brand/model catalogue.
const api = '/api';
const catalogView = document.querySelector('#catalog-view');
const dashboardSections = [...document.querySelectorAll('#offers, #brands, #categories, #products, #support')];
const cartDrawer = document.querySelector('#cart-drawer');
const cartBackdrop = document.querySelector('#cart-backdrop');
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const paymentModal = document.querySelector('#payment-modal');
let cartItemsState = JSON.parse(localStorage.getItem('dey-cart') || '[]');

const rupees = value => `₹${Number(value).toFixed(2)}`;
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
function saveCart() { localStorage.setItem('dey-cart', JSON.stringify(cartItemsState)); renderCart(); }
function cartSum() { return cartItemsState.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0); }
function renderCart() {
    document.querySelector('#cart span').innerHTML = `Your cart<br><b>${rupees(cartSum())}</b>`;
    cartTotal.textContent = rupees(cartSum());
    cartItems.innerHTML = cartItemsState.length ? cartItemsState.map(item => `<article class="cart-item"><div><b>${escapeHtml(item.name)}</b><small>${rupees(item.price)} each</small></div><div class="quantity-controls"><button data-cart-action="decrease" data-id="${item.partId}">−</button><span>${item.quantity}</span><button data-cart-action="increase" data-id="${item.partId}">+</button><button class="remove-item" data-cart-action="remove" data-id="${item.partId}">×</button></div></article>`).join('') : '<p class="empty-state">Your cart is empty. Add a compatible spare part to continue.</p>';
}
function openCart() { cartDrawer.classList.add('open'); cartBackdrop.classList.add('open'); }
function closeCart() { cartDrawer.classList.remove('open'); cartBackdrop.classList.remove('open'); }
function addPartToCart(part) {
    const partId = String(part.id);
    const existing = cartItemsState.find(item => String(item.partId) === partId);
    if (existing) existing.quantity += 1;
    else cartItemsState.push({ partId, name: part.part_name, price: Number(part.price), quantity: 1 });
    saveCart(); openCart(); notify(`${part.part_name} added to your cart.`);
}
function returnHome() { catalogView.hidden = true; dashboardSections.forEach(section => section.hidden = false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function showLoading(message) { catalogView.hidden = false; dashboardSections.forEach(section => section.hidden = true); catalogView.innerHTML = `<div class="catalog-heading"><button class="back-catalog">← Back to dashboard</button><p>${message}</p></div>`; window.scrollTo({ top: 0, behavior: 'smooth' }); }
const heroCatalog = {
    brand: 'Hero',
    models: ['Achiever', 'Glamour', 'HF-Dawn', 'HF-Delux', 'Hunk', 'Ignitor', 'Karizma', 'ZMR', 'Passion Pro', 'Splendor Plus', 'Splendor Pro', 'Super Splendor', 'Xtreme', 'Xpulse 200', 'Splendor iSmart'],
    partsCategories: ['Air filter', 'Body parts', 'Brake', 'Clutch', 'Cable', 'Chain sprockets', 'Engine parts', 'Light', 'Locks & keys', 'Mirror', 'Speedometer', 'Switch', 'Wiring & regulator']
};
const bikeCatalog = {
    brand: 'Bajaj',
    models: ['Pulsar NS 200', 'Pulsar 125', 'Pulsar NS 160', 'Pulsar N 160', 'Pulsar NS 125', 'Pulsar RS 200', 'Pulsar 150', 'Pulsar NS 400Z', 'Pulsar 220F', 'Pulsar 180', 'Pulsar RS 400'],
    partsCategories: ['Air filter', 'Body parts', 'Brake', 'Clutch', 'Cable', 'Chain sprockets', 'Engine parts', 'Light', 'Locks & keys', 'Mirror', 'Speedometer', 'Switch', 'Wiring & regulator']
};
const partIcons = ['◌', '▣', '◉', '⚙', '⌁', '⛓', '◈', '☀', '⚿', '◐', '◫', '⏻', '⌘'];
const productTypes = {
    'Air filter': ['Air Filter Element', 'High-Flow Air Filter', 'Air Filter Housing'], 'Body parts': ['Side Panel Set', 'Front Fender', 'Tank Shroud Set'], Brake: ['Front Brake Pad Set', 'Rear Brake Shoe Set', 'Brake Disc Rotor'], Clutch: ['Clutch Plate Kit', 'Clutch Cable Assembly', 'Clutch Lever'], Cable: ['Accelerator Cable', 'Speedometer Cable', 'Choke Cable'], 'Chain sprockets': ['Drive Chain Kit', 'Front Sprocket', 'Rear Sprocket'], 'Engine parts': ['Engine Gasket Kit', 'Piston Ring Set', 'Spark Plug'], Light: ['LED Headlight Unit', 'Tail Light Assembly', 'Indicator Light Pair'], 'Locks & keys': ['Ignition Lock Set', 'Fuel Tank Cap', 'Seat Lock Assembly'], Mirror: ['Left Rear-View Mirror', 'Right Rear-View Mirror', 'Mirror Pair'], Speedometer: ['Speedometer Cable', 'Speedometer Cluster', 'Meter Cover'], Switch: ['Handlebar Switch Assembly', 'Starter Switch', 'Indicator Switch'], 'Wiring & regulator': ['Main Wiring Harness', 'Voltage Regulator', 'CDI Unit']
};
let currentProducts = [];
const fallbackMotorcycleImage = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80';
const imageKey = value => [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
const modelImageFor = (brand, model, index) => `https://loremflickr.com/900/650/motorcycle?lock=${imageKey(`${brand}-${model}`) + index}`;
const productImageFor = (category, type, index) => `https://loremflickr.com/900/650/motorcycle,${encodeURIComponent(category.replace(/\s+/g, ','))}?lock=${imageKey(`${category}-${type}`) + index}`;
let activeCatalog = bikeCatalog;

function catalogForBrand(brand) {
    if (brand === 'Hero') return heroCatalog;
    if (brand === 'Bajaj') return bikeCatalog;
    return { brand, models: (bikeModels[brand] || []).map(([model]) => model), partsCategories: bikeCatalog.partsCategories };
}

function showModelsFromApi(brand = 'Hero') {
    activeCatalog = catalogForBrand(brand);
    catalogView.hidden = false;
    dashboardSections.forEach(section => section.hidden = true);
    catalogView.innerHTML = `<div class="catalog-heading"><button class="back-catalog">← Back to brands</button><span class="eyebrow">${escapeHtml(activeCatalog.brand)} MOTORCYCLES</span><h1>Bike <em>Models</em></h1><p>Tap a model to browse its parts categories.</p></div><div class="catalog-grid hero-model-grid">${activeCatalog.models.map((model, index) => `<button class="catalog-card model-api-card" data-model-id="${index}" data-model-name="${escapeHtml(model)}"><img class="model-photo" src="${modelImageFor(activeCatalog.brand, model, index)}" alt="${escapeHtml(`${activeCatalog.brand} ${model}`)} motorcycle" loading="lazy" onerror="this.src='${fallbackMotorcycleImage}'"><span>${escapeHtml(activeCatalog.brand)}</span><strong>${escapeHtml(model)}</strong><small>Browse parts →</small></button>`).join('')}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showPartsFromApi(modelId, modelName) {
    catalogView.innerHTML = `<div class="catalog-heading"><button class="back-to-models">← Back to models</button><span class="eyebrow">${escapeHtml(activeCatalog.brand).toUpperCase()} MOTORCYCLES</span><h1>${escapeHtml(modelName)} <em>Parts</em></h1><p>Browse all available part categories for your ${escapeHtml(modelName)}.</p></div><div class="parts-grid category-parts-grid">${activeCatalog.partsCategories.map((category, index) => `<button class="part-card category-card" type="button" data-category="${escapeHtml(category)}" data-model-name="${escapeHtml(modelName)}"><div class="part-icon">${partIcons[index]}</div><span>${escapeHtml(activeCatalog.brand)} ${escapeHtml(modelName)}</span><h3>${escapeHtml(category)}</h3><p>View genuine ${escapeHtml(category).toLowerCase()} parts</p><div><strong>Explore</strong><b>→</b></div></button>`).join('')}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showProducts(category, modelName) {
    const types = productTypes[category] || [`${category} Assembly`, `Premium ${category}`, `${category} Kit`];
    const basePrice = 190 + activeCatalog.partsCategories.indexOf(category) * 85;
    currentProducts = types.map((type, index) => ({ id: `demo-${activeCatalog.brand}-${modelName}-${category}-${index}`.replace(/\s+/g, '-'), part_name: `${activeCatalog.brand} ${modelName} ${type}`, price: basePrice + index * 140, image: productImageFor(category, type, index) }));
    catalogView.innerHTML = `<div class="catalog-heading"><button class="back-to-categories" data-model-name="${escapeHtml(modelName)}">← Back to categories</button><span class="eyebrow">${escapeHtml(modelName)} · ${escapeHtml(category)}</span><h1>${escapeHtml(category)} <em>Parts</em></h1><p>Demo parts selected for your motorcycle.</p></div><div class="catalog-grid product-catalog-grid">${currentProducts.map((product, index) => `<article class="catalog-card product-card"><img src="${product.image}" alt="${escapeHtml(product.part_name)}" loading="lazy" onerror="this.src='${fallbackMotorcycleImage}'"><span>Genuine compatible part</span><strong>${escapeHtml(product.part_name)}</strong><div class="product-card-footer"><b>${rupees(product.price)}</b><button class="add-mock-part" data-product-index="${index}">Add to cart</button></div></article>`).join('')}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.brand-grid button').forEach(button => button.addEventListener('click', () => showModelsFromApi(button.dataset.brand)));
document.querySelectorAll('[data-brand-link]').forEach(link => link.addEventListener('click', () => showModelsFromApi(link.dataset.brandLink)));
const heroBrandButton = document.querySelector('.brand-grid button[data-brand="Hero"]');
const bajajBrandButton = document.querySelector('.brand-grid button[data-brand="Pulsar"]');
bajajBrandButton.dataset.brand = bikeCatalog.brand;
bajajBrandButton.innerHTML = 'Bajaj<br>Pulsar';
heroBrandButton.after(bajajBrandButton);
const bajajNavLink = document.querySelector('[data-brand-link="Pulsar"]');
bajajNavLink.dataset.brandLink = bikeCatalog.brand;
bajajNavLink.textContent = 'Bajaj Pulsar';
catalogView.addEventListener('click', event => {
    if (event.target.closest('.back-catalog')) return returnHome();
    const categoryCard = event.target.closest('.category-card');
    if (categoryCard) return showProducts(categoryCard.dataset.category, categoryCard.dataset.modelName);
    const backToCategories = event.target.closest('.back-to-categories');
    if (backToCategories) return showPartsFromApi('', backToCategories.dataset.modelName);
    const modelCard = event.target.closest('.model-api-card');
    if (modelCard) return showPartsFromApi(modelCard.dataset.modelId, modelCard.dataset.modelName);
    const back = event.target.closest('.back-to-models');
    if (back) return showModelsFromApi(activeCatalog.brand);
    const mockPartButton = event.target.closest('.add-mock-part');
    if (mockPartButton) return addPartToCart(currentProducts[Number(mockPartButton.dataset.productIndex)]);
    const addButton = event.target.closest('.add-part');
    if (addButton) addPartToCart(JSON.parse(addButton.dataset.part));
});
document.querySelector('#cart').addEventListener('click', openCart);
document.querySelectorAll('[data-close-cart]').forEach(button => button.addEventListener('click', closeCart));
cartBackdrop.addEventListener('click', closeCart);
cartItems.addEventListener('click', event => {
    const button = event.target.closest('[data-cart-action]'); if (!button) return;
    const item = cartItemsState.find(entry => String(entry.partId) === String(button.dataset.id)); if (!item) return;
    if (button.dataset.cartAction === 'increase') item.quantity += 1;
    if (button.dataset.cartAction === 'decrease') item.quantity > 1 ? item.quantity -= 1 : cartItemsState = cartItemsState.filter(entry => entry !== item);
    if (button.dataset.cartAction === 'remove') cartItemsState = cartItemsState.filter(entry => entry !== item);
    saveCart();
});
document.querySelector('#checkout-button').addEventListener('click', () => { if (!cartItemsState.length) return notify('Your cart is empty.'); closeCart(); document.querySelector('#payment-total').textContent = rupees(cartSum()); paymentModal.hidden = false; });
document.querySelector('.payment-close').addEventListener('click', () => paymentModal.hidden = true);
const paymentForm = document.querySelector('#payment-form');
const paymentMethodInputs = [...document.querySelectorAll('input[name="payment-method"]')];
const upiField = document.querySelector('#upi-field'), upiId = document.querySelector('#upi-id'), cardDetails = document.querySelector('#card-details');
const cardInputs = ['#card-name', '#card-number', '#card-expiry', '#card-cvv'].map(selector => document.querySelector(selector));
function updatePaymentFields() {
    const method = document.querySelector('input[name="payment-method"]:checked').value;
    upiField.hidden = method !== 'upi'; cardDetails.hidden = method !== 'card'; upiId.required = method === 'upi';
    cardInputs.forEach(input => input.required = method === 'card');
    document.querySelector('#pay-now').textContent = method === 'cod' ? 'Place cash-on-delivery order' : 'Place secure order';
}
paymentMethodInputs.forEach(input => input.addEventListener('change', updatePaymentFields));
updatePaymentFields();
paymentForm.addEventListener('submit', event => {
    event.preventDefault();
    const button = document.querySelector('#pay-now'), method = document.querySelector('input[name="payment-method"]:checked').value;
    const customerName = document.querySelector('#delivery-name').value.trim(), phone = document.querySelector('#delivery-phone').value.trim();
    const orderNumber = `DAP${Date.now().toString().slice(-6)}`;
    button.disabled = true; button.textContent = method === 'cod' ? 'Placing order…' : 'Processing payment…';
    if (document.querySelector('#whatsapp-confirmation').checked) {
        const message = `Dey Auto Parts order ${orderNumber}%0AName: ${encodeURIComponent(customerName)}%0ATotal: ${encodeURIComponent(rupees(cartSum()))}%0APayment: ${encodeURIComponent(method === 'cod' ? 'Cash on Delivery' : method.toUpperCase())}%0ADelivery phone: ${encodeURIComponent(phone)}`;
        window.open(`https://wa.me/918373008821?text=${message}`, '_blank', 'noopener');
    }
    setTimeout(() => { cartItemsState = []; saveCart(); paymentModal.hidden = true; button.disabled = false; updatePaymentFields(); notify(`Order ${orderNumber} placed successfully!`); }, 700);
});
renderCart();
