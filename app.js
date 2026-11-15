// =========================================================================
// KONFIGURASI NOMOR WHATSAPP PENJUAL
// Ganti nomor di bawah ini dengan nomor WhatsApp penjual (format 628xxx)
// =========================================================================
const DEFAULT_SELLER_WA = "6283151667585";

const PRODUCTS = {
  original: {
    name: "Fresh Salad Original",
    badge: "Menu 1 • Original",
    price: 15000,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=85",
    description: "Komposisi lengkap sawi segar, kol renyah, jagung manis, wortel serut, telur rebus, dan saus mayones creamy."
  },
  ayamsuwir: {
    name: "Fresh Salad Ayam Suwir",
    badge: "Menu 2 • Saran Menu",
    price: 20000,
    image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=700&q=85",
    description: "Komposisi Menu 1 (sawi, kol, jagung, wortel, telur, saus mayones) ditambah topping ayam suwir gurih."
  }
};

const rupiah = n => "Rp" + Number(n || 0).toLocaleString("id-ID");

function normalizePhoneWA(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return DEFAULT_SELLER_WA;
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits.startsWith("62")) digits = "62" + digits;
  return digits;
}

function getSellerWA() {
  const saved = localStorage.getItem("freshCutSellerWA");
  return saved ? normalizePhoneWA(saved) : DEFAULT_SELLER_WA;
}

function saveSellerWA(val) {
  const clean = normalizePhoneWA(val);
  localStorage.setItem("freshCutSellerWA", clean);
  return clean;
}

// === KERANJANG (CART) ===
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("freshCutCart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("freshCutCart", JSON.stringify(cart));
  updateCount();
}

function updateCount() {
  const el = document.getElementById("cartCount");
  if (el) {
    el.textContent = getCart().reduce((sum, item) => sum + item.qty, 0);
  }
}

function formatOptionsSummary(options = {}) {
  const parts = [];
  if (options.size) parts.push("Ukuran: " + options.size);
  if (options.veggies && options.veggies.length) parts.push("Sayur: " + options.veggies.join(", "));
  if (options.sauce) parts.push("Saus: " + options.sauce);
  if (options.removeVeg && options.removeVeg.length) parts.push(options.removeVeg.join(", "));
  if (options.toppings && options.toppings.length) parts.push("Ekstra: " + options.toppings.join(", "));
  return parts.join(" • ");
}

function addToCart(id, qty = 1, options = {}) {
  const baseProduct = PRODUCTS[id] || {
    name: options.customName || "Custom Salad",
    price: options.basePrice || 15000,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=85"
  };

  const cart = getCart();
  const toppingPrice = Number(options.toppingPrice || 0);
  const finalUnitPrice = baseProduct.price + toppingPrice;
  const optionKey = [
    id,
    options.size || "",
    options.sauce || "",
    (options.veggies || []).join(","),
    (options.removeVeg || []).join(","),
    (options.toppings || []).join(",")
  ].join("|");

  const existing = cart.find(item => item.key === optionKey);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key: optionKey,
      id,
      qty,
      name: baseProduct.name,
      price: finalUnitPrice,
      image: baseProduct.image,
      options
    });
  }
  saveCart(cart);
}

