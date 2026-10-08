/**
 * KASIR PWA PRO - Advanced Features
 * Written in Vanilla JS
 */

const API_URL = "https://api-pos.muhammadzio04.workers.dev";

const DB_PRODUCTS = 'kasir_products';
const DB_HISTORY = 'kasir_history';
const DB_MUTATIONS = 'kasir_mutations';
const DB_USERS = 'kasir_users';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBDUrw1DkFQNq5bOAcFJ33-gpMAENRDjfk",
  authDomain: "ipwija-coffee-db.firebaseapp.com",
  projectId: "ipwija-coffee-db",
  storageBucket: "ipwija-coffee-db.firebasestorage.app",
  messagingSenderId: "686599799948",
  appId: "1:686599799948:web:38fcdb65244a17b5866ed1"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch((err) => {
    console.warn("Firebase persistence error:", err.code);
});

// Helper for single document sync (like settings, users, products)
function syncDoc(collection, docId, localKey, appRef, renderCallback) {
    db.collection(collection).doc(docId).onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data().data;
            if (data) {
                const parsed = JSON.parse(data);
                app[appRef] = parsed;
                localStorage.setItem(localKey, data);
                if (renderCallback) renderCallback();
            }
        } else {
            // Upload local data to cloud if cloud is empty
            const localData = localStorage.getItem(localKey);
            if (localData) {
                db.collection(collection).doc(docId).set({ data: localData });
            }
        }
    });
}