function renderCart() {
  const box = document.getElementById("cartContent");
  if (!box) return;
  const cart = getCart();

  if (!cart.length) {
    box.innerHTML = `
      <div class="cart-box empty">
        Keranjang kamu masih kosong.<br>
        <a class="btn btn-primary" style="margin-top:15px" href="katalog.html">Lihat Katalog Menu</a>
      </div>`;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  box.innerHTML = `
    <div class="cart-box">
      <div class="cart-row" style="font-weight:700;font-size:12px;color:var(--muted);">
        <span>Produk</span>
        <span>Detail Pilihan</span>
        <span>Harga</span>
        <span>Jumlah</span>
        <span></span>
      </div>
      ${cart.map((item, idx) => `
        <div class="cart-row">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-name">
            <b>${item.name}</b>
            <small>${formatOptionsSummary(item.options) || "Standar komposisi menu"}</small>
          </div>
          <span class="cart-price">${rupiah(item.price)}</span>
          <div class="mini-qty">
            <button type="button" onclick="changeQty(${idx}, -1)">−</button>
            <b>${item.qty}</b>
            <button type="button" onclick="changeQty(${idx}, 1)">+</button>
          </div>
          <button type="button" class="delete" title="Hapus item" onclick="removeItem(${idx})">🗑</button>
        </div>
      `).join("")}
      <div class="cart-bottom">
        <div class="totals">
          <div class="summary-row"><span>Subtotal Produk</span><b>${rupiah(subtotal)}</b></div>
          <div class="summary-row"><span>Ongkir</span><small style="color:var(--muted)">Gratis ambil di tempat / Rp5.000 diantar</small></div>
          <div class="summary-total"><span>Total Sementara</span><b>${rupiah(subtotal)}</b></div>
          <div class="cart-buttons">
            <a class="btn btn-outline" href="katalog.html">← Lanjut Belanja</a>
            <a class="btn btn-accent" href="checkout.html">Lanjut Checkout →</a>
          </div>
        </div>
      </div>
    </div>`;
}

function changeQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// === CHECKOUT & FORMAT PESAN WHATSAPP ===
function buildWhatsAppMessage(order) {
  const itemLines = order.items.map((item, i) => {
    const opt = formatOptionsSummary(item.options);
    return `${i + 1}. ${item.name} (${item.qty}x) = ${rupiah(item.price * item.qty)}${opt ? "\n   • " + opt : ""}`;
  }).join("\n");

  const deliveryText = order.delivery === "delivery"
    ? `Diantar ke alamat:\n   ${order.address}`
    : "Ambil di tempat (Outlet Fresh Cut)";

  const lines = [
    `*PESANAN BARU — FRESH CUT* 🥗`,
    `No. Pesanan: *${order.number}*`,
    `Waktu: ${order.createdAt}`,
    ``,
    `*Data Pemesan:*`,
    `• Nama: ${order.customerName}`,
    `• No. HP/WA: ${order.customerPhone}`,
    `• Pengambilan: ${deliveryText}`,
    `• Pembayaran: ${order.payment}`,
    order.notes ? `• Catatan: ${order.notes}` : null,
    ``,
    `*Rincian Pesanan:*`,
    itemLines,
    ``,
    `Subtotal: ${rupiah(order.subtotal)}`,
    `Ongkir: ${rupiah(order.shipping)}`,
    `*Total Pembayaran: ${rupiah(order.total)}*`,
    ``,
    `Mohon konfirmasi pesanan saya. Terima kasih! 🙏`
  ].filter(line => line !== null);

  return lines.join("\n");
}

function renderCheckout() {
  const list = document.getElementById("checkoutItems");
  if (!list) return;

  const cart = getCart();
  if (!cart.length) {
    list.innerHTML = `<p style="font-size:13px;color:var(--muted);">Keranjang masih kosong. <a href="katalog.html" style="color:var(--green);text-decoration:underline;">Pilih menu dulu</a>.</p>`;
    document.getElementById("checkoutSubtotal").textContent = rupiah(0);
    document.getElementById("checkoutShipping").textContent = rupiah(0);
    document.getElementById("checkoutTotal").textContent = rupiah(0);
    return;
  }

  const sub = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const selectedDelivery = document.querySelector('input[name="delivery"]:checked')?.value || "pickup";
  const shipping = selectedDelivery === "delivery" ? 5000 : 0;

  list.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <b>${item.name}</b> x${item.qty}
        <small>${formatOptionsSummary(item.options) || "Standar"}</small>
      </div>
      <b>${rupiah(item.price * item.qty)}</b>
    </div>
  `).join("");

  document.getElementById("checkoutSubtotal").textContent = rupiah(sub);
  document.getElementById("checkoutShipping").textContent = rupiah(shipping);
  document.getElementById("checkoutTotal").textContent = rupiah(sub + shipping);
}

function renderConfirmation() {
  const order = JSON.parse(localStorage.getItem("lastOrder") || "null");
  if (!order) return;

  document.getElementById("orderNumber").textContent = order.number;
  document.getElementById("confirmationCustomer").innerHTML = `
    <b>${order.customerName}</b> (${order.customerPhone})<br>
    Metode: ${order.delivery === "delivery" ? "Diantar — " + order.address : "Ambil di tempat"} • Bayar: ${order.payment}
  `;

  const list = document.getElementById("confirmationItems");
  list.innerHTML = order.items.map(item => `
    <div class="checkout-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <b>${item.name}</b> x${item.qty}
        <small>${formatOptionsSummary(item.options) || "Standar"}</small>
      </div>
      <b>${rupiah(item.price * item.qty)}</b>
    </div>
  `).join("");

  document.getElementById("confirmationSubtotal").textContent = rupiah(order.subtotal);
  document.getElementById("confirmationShipping").textContent = rupiah(order.shipping);
  document.getElementById("confirmationTotal").textContent = rupiah(order.total);

  const waText = order.waMessage || buildWhatsAppMessage(order);
  const waUrl = `https://wa.me/${order.sellerWA || getSellerWA()}?text=${encodeURIComponent(waText)}`;

  const previewBox = document.getElementById("waPreviewBox");
  if (previewBox) previewBox.textContent = waText;

  const resendBtn = document.getElementById("waResendBtn");
  if (resendBtn) resendBtn.href = waUrl;

  const copyBtn = document.getElementById("copyWaBtn");
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard?.writeText(waText);
      copyBtn.textContent = "✓ Teks Pesanan Tersalin";
      setTimeout(() => { copyBtn.textContent = "📋 Salin Format Pesanan"; }, 2000);
    };
  }
}

// === AKUN / RIWAYAT PESANAN ===
function renderAccountPage() {
  const container = document.getElementById("accountView");
  if (!container) return;

  const user = JSON.parse(localStorage.getItem("freshCutUser") || "null");
  const orders = JSON.parse(localStorage.getItem("freshCutOrders") || "[]");

  if (!user) {
    container.innerHTML = `
      <div class="page-heading" style="text-align: center;">
        <span class="eyebrow">Selamat Datang</span>
        <h1>Masuk ke Akun</h1>
        <p style="margin-top: 8px;">Simpan nama & nomor WhatsApp kamu agar checkout lebih cepat.</p>
      </div>
      <form id="loginForm" class="form-card">
        <label>Nama Lengkap
          <input required type="text" name="name" placeholder="Masukkan nama lengkap">
        </label>
        <label>Nomor WhatsApp
          <input required type="tel" name="phone" placeholder="08xxxxxxxxxx">
        </label>
        <label>Email
          <input required type="email" name="email" placeholder="nama@email.com">
        </label>
        <button class="btn btn-accent btn-wide" type="submit">Masuk / Simpan Profil</button>
      </form>
    `;

    document.getElementById("loginForm").onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      localStorage.setItem("freshCutUser", JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email")
      }));
      renderAccountPage();
      updateNavbarAuth();
    };
  } else {
    container.innerHTML = `
      <div class="form-card" style="margin-bottom: 24px;">
        <span class="eyebrow">Profil Pelanggan</span>
        <h2 style="margin-bottom: 6px;">Halo, ${user.name}! 👋</h2>
        <p style="font-size: 13px; color: var(--muted); margin: 0 0 16px;">WhatsApp: ${user.phone} • Email: ${user.email}</p>
        <div style="display: flex; gap: 10px;">
          <a class="btn btn-primary" href="katalog.html">Pesan Salad</a>
          <button type="button" id="logoutBtn" class="btn btn-outline">Keluar Akun</button>
        </div>
      </div>
      <div class="form-card">
        <h2>Riwayat Pesanan (${orders.length})</h2>
        ${orders.length ? orders.map(ord => `
          <div style="border-bottom: 1px solid var(--line); padding: 12px 0; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <div>
              <b style="font-size: 13px; color: var(--green);">${ord.number}</b>
              <div style="font-size: 12px;">${ord.items.map(i => i.name + " x" + i.qty).join(", ")}</div>
              <small style="color: var(--muted);">${ord.createdAt} • Total ${rupiah(ord.total)}</small>
            </div>
            <a class="btn btn-wa" style="padding: 8px 12px; font-size: 11px;" target="_blank" rel="noopener"
               href="https://wa.me/${ord.sellerWA || getSellerWA()}?text=${encodeURIComponent(ord.waMessage || buildWhatsAppMessage(ord))}">
               Kirim WA
            </a>
          </div>
        `).join("") : `<p style="font-size: 13px; color: var(--muted);">Belum ada riwayat pesanan.</p>`}
      </div>
    `;

    document.getElementById("logoutBtn").onclick = () => {
      localStorage.removeItem("freshCutUser");
      renderAccountPage();
      updateNavbarAuth();
    };
  }
}