// Main App Object to avoid global scope pollution
const     app = {
    cart: [],
    products: [],
    history: [],
    mutations: [],
    users: [],
    settings: {
        storeName: 'IPWIJA COFFEE',
        storeAddress: '1912 Pike Pl, Seattle, WA 98101',
        storeNpwp: '98-7654321',
        taxRate: 10.25
    },

    init() {
        // Load Data
        const defaultProducts = [
            { id: 1, name: 'Caffe Americano', price: 38000, category: 'Coffee', stock: 50, image: 'assets/image/americano.jpg' },
            { id: 2, name: 'Caffe Latte', price: 52000, category: 'Coffee', stock: 40, image: 'assets/image/caffe_latte.jpg' },
            { id: 3, name: 'Caramel Macchiato', price: 60000, category: 'Coffee', stock: 30, image: 'assets/image/caramel_macchiato.jpg' },
            { id: 4, name: 'Espresso', price: 29000, category: 'Coffee', stock: 80, image: 'assets/image/espresso.jpg' },
            { id: 5, name: 'Mocha Frappuccino', price: 58000, category: 'Coffee', stock: 35, image: 'assets/image/mocha_frappuccino.jpg' },
            { id: 6, name: 'Vanilla Latte', price: 54000, category: 'Coffee', stock: 45, image: 'assets/image/vanilla_latte.jpg' },
            
            { id: 7, name: 'Matcha Green Tea', price: 58000, category: 'Non-Coffee', stock: 25, image: 'assets/image/matcha.jpg' },
            { id: 8, name: 'Signature Chocolate', price: 55000, category: 'Non-Coffee', stock: 40, image: 'assets/image/signature_chocolate.jpg' },
            { id: 9, name: 'Teavana Earl Grey', price: 35000, category: 'Non-Coffee', stock: 60, image: 'assets/image/earl_grey.jpg' },
            { id: 10, name: 'Iced Shaken Lemon', price: 43000, category: 'Non-Coffee', stock: 55, image: 'assets/image/lemon_tea.jpg' },
            
            { id: 11, name: 'Butter Croissant', price: 25000, category: 'Food', stock: 20, image: 'assets/image/butter_croissant.jpg' },
            { id: 12, name: 'Almond Croissant', price: 38000, category: 'Food', stock: 15, image: 'assets/image/croissant.jpg' },
            { id: 13, name: 'Beef Sausage Bun', price: 45000, category: 'Food', stock: 10, image: 'assets/image/beef_sausage.jpg' },
            { id: 14, name: 'New York Cheesecake', price: 50000, category: 'Food', stock: 8, image: 'assets/image/cheesecake.jpg' },
            { id: 15, name: 'Tuna Puff', price: 32000, category: 'Food', stock: 12, image: 'assets/image/tuna_puff.jpg' },
            
            { id: 16, name: 'Ipwija Tumbler', price: 350000, category: 'Merchandise', stock: 5, image: 'assets/image/tumbler.jpg' },
            { id: 17, name: 'Coffee Beans 250g', price: 140000, category: 'Merchandise', stock: 15, image: 'assets/image/coffee_beans.jpg' },
            { id: 18, name: 'Ipwija Mug', price: 250000, category: 'Merchandise', stock: 10, image: 'assets/image/Logo-Ipwija.png' }
        ];

        let savedProducts = JSON.parse(localStorage.getItem(DB_PRODUCTS));
        
        // Force wipe logic via check for old IDR prices or user request
        if(localStorage.getItem('force_reset_v3') !== 'true') {
            localStorage.removeItem(DB_PRODUCTS);
            localStorage.removeItem(DB_HISTORY);
            localStorage.removeItem(DB_MUTATIONS);
            localStorage.removeItem('kasir_settings');
            localStorage.setItem('force_reset_v3', 'true');
            savedProducts = null;
        }

        if(!savedProducts || savedProducts.length === 0) {
            this.products = defaultProducts;
        } else {
            this.products = savedProducts.map(p => {
                const defaultP = defaultProducts.find(dp => dp.id === p.id);
                // Force sync prices and images with default realistic IDR data
                if(defaultP) {
                    p.price = defaultP.price;
                    if([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].includes(p.id) || !p.image || p.image.includes('images.unsplash.com')) {
                        p.image = defaultP.image;
                    }
                }
                if (p.category === 'Makanan') p.category = 'Food';
                return p;
            });
        }
        localStorage.setItem(DB_PRODUCTS, JSON.stringify(this.products));
        
        this.settings = JSON.parse(localStorage.getItem('kasir_settings')) || this.settings;
        this.history = JSON.parse(localStorage.getItem(DB_HISTORY)) || [];
        this.mutations = JSON.parse(localStorage.getItem(DB_MUTATIONS)) || [];
        
        // Load Users
        const defaultUsers = [{ id: 1, username: 'admin', password: '12345', role: 'Administrator' }];
        this.users = JSON.parse(localStorage.getItem(DB_USERS)) || defaultUsers;
        if(this.users.length === 0) this.users = defaultUsers;
        localStorage.setItem(DB_USERS, JSON.stringify(this.users));
        
        // Setup Firebase Realtime Synchronization
        syncDoc('store', 'products', DB_PRODUCTS, 'products', () => {
            if(document.getElementById('produk').classList.contains('active')) this.renderProducts();
            if(document.getElementById('pos').classList.contains('active')) this.renderPOS();
        });
        syncDoc('store', 'history', DB_HISTORY, 'history', () => {
            if(document.getElementById('riwayat').classList.contains('active')) this.renderHistory();
            if(document.getElementById('dashboard').classList.contains('active')) this.renderDashboard();
        });
        syncDoc('store', 'mutations', DB_MUTATIONS, 'mutations', () => {
            if(document.getElementById('riwayat').classList.contains('active')) this.renderMutasiLog();
        });
        syncDoc('store', 'users', DB_USERS, 'users', () => {
            if(document.getElementById('users').classList.contains('active')) this.renderUsers();
        });

        // Force Light Theme
        document.documentElement.setAttribute('data-theme', 'light');

        this.checkLogin();
        this.setupListeners();
        this.updateStatus();
        this.startClock();
    },

    // --- UTILITIES ---
    startClock() {
        setInterval(() => {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const clockEl = document.getElementById('realtime-clock');
            if (clockEl) clockEl.innerText = now.toLocaleDateString('id-ID', options).replace(/\./g, ':');
        }, 1000);
    },

    formatCurrency(number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    },

    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },
    
    showToast(message, isError = false) {
        document.querySelectorAll('.toast').forEach(t => t.remove());
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showModal(id) {
        document.getElementById(id).classList.add('show');
    },
    hideModal(id) {
        document.getElementById(id).classList.remove('show');
    },

    showConfirm(message, onConfirm) {
        document.getElementById('confirm-message').innerText = message;
        document.getElementById('modal-confirm').classList.add('show');
        document.getElementById('confirm-yes').onclick = () => {
            this.hideModal('modal-confirm');
            onConfirm();
        };
        document.getElementById('confirm-no').onclick = () => {
            this.hideModal('modal-confirm');
        };
    },

    // --- AUTH ---
    checkLogin() {
        const session = localStorage.getItem("kasir_session");
        if(session){
            this.currentUser = JSON.parse(session);
            document.getElementById("loginPage").style.display = "none";
            document.getElementById("appPage").style.display = "flex";
            
            const lastPage = localStorage.getItem("last_page") || 'dashboard';
            this.nav(lastPage);
        } else {
            document.getElementById("loginPage").style.display = "flex";
            document.getElementById("appPage").style.display = "none";
        }
    },
    login() {
        const user = document.getElementById("username").value;
        const pass = document.getElementById("password").value;
        const validUser = this.users.find(u => u.username === user && u.password === pass);
        if (validUser) {
            this.currentUser = validUser;
            localStorage.setItem('kasir_session', JSON.stringify(validUser));
            this.showToast(`Selamat datang, ${validUser.username}!`);
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('appPage').style.display = 'flex';
            this.nav('dashboard');
        } else {
            this.showToast("Username / Kata Sandi salah!", true);
        }
    },
    
    forgotPassword() {
        Swal.fire({
            icon: 'info',
            title: 'Lupa Kata Sandi?',
            text: 'Silakan hubungi IT Support atau hubungi Administrator untuk mereset kata sandi Anda.',
            confirmButtonText: 'Mengerti',
            confirmButtonColor: '#1A4687'
        });
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('kasir_session');
        document.getElementById("loginPage").style.display = "flex";
        document.getElementById("appPage").style.display = "none";
        this.showToast('Berhasil keluar');
    },

    setupListeners() {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.addEventListener('click', (e) => {
                const target = el.closest('.nav-item').getAttribute('data-target');
                this.nav(target);
            });
        });

        document.getElementById('pos-search').addEventListener('input', this.debounce((e) => {
            this.renderPOS(e.target.value);
        }, 200));
        document.getElementById('product-search').addEventListener('input', () => this.renderProducts());
        document.getElementById('history-search').addEventListener('input', () => this.renderHistory());

        document.getElementById('product-image').addEventListener('change', (e) => {
            const preview = document.getElementById('product-image-preview');
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = ev => {
                    preview.innerHTML = `<img src="${ev.target.result}" style="max-width:80px;max-height:80px;border-radius:8px;border:1px solid var(--border-color);">`;
                };
                reader.readAsDataURL(e.target.files[0]);
            } else {
                preview.innerHTML = '';
            }
        });

        window.addEventListener('online', () => this.updateStatus());
        window.addEventListener('offline', () => this.updateStatus());
    },

    nav(target) {
        localStorage.setItem("last_page", target);
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`.nav-item[data-target="${target}"]`).classList.add('active');
        
        document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
        document.getElementById(target).classList.add('active');

        const titles = {
            'dashboard': 'Dashboard',
            'pos': 'Cashier',
            'produk': 'Product',
            'riwayat': 'History',
            'pengaturan': 'Settings',
            'users': 'Manage Users'
        };
        document.getElementById('topbar-title').innerText = titles[target];

        if(target === 'dashboard') this.renderDashboard();
        if(target === 'pos') this.renderPOS();
        if(target === 'produk') this.renderProducts();
        if(target === 'riwayat') { this.renderHistory(); this.renderMutasiLog(); }
        if(target === 'pengaturan') this.renderSettings();
        if(target === 'users') this.renderUsers();
    },

    updateStatus() {
        const el = document.getElementById('status-indicator');
        if(navigator.onLine){
            el.innerText = "Online";
            el.style.color = "var(--primary-color)";
        } else {
            el.innerText = "Offline";
            el.style.color = "var(--danger-color)";
            this.showToast("Mode Offline", true);
        }
    },

    renderDashboard() {
        const todayStr = new Date().toLocaleDateString('id-ID');
        let todayRevenue = 0;
        let totalCount = this.history.length;
        let todayItemsSold = 0;

        this.history.forEach(h => {
            const hDate = new Date(h.timestamp).toLocaleDateString('id-ID');
            if(hDate === todayStr) {
                todayRevenue += h.total;
                h.items.forEach(i => { todayItemsSold += i.qty; });
            }
        });

        document.getElementById('dash-revenue').innerText = this.formatCurrency(todayRevenue);
        document.getElementById('dash-count').innerText = totalCount;
        
        const elItems = document.getElementById('dash-items');
        if(elItems) elItems.innerText = todayItemsSold;

        const lowStockContainer = document.getElementById('dash-low-stock');
        if(lowStockContainer) {
            const lowStockProducts = this.products.filter(p => (p.stock || 0) <= 5);
            if(lowStockProducts.length === 0) {
                lowStockContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem;">Stok dalam kondisi aman.</div>';
            } else {
                lowStockContainer.innerHTML = lowStockProducts.map(p => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed var(--border-color);">
                        <div style="font-weight:500;">${p.name} <span class="badge badge-category" style="margin-left:5px;">${p.category||'Other'}</span></div>
                        <div style="color:var(--danger-color); font-weight:700;">Sisa: ${p.stock||0}</div>
                    </div>
                `).join('');
            }
        }

        this.renderCharts();
    },

    renderCharts() {
        const ctx = document.getElementById('revenueChart');
        if(!ctx) return;
        
        const last7Days = [];
        const dataMap = {};
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
            last7Days.push(dateStr);
            dataMap[dateStr] = 0;
        }

        this.history.forEach(h => {
            const dStr = new Date(h.timestamp).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
            if(dataMap[dStr] !== undefined) {
                dataMap[dStr] += h.total;
            }
        });

        const dataVals = last7Days.map(d => dataMap[d]);

        if(this.revenueChartInstance) {
            this.revenueChartInstance.destroy();
        }

        try {
            this.revenueChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: last7Days,
                    datasets: [{
                        label: 'Pendapatan (IDR)',
                        data: dataVals,
                        borderColor: '#1A4687',
                        backgroundColor: 'rgba(0, 98, 65, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: (value) => value >= 1000000 ? (value/1000000).toFixed(1).replace('.0','') + 'jt' : (value/1000).toFixed(0) + 'rb' } }
                    }
                }
            });
        } catch(e) { console.log("Chart.js tidak termuat", e); }

        const prodCount = {};
        this.history.forEach(h => {
            h.items.forEach(item => {
                prodCount[item.name] = (prodCount[item.name] || 0) + item.qty;
            });
        });
        
        const sortedProds = Object.entries(prodCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
        const listEl = document.getElementById('topProductsList');
        if(sortedProds.length === 0) {
            listEl.innerHTML = '<li style="color:var(--text-muted);">Belum ada data penjualan</li>';
        } else {
            listEl.innerHTML = sortedProds.map((p, index) => `
                <li style="display:flex; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--border-color);">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="background:var(--primary-color); color:white; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">${index+1}</span>
                        <span style="font-weight:500;">${p[0]}</span>
                    </div>
                    <span style="font-weight:bold; color:var(--primary-color);">${p[1]}x</span>
                </li>
            `).join('');
        }
    },

    renderProducts() {
        const tbody = document.getElementById('product-table-body');
        const search = (document.getElementById('product-search').value || '').toLowerCase();
        
        let filtered = this.products;
        if(search) {
            filtered = this.products.filter(p => p.name.toLowerCase().includes(search));
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted)">Produk tidak ditemukan</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(p => {
            const cat = p.category || 'Other';
            const stock = p.stock || 0;
            const stockBadge = stock <= 5 ? 'badge-stock low' : 'badge-stock';
            const thumb = p.image
                ? `<img src="${p.image}" alt="" style="width:36px;height:36px;border-radius:8px;object-fit:cover;vertical-align:middle;margin-right:8px;" onerror="this.style.display='none'">`
                : '';
            
            return `
            <tr>
                <td style="font-weight:500">
                    ${thumb}${p.name}<br>
                    <span class="badge badge-category" style="margin-top:4px;">${cat}</span>
                </td>
                <td style="color:var(--primary-color); font-weight:600;">${this.formatCurrency(p.price)}</td>
                <td><span class="badge ${stockBadge}">Stok: ${stock}</span></td>
                <td style="text-align:right;">
                    <button class="btn" style="padding:6px 10px; background:rgba(0,98,65,0.1); color:var(--primary-color); font-size:0.75rem; border:1px solid rgba(0,98,65,0.2);" onclick="app.showMutasiModal(${p.id})">Stok</button>
                    <button class="btn" style="padding:6px 10px; background:var(--warning-color); color:white; font-size:0.75rem;" onclick="app.editProduct(${p.id})">Edit</button>
                    <button class="btn danger" style="padding:6px 10px; font-size:0.75rem;" onclick="app.deleteProduct(${p.id})">Hapus</button>
                </td>
            </tr>
            `;
        }).join('');
    },

    readFileAsBase64(file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    },

    showProductModal() {
        document.getElementById('product-id').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-category').value = 'Coffee';
        document.getElementById('product-stock').value = '0';
        document.getElementById('product-image').value = '';
        document.getElementById('product-image-preview').innerHTML = '';
        document.getElementById('product-modal-title').innerText = 'Tambah Produk';
        document.getElementById('modal-product').classList.add('show');
    },

    editProduct(id) {
        const p = this.products.find(x => x.id === id);
        if(!p) return;
        document.getElementById('product-id').value = p.id;
        document.getElementById('product-name').value = p.name;
        document.getElementById('product-price').value = p.price;
        document.getElementById('product-category').value = p.category || 'Coffee';
        document.getElementById('product-stock').value = p.stock || 0;
        document.getElementById('product-image').value = '';
        document.getElementById('product-image-preview').innerHTML = p.image
            ? `<img src="${p.image}" style="max-width:80px;max-height:80px;border-radius:8px;border:1px solid var(--border-color);">`
            : '';
        document.getElementById('product-modal-title').innerText = 'Edit Produk';
        document.getElementById('modal-product').classList.add('show');
    },

    async saveProduct() {
        const id = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value.trim();
        const price = parseInt(document.getElementById('product-price').value);
        const category = document.getElementById('product-category').value;
        const stock = parseInt(document.getElementById('product-stock').value) || 0;
        const fileInput = document.getElementById('product-image');
        const existingPreview = document.getElementById('product-image-preview').querySelector('img');
        let image = existingPreview ? existingPreview.src : '';

        if (fileInput.files && fileInput.files[0]) {
            image = await this.readFileAsBase64(fileInput.files[0]);
        }

        if (!name || isNaN(price)) {
            this.showToast('Isi nama produk dan harga!', true);
            return;
        }

        const newProd = {
            id: id ? parseInt(id) : Date.now(),
            name, price, category, stock, image
        };

        if (id) {
            const idx = this.products.findIndex(p => p.id === parseInt(id));
            if (idx > -1) this.products[idx] = newProd;
            this.showToast('Produk berhasil diperbarui');
        } else {
            this.products.unshift(newProd);
            this.showToast('Produk berhasil ditambahkan');
        }

        localStorage.setItem(DB_PRODUCTS, JSON.stringify(this.products));
        db.collection('store').doc('products').set({ data: JSON.stringify(this.products) });
        this.hideModal('modal-product');
        this.renderProducts();
    },

    deleteProduct(id) {
        this.showConfirm('Yakin ingin menghapus produk ini?', () => {
            this.products = this.products.filter(p => p.id !== id);
            localStorage.setItem(DB_PRODUCTS, JSON.stringify(this.products));
        db.collection('store').doc('products').set({ data: JSON.stringify(this.products) });
            this.renderProducts();
            this.showToast('Produk berhasil dihapus');
        });
    },

    showMutasiModal(id) {
        const p = this.products.find(x => x.id === id);
        if(!p) return;
        document.getElementById('mutasi-product-id').value = p.id;
        document.getElementById('mutasi-product-name').value = p.name;
        document.getElementById('mutasi-current-stock').value = p.stock || 0;
        document.getElementById('mutasi-qty').value = '';
        document.getElementById('mutasi-type').value = 'in';
        document.getElementById('mutasi-note').value = '';
        this.showModal('modal-mutasi');
    },

    saveMutasi() {
        const id = parseInt(document.getElementById('mutasi-product-id').value);
        const qty = parseInt(document.getElementById('mutasi-qty').value);
        const type = document.getElementById('mutasi-type').value;
        
        if(!qty || isNaN(qty) || qty <= 0) {
            this.showToast('Isi kuantitas penyesuaian!', true);
            return;
        }

        const product = this.products.find(p => p.id === id);
        if(!product) return;

        if(type === 'out' && (product.stock || 0) < qty) {
            this.showToast('Stok tidak mencukupi!', true);
            return;
        }

        const mutasi = {
            id: 'MTS-' + Date.now(),
            timestamp: Date.now(),
            productId: product.id,
            productName: product.name,
            type: type,
            qty: qty,
            note: document.getElementById('mutasi-note').value,
            user: this.currentUser ? this.currentUser.username : 'admin'
        };

        product.stock = type === 'in' ? (product.stock || 0) + qty : (product.stock || 0) - qty;
        
        this.mutations.unshift(mutasi);
        localStorage.setItem(DB_MUTATIONS, JSON.stringify(this.mutations));
        db.collection('store').doc('mutations').set({ data: JSON.stringify(this.mutations) });
        localStorage.setItem(DB_PRODUCTS, JSON.stringify(this.products));
        db.collection('store').doc('products').set({ data: JSON.stringify(this.products) });

        this.hideModal('modal-mutasi');
        this.showToast('Penyesuaian stok berhasil');
        this.renderProducts();
        this.renderMutasiLog();
    },

    renderMutasiLog() {
        const container = document.getElementById('mutasi-log');
        const countEl = document.getElementById('mutasi-count');
        
        if(countEl) countEl.innerText = this.mutations.length;

        if(this.mutations.length === 0) {
            container.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:10px;">Belum ada penyesuaian</div>';
            return;
        }

        container.innerHTML = this.mutations.slice(0, 20).map(m => {
            const isIn = m.type === 'in';
            const date = new Date(m.timestamp).toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
            return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <div>
                    <div style="font-weight:500;font-size:0.85rem;">${m.productName}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);">${date} · ${m.note || ''}</div>
                </div>
                <div style="text-align:right;">
                    <span style="font-weight:700;font-size:0.9rem;color:${isIn ? 'var(--primary-color)' : 'var(--danger-color)'};">${isIn ? '+' : '-'}${m.qty}</span>
                    <div style="font-size:0.65rem;color:var(--text-muted);">left ${m.stockAfter}</div>
                </div>
            </div>
            `;
        }).join('');
    },

    // --- POS & CART ---
    currentPosCategory: 'All',

    setPosCategory(cat) {
        this.currentPosCategory = cat;
        this.renderPOS(document.getElementById('pos-search').value);
    },

    renderPOS(search = '') {
        const grid = document.getElementById('pos-grid');
        const catContainer = document.getElementById('pos-categories');
        
        // Render Categories — dynamic from product data
        const catSet = new Set(this.products.map(p => p.category || 'Other'));
        const categories = ['All', ...Array.from(catSet).sort()];
        if(catContainer) {
            catContainer.innerHTML = categories.map(c => `
                <div class="category-tab ${this.currentPosCategory === c ? 'active' : ''}" onclick="app.setPosCategory('${c}')">
                    ${c}
                </div>
            `).join('');
        }

        let filtered = this.products;
        
        if(this.currentPosCategory !== 'All') {
            filtered = filtered.filter(p => (p.category || 'Other') === this.currentPosCategory);
        }

        if(search) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; color:var(--text-muted); padding:20px; text-align:center;">Produk tidak ditemukan</div>`;
            return;
        }

        grid.innerHTML = filtered.map(p => {
            const lowStock = (p.stock || 0) <= 5;
            const initial = p.name.charAt(0).toUpperCase();
            const avatar = p.image
                ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;">${initial}</span>`
                : `<span>${initial}</span>`;
            return `
            <div class="product-card" onclick="app.addToCart(${p.id})">
                <div class="product-card-avatar">${avatar}</div>
                <div class="product-card-body">
                    <div class="product-name">${p.name}</div>
                    <div class="product-price">${this.formatCurrency(p.price)}</div>
                    <div class="product-stock-badge ${lowStock ? 'low' : ''}">Stock: ${p.stock || 0}</div>
                </div>
            </div>
            `;
        }).join('');

        this.renderCart();
    },

    addToCart(id) {
        const p = this.products.find(x => x.id === id);
        if(!p) return;

        const existing = this.cart.find(x => x.id === id);
        const currentQty = existing ? existing.qty : 0;

        if(currentQty + 1 > (p.stock || 0)) {
            this.showToast('Stok tidak mencukupi!', true);
            return;
        }

        if(existing) {
            existing.qty += 1;
            existing.total = existing.qty * existing.price;
        } else {
            this.cart.push({
                id: p.id,
                name: p.name,
                price: p.price,
                qty: 1,
                total: p.price
            });
        }
        this.renderCart();
    },

    clearCart() {
        if(this.cart.length === 0) return;
        this.showConfirm('Kosongkan keranjang?', () => {
            this.cart = [];
            this.renderCart();
            this.showToast('Keranjang dikosongkan');
        });
    },

    updateCartQty(id, delta) {
        const item = this.cart.find(x => x.id === id);
        if(!item) return;

        const newQty = item.qty + delta;
        if(newQty <= 0) {
            this.cart = this.cart.filter(x => x.id !== id);
            this.renderCart();
            return;
        }

        const product = this.products.find(p => p.id === id);
        if(delta > 0 && product && newQty > (product.stock || 0)) {
            this.showToast('Stok tidak mencukupi!', true);
            return;
        }

        item.qty = newQty;
        item.total = item.qty * item.price;
        this.renderCart();
    },

    renderCart() {
        const container = document.getElementById('cart-items');
        const countEl = document.getElementById('cart-count');
        let grandTotal = 0;

        if (this.cart.length === 0) {
            container.innerHTML = `<div class="cart-empty">Keranjang kosong</div>`;
            if(countEl) countEl.innerText = '0';
            document.getElementById('cart-total').innerText = 'Rp 0';
            return;
        } else {
            container.innerHTML = this.cart.map(c => {
                grandTotal += c.total;
                return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${c.name}</div>
                        <div class="cart-item-price">${this.formatCurrency(c.price)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="app.updateCartQty(${c.id}, -1)">−</button>
                        <span class="cart-qty">${c.qty}</span>
                        <button class="qty-btn" onclick="app.updateCartQty(${c.id}, 1)">+</button>
                    </div>
                </div>
                `;
            }).join('');
            if(countEl) countEl.innerText = this.cart.length;
        }

        document.getElementById('cart-total').innerText = this.formatCurrency(grandTotal);
        this.cartTotal = grandTotal;
    },

    // --- CHECKOUT & PRINT ---
    showCheckoutModal() {
        if (this.cart.length === 0) {
            this.showToast("Keranjang kosong!", true);
            return;
        }

        // Calculate Tax
        this.cartTax = Math.round(this.cartTotal * (this.settings.taxRate / 100));
        this.cartGrandTotal = this.cartTotal + this.cartTax;

        document.getElementById('checkout-total').innerText = this.formatCurrency(this.cartGrandTotal);
        document.getElementById('checkout-pay').value = '';
        document.getElementById('checkout-change').innerText = 'Rp 0';
        document.getElementById('checkout-change').style.color = 'var(--warning-color)';
        document.getElementById('checkout-method').value = 'Cash';

        this.showModal('modal-checkout');
        setTimeout(() => document.getElementById('checkout-pay').focus(), 100);
    },

    calculateChange() {
        const pay = parseInt(document.getElementById('checkout-pay').value) || 0;
        const change = pay - this.cartGrandTotal;
        const changeEl = document.getElementById('checkout-change');
        
        if (change < 0) {
            changeEl.style.color = "var(--danger-color)";
            changeEl.innerText = 'Kurang ' + this.formatCurrency(Math.abs(change));
        } else {
            changeEl.innerText = this.formatCurrency(change);
            changeEl.style.color = 'var(--primary-color)';
        }
    },

    processCheckout() {
        const method = document.getElementById('checkout-method').value;
        let pay = parseFloat(document.getElementById('checkout-pay').value);
        
        if(isNaN(pay)) pay = 0;
        
        const change = pay - this.cartGrandTotal;

        if (method === 'Cash' && change < 0) {
            this.showToast("Jumlah pembayaran kurang!", true);
            return;
        }

        // Save to History
        const transaction = {
            id: 'TRX-' + Date.now(),
            timestamp: Date.now(),
            items: [...this.cart],
            subtotal: this.cartTotal,
            tax: this.cartTax,
            total: this.cartGrandTotal,
            pay: pay,
            change: change,
            method: method
        };
        
        this.history.unshift(transaction);
        localStorage.setItem(DB_HISTORY, JSON.stringify(this.history));
        db.collection('store').doc('history').set({ data: JSON.stringify(this.history) });

        // Final Check Stock
        for (let cartItem of this.cart) {
            const product = this.products.find(p => p.id === cartItem.id);
            if (!product) {
                this.showToast(`Produk "${cartItem.name}" tidak ditemukan!`, true);
                return;
            }
            if ((product.stock || 0) < cartItem.qty) {
                this.showToast(`Stok tidak mencukupi untuk "${product.name}" (sisa ${product.stock || 0})!`, true);
                return;
            }
        }

        // Deduct Stock
        this.cart.forEach(cartItem => {
            const product = this.products.find(p => p.id === cartItem.id);
            if(product) {
                product.stock -= cartItem.qty;
            }
        });
        localStorage.setItem(DB_PRODUCTS, JSON.stringify(this.products));
        db.collection('store').doc('products').set({ data: JSON.stringify(this.products) });

        this.hideModal('modal-checkout');
        
        Swal.fire({
            title: 'Pembayaran Berhasil!',
            text: 'Apakah Anda ingin mencetak struk?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Cetak Struk',
            cancelButtonText: 'Tidak, Terima Kasih',
            confirmButtonColor: '#1A4687',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.printReceipt(transaction);
            }
        });

        // Reset Cart
        this.cart = [];
        this.renderCart();
    },

    printReceipt(trx) {
        // Update Store Profile dynamically
        const headerEl = document.querySelector('.receipt-header');
        if(headerEl) {
            headerEl.innerHTML = `
                <img src="assets/image/Logo-Ipwija.png" alt="Logo" style="width: 60px; height: 60px; border-radius: 50%; filter: grayscale(100%); margin-bottom:5px;">
                <h3 style="margin:0; font-family:sans-serif; letter-spacing:1px; text-transform:uppercase;">${this.settings.storeName}</h3>
                <p style="margin:2px 0; font-size:11px;">${this.settings.storeAddress}</p>
                <p style="margin:2px 0; font-size:11px;">NPWP: ${this.settings.storeNpwp}</p>
            `;
        }

        document.getElementById('receipt-date').innerText = new Date(trx.timestamp).toLocaleString('id-ID');
        document.getElementById('receipt-id').innerText = trx.id;
        document.getElementById('receipt-method').innerText = (trx.method || 'Cash').toUpperCase();
        
        document.getElementById('receipt-items').innerHTML = trx.items.map(i => `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>${i.qty}x ${i.name}</span>
                <span>${this.formatCurrency(i.total)}</span>
            </div>
        `).join('');

        // Dynamic tax label
        const taxLabelEl = document.getElementById('receipt-tax-label');
        if(taxLabelEl) taxLabelEl.innerText = `Pajak (${this.settings.taxRate}%)`;
        
        const taxAmtEl = document.getElementById('receipt-tax-amt');
        if(taxAmtEl) taxAmtEl.innerText = trx.tax > 0 ? this.formatCurrency(trx.tax) : 'Termasuk';

        document.getElementById('receipt-total-amt').innerText = this.formatCurrency(trx.subtotal || trx.total);
        document.getElementById('receipt-pay-amt').innerText = this.formatCurrency(trx.pay);
        document.getElementById('receipt-change-amt').innerText = this.formatCurrency(trx.change);

        // Call browser print
        window.print();
    },

    // --- HISTORY & EXPORT ---
    toggleHistoryDetail(id) {
        const el = document.getElementById('history-item-' + id);
        if(el) {
            el.classList.toggle('open');
        }
    },

    renderHistory() {
        const container = document.getElementById('history-list');
        const search = (document.getElementById('history-search').value || '').toLowerCase();
        
        let filtered = this.history;
        if(search) {
            filtered = this.history.filter(h => h.id.toLowerCase().includes(search) || new Date(h.timestamp).toLocaleDateString('id-ID').includes(search));
        }

        if(filtered.length === 0) {
            container.innerHTML = `<div class="card" style="text-align:center; color:var(--text-muted)">Riwayat tidak ditemukan</div>`;
            return;
        }

        container.innerHTML = filtered.map(h => `
            <div class="history-item" id="history-item-${h.id}" onclick="app.toggleHistoryDetail('${h.id}')">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <div>
                        <div style="font-weight:600; color:var(--text-main)">${h.id}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted)">${new Date(h.timestamp).toLocaleString('en-US')}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:700; font-size:1.1rem; color:var(--primary-color);">${this.formatCurrency(h.total)}</div>
                        <span class="badge badge-success" style="margin-top:5px;">Paid</span>
                    </div>
                </div>
                <div class="history-detail">
                    <div style="font-weight:600; margin-bottom:10px;">Order Details:</div>
                    ${h.items.map(i => `
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:5px;">
                            <span>${i.name} x${i.qty}</span>
                            <span style="color:var(--text-muted)">${this.formatCurrency(i.total)}</span>
                        </div>
                    `).join('')}
                    <div style="border-top:1px dashed var(--border-color); margin-top:10px; padding-top:10px; display:flex; justify-content:space-between; font-size:0.85rem;">
                        <span>Cash: ${this.formatCurrency(h.pay)}</span>
                        <span>Change: ${this.formatCurrency(h.change)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    exportCSV() {
        if(this.history.length === 0) {
            this.showToast('Tidak ada data untuk diekspor!', true);
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Date,Total Amount,Method,Items\n";
        
        this.history.forEach(h => {
            const dateStr = new Date(h.timestamp).toLocaleString('en-US').replace(/,/g, '');
            const itemStr = h.items.map(i => `${i.qty}x ${i.name}`).join('; ');
            csvContent += `${h.id},${dateStr},${h.total},${h.method||'Cash'},"${itemStr}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `POS_Report_${new Date().toLocaleDateString('en-US')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast("Berhasil diunduh");
    },

    // --- SETTINGS ---
    renderSettings() {
        document.getElementById('setting-store-name').value = this.settings.storeName;
        document.getElementById('setting-store-address').value = this.settings.storeAddress;
        document.getElementById('setting-store-npwp').value = this.settings.storeNpwp;
        document.getElementById('setting-tax-rate').value = this.settings.taxRate;
    },

    saveSettings() {
        this.settings.storeName = document.getElementById('setting-store-name').value;
        this.settings.storeAddress = document.getElementById('setting-store-address').value;
        this.settings.storeNpwp = document.getElementById('setting-store-npwp').value;
        this.settings.taxRate = parseFloat(document.getElementById('setting-tax-rate').value) || 0;
        
        localStorage.setItem('kasir_settings', JSON.stringify(this.settings));
        db.collection('store').doc('settings').set({ data: JSON.stringify(this.settings) });
        this.showToast('Pengaturan berhasil disimpan!');
    },

    resetHistory() {
        this.showConfirm('Apakah Anda yakin ingin menghapus seluruh riwayat transaksi dan penyesuaian stok? Tindakan ini TIDAK DAPAT dibatalkan.', () => {
            // Clear history and mutations
            this.history = [];
            this.mutations = [];
            localStorage.removeItem(DB_HISTORY);
            localStorage.removeItem(DB_MUTATIONS);
            
            // Re-render everything
            this.renderHistory();
            this.renderMutasiLog();
            this.renderDashboard();
            this.showToast('Seluruh riwayat transaksi telah dihapus', true);
        });
    },

    // --- USER MANAGEMENT ---
    renderUsers() {
        const tbody = document.getElementById('user-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        this.users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.id}</td>
                <td><strong>${u.username}</strong></td>
                <td><span class="badge ${u.role === 'Administrator' ? 'low' : ''}" style="background: ${u.role === 'Administrator' ? 'var(--danger-color)' : 'var(--primary-color)'}; color: white;">${u.role}</span></td>
                <td>
                    <button class="btn" style="padding:6px 10px; background:var(--warning-color); color:white; font-size:0.75rem;" onclick="app.openUserModal(${u.id})">Edit</button>
                    ${u.id !== 1 ? `<button class="btn danger" style="padding:6px 10px; font-size:0.75rem;" onclick="app.deleteUser(${u.id})">Delete</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    },
    openUserModal(id = null) {
        const title = document.getElementById('user-modal-title');
        const idInput = document.getElementById('user-id');
        const usernameInput = document.getElementById('user-username');
        const passwordInput = document.getElementById('user-password');
        const roleInput = document.getElementById('user-role');
        
        if (id) {
            const u = this.users.find(x => x.id === id);
            title.innerText = 'Edit Karyawan';
            idInput.value = u.id;
            usernameInput.value = u.username;
            passwordInput.value = u.password;
            roleInput.value = u.role;
            if (u.id === 1) {
                usernameInput.disabled = true;
                roleInput.disabled = true;
            } else {
                usernameInput.disabled = false;
                roleInput.disabled = false;
            }
        } else {
            title.innerText = 'Tambah Karyawan';
            idInput.value = '';
            usernameInput.value = '';
            passwordInput.value = '';
            roleInput.value = 'Cashier';
            usernameInput.disabled = false;
            roleInput.disabled = false;
        }
        this.showModal('modal-user');
    },
    saveUser(e) {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const username = document.getElementById('user-username').value.trim();
        const password = document.getElementById('user-password').value.trim();
        const role = document.getElementById('user-role').value;
        
        if (!username || !password) return this.showToast('Username dan Kata Sandi wajib diisi', true);
        
        if (id) {
            // Edit
            const u = this.users.find(x => x.id == id);
            if (u.id !== 1) {
                u.username = username;
                u.role = role;
            }
            u.password = password;
            this.showToast('Data karyawan diperbarui');
        } else {
            // Add
            if (this.users.find(x => x.username === username)) return this.showToast('Username sudah ada', true);
            const newId = this.users.length > 0 ? Math.max(...this.users.map(user => user.id)) + 1 : 1;
            this.users.push({ id: newId, username, password, role });
            this.showToast('Karyawan ditambahkan');
        }
        
        localStorage.setItem(DB_USERS, JSON.stringify(this.users));
        db.collection('store').doc('users').set({ data: JSON.stringify(this.users) });
        this.hideModal('modal-user');
        this.renderUsers();
    },
    deleteUser(id) {
        if (id === 1) return this.showToast('Tidak dapat menghapus admin utama', true);
        this.showConfirm('Yakin ingin menghapus karyawan ini?', () => {
            this.users = this.users.filter(u => u.id !== id);
            localStorage.setItem(DB_USERS, JSON.stringify(this.users));
        db.collection('store').doc('users').set({ data: JSON.stringify(this.users) });
            this.renderUsers();
            this.showToast('Karyawan dihapus');
        });
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// SERVICE WORKER
if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered!'))
            .catch(err => console.log('SW error', err));
    });
}