function updateNavbarAuth() {
  const link = document.getElementById("navAuthLink");
  if (!link) return;
  const user = JSON.parse(localStorage.getItem("freshCutUser") || "null");
  if (user && user.name) {
    link.textContent = "👤 " + user.name.split(" ")[0];
  } else {
    link.textContent = "Masuk / Daftar";
  }
}

// === INISIALISASI HALAMAN ===
document.addEventListener("DOMContentLoaded", () => {
  updateCount();
  updateNavbarAuth();
  renderCart();
  renderCheckout();
  renderAccountPage();

  const path = location.pathname;

  // 1. Halaman Detail Produk (detail.html)
  if (path.endsWith("detail.html")) {
    const id = new URLSearchParams(location.search).get("id") || "original";
    const p = PRODUCTS[id] || PRODUCTS.original;

    document.getElementById("detailBadge").textContent = p.badge;
    document.getElementById("detailImage").src = p.image;
    document.getElementById("detailImage").alt = p.name;
    document.getElementById("detailName").textContent = p.name;
    document.getElementById("detailPrice").textContent = rupiah(p.price);
    document.getElementById("detailDescription").textContent = p.description;

    let qty = 1;
    const qEl = document.getElementById("qty");
    document.getElementById("plus").onclick = () => { qEl.textContent = ++qty; };
    document.getElementById("minus").onclick = () => { qty = Math.max(1, --qty); qEl.textContent = qty; };

    document.getElementById("detailAdd").onclick = () => {
      const sauce = document.querySelector('input[name="sauce"]:checked')?.value || "Mayones Creamy";
      const removeVeg = [...document.querySelectorAll('input[name="remove_veg"]:checked')].map(x => x.value);
      const checks = [...document.querySelectorAll(".toppings input:checked")];
      const toppingPrice = checks.reduce((sum, x) => sum + Number(x.dataset.price || 0), 0);

      addToCart(id, qty, {
        sauce,
        removeVeg,
        toppings: checks.map(x => x.value),
        toppingPrice
      });
      location.href = "keranjang.html";
    };
  }

  // 2. Halaman Custom Salad (custom.html)
  const customForm = document.getElementById("customSaladForm");
  if (customForm) {
    let customQty = 1;
    const updateCustomSummary = () => {
      const sizeInput = document.querySelector('input[name="size"]:checked');
      const basePrice = Number(sizeInput?.dataset.price || 15000);
      const extras = [...document.querySelectorAll('input[name="extra"]:checked')];
      const extraPrice = extras.reduce((sum, x) => sum + Number(x.dataset.price || 0), 0);
      document.getElementById("customBasePrice").textContent = rupiah(basePrice);
      document.getElementById("customExtraPrice").textContent = rupiah(extraPrice);
      document.getElementById("customTotalPrice").textContent = rupiah(basePrice + extraPrice);
    };

    customForm.addEventListener("change", updateCustomSummary);
    document.getElementById("customPlus").onclick = () => {
      document.getElementById("customQty").textContent = ++customQty;
    };
    document.getElementById("customMinus").onclick = () => {
      customQty = Math.max(1, --customQty);
      document.getElementById("customQty").textContent = customQty;
    };

    document.getElementById("customAddBtn").onclick = () => {
      const sizeInput = document.querySelector('input[name="size"]:checked');
      const size = sizeInput?.value || "Regular";
      const basePrice = Number(sizeInput?.dataset.price || 15000);
      const veggies = [...document.querySelectorAll('input[name="veggies"]:checked')].map(x => x.value);
      const sauce = document.querySelector('input[name="dressing"]:checked')?.value || "Mayones Creamy";
      const extras = [...document.querySelectorAll('input[name="extra"]:checked')];
      const toppingPrice = extras.reduce((sum, x) => sum + Number(x.dataset.price || 0), 0);

      addToCart("custom", customQty, {
        customName: "Custom Salad (" + size + ")",
        basePrice,
        size,
        veggies,
        sauce,
        toppings: extras.map(x => x.value),
        toppingPrice
      });
      location.href = "keranjang.html";
    };
    updateCustomSummary();
  }

  // 3. Tombol cepat "Tambah ke Keranjang" di Katalog
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.onclick = () => {
      addToCart(btn.dataset.id, 1, { sauce: "Mayones Creamy" });
      btn.textContent = "✓ Ditambahkan";
      setTimeout(() => { btn.textContent = "Tambah ke Keranjang"; }, 900);
    };
  });

  // 4. Halaman Checkout & Kirim ke WhatsApp (checkout.html)
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    const sellerWaInput = document.getElementById("sellerWaInput");
    if (sellerWaInput) {
      sellerWaInput.value = getSellerWA();
      sellerWaInput.addEventListener("change", () => {
        sellerWaInput.value = saveSellerWA(sellerWaInput.value);
      });
    }

    // Auto-fill jika sudah login
    const user = JSON.parse(localStorage.getItem("freshCutUser") || "null");
    if (user) {
      if (user.name) document.getElementById("custName").value = user.name;
      if (user.phone) document.getElementById("custPhone").value = user.phone;
    }

    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    const addressContainer = document.getElementById("addressContainer");
    const addressField = document.getElementById("custAddress");

    deliveryRadios.forEach(radio => {
      radio.addEventListener("change", e => {
        if (e.target.value === "delivery") {
          addressContainer.style.display = "block";
          addressField.setAttribute("required", "required");
        } else {
          addressContainer.style.display = "none";
          addressField.removeAttribute("required");
        }
        renderCheckout();
      });
    });

    checkoutForm.onsubmit = e => {
      e.preventDefault();
      const cart = getCart();
      if (!cart.length) {
        alert("Keranjang kamu masih kosong!");
        location.href = "katalog.html";
        return;
      }

      const fd = new FormData(checkoutForm);
      const delivery = fd.get("delivery") || "pickup";
      const shipping = delivery === "delivery" ? 5000 : 0;
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const total = subtotal + shipping;
      const sellerWA = saveSellerWA(sellerWaInput ? sellerWaInput.value : getSellerWA());

      const counter = Number(localStorage.getItem("freshCutOrderSeq") || "0") + 1;
      localStorage.setItem("freshCutOrderSeq", String(counter));
      const orderNumber = "#FC" + String(counter).padStart(3, "0");

      const now = new Date();
      const createdAt = now.toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });

      const order = {
        number: orderNumber,
        createdAt,
        customerName: fd.get("name"),
        customerPhone: fd.get("phone"),
        delivery,
        address: fd.get("address") || "",
        payment: fd.get("payment"),
        notes: fd.get("notes") || "",
        items: cart,
        subtotal,
        shipping,
        total,
        sellerWA
      };

      order.waMessage = buildWhatsAppMessage(order);

      // Simpan ke localStorage (lastOrder + riwayat freshCutOrders)
      localStorage.setItem("lastOrder", JSON.stringify(order));
      const history = JSON.parse(localStorage.getItem("freshCutOrders") || "[]");
      history.unshift(order);
      localStorage.setItem("freshCutOrders", JSON.stringify(history));
      localStorage.removeItem("freshCutCart");

      // Buka WhatsApp penjual di tab baru dan arahkan ke halaman konfirmasi
      const waUrl = `https://wa.me/${sellerWA}?text=${encodeURIComponent(order.waMessage)}`;
      window.open(waUrl, "_blank", "noopener");
      location.href = "konfirmasi.html";
    };
  }

  // 5. Halaman Konfirmasi (konfirmasi.html)
  if (path.endsWith("konfirmasi.html")) {
    renderConfirmation();
  }
});
