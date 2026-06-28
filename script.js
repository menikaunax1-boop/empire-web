/* ============================================
   EMPIRE SUPPLIER HUB - JS ENGINE (Optimized)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- DOM Cache ---------- */
  const heroHours    = document.getElementById('hero-hours');
  const heroMinutes  = document.getElementById('hero-minutes');
  const heroSeconds  = document.getElementById('hero-seconds');
  const finalHours   = document.getElementById('final-hours');
  const finalMinutes = document.getElementById('final-minutes');
  const finalSeconds = document.getElementById('final-seconds');
  const floatingCart       = document.getElementById('floating-cart');
  const cartCountEl        = document.getElementById('cart-count');
  const cartTotalEl        = document.getElementById('cart-total');
  const sideCart           = document.getElementById('side-cart');
  const sideCartOverlay    = document.getElementById('side-cart-overlay');
  const sideCartClose      = document.getElementById('side-cart-close');
  const sideCartItemsEl    = document.getElementById('side-cart-items');
  const sideCartSubtotal   = document.getElementById('side-cart-subtotal');
  const viewerCountEl      = document.getElementById('viewer-count');
  const licenseCountEl     = document.getElementById('license-count');
  const popupContainer     = document.querySelector('.popup-container');
  const checkoutItemsList  = document.getElementById('checkout-items-list');

  /* ---------- 1. Countdown Timer ---------- */
  const COUNTDOWN_SECONDS = 2 * 60 * 60;
  let remaining = COUNTDOWN_SECONDS;

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdowns() {
    if (remaining <= 0) remaining = 0;
    const h = pad(Math.floor(remaining / 3600));
    const m = pad(Math.floor((remaining % 3600) / 60));
    const s = pad(remaining % 60);

    if (heroHours)   heroHours.textContent   = h;
    if (heroMinutes) heroMinutes.textContent  = m;
    if (heroSeconds) heroSeconds.textContent  = s;
    if (finalHours)  finalHours.textContent   = h;
    if (finalMinutes)finalMinutes.textContent = m;
    if (finalSeconds)finalSeconds.textContent = s;

    if (remaining > 0) remaining--;
  }

  updateCountdowns();
  setInterval(updateCountdowns, 1000);

  /* ---------- 2. Intersection Observer (Reveal) ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- 3. Background Particles (reduced to 15) ---------- */
  const particlesContainer = document.querySelector('.bg-particles');
  if (particlesContainer) {
    const frag = document.createDocumentFragment();
    const colors = ['var(--neon-cyan)', 'var(--neon-green)', 'rgba(255,255,255,0.3)'];
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      p.style.cssText = `
        left:${Math.random() * 100}%;
        width:${Math.random() * 2.5 + 1}px;
        height:${Math.random() * 2.5 + 1}px;
        animation-duration:${Math.random() * 15 + 10}s;
        animation-delay:${Math.random() * 12}s;
        background:${colors[Math.floor(Math.random() * colors.length)]}
      `;
      frag.appendChild(p);
    }
    particlesContainer.appendChild(frag);
  }

  /* ---------- 4. Social Proof Pop-ups ---------- */
  const cities = [
    'Madrid','Barcelona','Valencia','Sevilla','Málaga','Bilbao','Zaragoza',
    'Alicante','Murcia','Palma','Las Palmas','Córdoba','Vigo','Granada',
    'Buenos Aires','CDMX','Bogotá','Lima','Santiago','Medellín'
  ];

  function showPopup() {
    if (!popupContainer) return;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const popup = document.createElement('div');
    popup.classList.add('popup-notification');
    popup.innerHTML = `✅ Alguien de <span class="popup-city">${city}</span> acaba de comprar el Pack Completo`;
    popupContainer.appendChild(popup);
    setTimeout(() => {
      popup.classList.add('leaving');
      setTimeout(() => popup.remove(), 500);
    }, 4000);
  }

  setTimeout(() => {
    showPopup();
    // Fixed interval instead of nested random to avoid closure memory leak
    setInterval(showPopup, 10000);
  }, 6000);

  /* ---------- 5. Shared slow interval (viewers + scarcity) ---------- */
  let viewers  = 24;
  let licenses = 7;

  setInterval(() => {
    // Viewers counter
    if (viewerCountEl) {
      viewers = Math.max(18, Math.min(42, viewers + Math.floor(Math.random() * 5) - 2));
      viewerCountEl.textContent = viewers;
    }
    // Scarcity counter
    if (licenseCountEl && Math.random() > 0.7 && licenses > 2) {
      licenses--;
      licenseCountEl.textContent = licenses;
    }
  }, 5000);

  /* ---------- 6. Product Card Stagger ---------- */
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 0.08}s`;
  });

  /* ---------- 7. Smooth Scroll for CTAs ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  /* ---------- 8. Hover Tilt (rAF-debounced) ---------- */
  cards.forEach(card => {
    let rafId = null;
    card.addEventListener('mousemove', e => {
      if (rafId) return; // skip if rAF already queued
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
        rafId = null;
      });
    });
    card.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      card.style.transform = '';
    });
  });

  /* ---------- 9. Shopping Cart & LocalStorage ---------- */
  let cartItems = [];
  let sharedDiscount = 0;
  try {
    const saved = localStorage.getItem('empireCart');
    if (saved) cartItems = JSON.parse(saved);
    const savedDisc = localStorage.getItem('empireDiscount');
    if (savedDisc) sharedDiscount = parseFloat(savedDisc) || 0;
  } catch (e) {}

  function saveCart() {
    try { localStorage.setItem('empireCart', JSON.stringify(cartItems)); } catch(e) {}
  }

  function openCart()  {
    sideCart?.classList.add('visible');
    sideCartOverlay?.classList.add('visible');
  }
  function closeCart() {
    sideCart?.classList.remove('visible');
    sideCartOverlay?.classList.remove('visible');
  }

  floatingCart?.addEventListener('click', openCart);
  sideCartClose?.addEventListener('click', closeCart);
  sideCartOverlay?.addEventListener('click', closeCart);

  function renderSideCart() {
    if (!sideCartItemsEl) return;
    if (cartItems.length === 0) {
      sideCartItemsEl.innerHTML = '<div class="side-cart__empty">El carrito está vacío.</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    cartItems.forEach((item, index) => {
      const el = document.createElement('div');
      el.classList.add('cart-item');
      el.innerHTML = `
        <div class="cart-item__details">
          <div class="cart-item__title">${item.name}</div>
          <div class="cart-item__price">${item.price.toFixed(2).replace('.', ',')}€</div>
        </div>
        <button class="cart-item__remove" data-index="${index}">Eliminar</button>
      `;
      frag.appendChild(el);
    });
    sideCartItemsEl.innerHTML = '';
    sideCartItemsEl.appendChild(frag);

    sideCartItemsEl.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', e => {
        cartItems.splice(parseInt(e.currentTarget.dataset.index), 1);
        saveCart();
        updateCartUI();
      });
    });
  }

  function updateCartUI() {
    const count = cartItems.length;
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const finalTotal = total * (1 - sharedDiscount);

    if (cartCountEl) cartCountEl.textContent = count;
    if (cartTotalEl) cartTotalEl.textContent = finalTotal.toFixed(2).replace('.', ',') + '€';

    if (sideCartSubtotal) {
      if (sharedDiscount > 0 && total > 0) {
        sideCartSubtotal.innerHTML = `
          <span style="text-decoration:line-through;color:var(--text-muted);font-size:0.8em;margin-right:8px;">${total.toFixed(2).replace('.', ',')}€</span>
          ${finalTotal.toFixed(2).replace('.', ',')}€
        `;
      } else {
        sideCartSubtotal.textContent = finalTotal.toFixed(2).replace('.', ',') + '€';
      }
    }

    if (floatingCart) {
      floatingCart.classList.add('visible');
      if (count > 0) {
        floatingCart.classList.remove('pop');
        void floatingCart.offsetWidth;
        floatingCart.classList.add('pop');
      }
    }

    renderSideCart();
  }

  // Add to cart buttons
  document.querySelectorAll('.product-card__cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      cartItems.push({ name: btn.dataset.product, price: parseFloat(btn.dataset.price), id: Date.now() });
      saveCart();
      updateCartUI();
      const orig = btn.textContent;
      btn.textContent = '✅ Añadido';
      btn.classList.add('added');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('added'); }, 1500);
    });
  });

  // God Mode / Final CTA
  function addGodModeToCart(e) {
    if (e) e.preventDefault();
    cartItems.push({ name: '📦 EL PACK DEFINITIVO: TODO-EN-UNO', price: 29.00, id: Date.now() });
    saveCart();
    updateCartUI();
  }
  document.getElementById('cta-godmode')?.addEventListener('click', addGodModeToCart);
  document.getElementById('cta-final')?.addEventListener('click', addGodModeToCart);

  // Redirect to checkout
  document.querySelector('.side-cart__checkout-btn')?.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });

  updateCartUI();

  /* ---------- 10. Contact Form ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('.contact__submit-btn');
      const orig = btn.textContent;
      btn.textContent = 'ENVIANDO...';
      setTimeout(() => {
        btn.textContent = '¡MENSAJE ENVIADO!';
        btn.style.background = 'var(--neon-green)';
        btn.style.color = '#000';
        contactForm.reset();
        setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 3000);
      }, 1500);
    });
  }

  /* ---------- 11. Checkout Page Logic ---------- */
  if (checkoutItemsList) {

    function renderCheckout() {
      if (cartItems.length === 0) {
        checkoutItemsList.innerHTML = '<p style="color:var(--text-muted);font-style:italic;">No hay productos en tu pedido.</p>';
        document.getElementById('checkout-subtotal').textContent = '0,00€';
        document.getElementById('checkout-total').textContent = '0,00€';
        return;
      }

      const frag = document.createDocumentFragment();
      let total = 0;
      cartItems.forEach(item => {
        total += item.price;
        const el = document.createElement('div');
        el.classList.add('cart-item');
        el.style.background = 'rgba(255,255,255,0.03)';
        el.innerHTML = `
          <div class="cart-item__title" style="flex:1;">${item.name}</div>
          <div class="cart-item__price">${item.price.toFixed(2).replace('.', ',')}€</div>
        `;
        frag.appendChild(el);
      });
      checkoutItemsList.innerHTML = '';
      checkoutItemsList.appendChild(frag);

      document.getElementById('checkout-subtotal').textContent = total.toFixed(2).replace('.', ',') + '€';

      const checkoutTotalEl = document.getElementById('checkout-total');
      const finalTotal = total * (1 - sharedDiscount);
      if (sharedDiscount > 0 && total > 0) {
        checkoutTotalEl.innerHTML = `
          <span style="text-decoration:line-through;color:var(--text-muted);font-size:0.85em;margin-right:8px;font-weight:normal;">${total.toFixed(2).replace('.', ',')}€</span>
          ${finalTotal.toFixed(2).replace('.', ',')}€
        `;
      } else {
        checkoutTotalEl.textContent = finalTotal.toFixed(2).replace('.', ',') + '€';
      }
    }

    renderCheckout();

    /* -- Promo Code Validation -- */
    const discountBtn   = document.getElementById('checkout-apply-discount');
    const discountInput = document.getElementById('checkout-discount-input');
    const PROMO_CODE    = 'STAYHARD';
    const PROMO_RATE    = 0.15;

    function applyVisualDiscount(active) {
      if (!discountInput || !discountBtn) return;
      if (active) {
        discountInput.value = PROMO_CODE;
        discountInput.style.borderColor = 'var(--neon-green)';
        discountBtn.textContent = '✅';
        discountBtn.style.color = 'var(--neon-green)';
        discountBtn.style.borderColor = 'var(--neon-green)';
      } else {
        discountInput.style.borderColor = 'var(--neon-red)';
        discountBtn.textContent = '❌';
        discountBtn.style.color = '';
        discountBtn.style.borderColor = '';
        setTimeout(() => {
          if (discountBtn) {
            discountBtn.textContent = 'APLICAR';
            discountInput.style.borderColor = 'var(--glass-border)';
          }
        }, 1500);
      }
    }

    // Restore visual state if discount was already applied (e.g. page reload)
    if (sharedDiscount > 0) applyVisualDiscount(true);

    if (discountBtn && discountInput) {
      discountBtn.addEventListener('click', () => {
        const code = discountInput.value.trim().toUpperCase();
        if (code === PROMO_CODE) {
          sharedDiscount = PROMO_RATE;
          try { localStorage.setItem('empireDiscount', String(PROMO_RATE)); } catch(e) {}
          applyVisualDiscount(true);
        } else {
          sharedDiscount = 0;
          try { localStorage.removeItem('empireDiscount'); } catch(e) {}
          applyVisualDiscount(false);
        }
        renderCheckout();
        updateCartUI();
      });

      // Also allow pressing Enter on the input field
      discountInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); discountBtn.click(); }
      });
    }

    /* -- Order Submission → n8n Workflow -- */
    const N8N_WEBHOOK = 'http://localhost:5678/webhook-test/empire-hub';
    const secureForm = document.getElementById('secure-checkout-form');

    if (secureForm) {
      secureForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = secureForm.querySelector('.checkout-pay-btn');
        btn.textContent = 'PROCESANDO PAGO SEGURO... ⏳';
        btn.style.opacity = '0.8';
        btn.disabled = true;

        // Collect form data
        const inputs = secureForm.querySelectorAll('input');
        const formData = {};
        inputs.forEach(i => { if (i.name) formData[i.name] = i.value; });

        // Build order payload
        const total = cartItems.reduce((sum, item) => sum + item.price, 0);
        const finalTotal = total * (1 - sharedDiscount);
        const orderPayload = {
          timestamp: new Date().toISOString(),
          items: cartItems,
          subtotal: total.toFixed(2),
          discount: sharedDiscount > 0 ? `${sharedDiscount * 100}%` : 'Ninguno',
          total: finalTotal.toFixed(2),
          promoCode: sharedDiscount > 0 ? 'STAYHARD' : '',
          customer: formData,
          paymentMethod: secureForm.querySelector('input[name="payment_method"]:checked')?.value || 'card'
        };

        try {
          const response = await fetch(N8N_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'no-cors', // Necesario cuando la web corre desde file:// o distinto origen
            body: JSON.stringify(orderPayload)
          });
          console.log('✅ Pedido enviado a n8n correctamente');
        } catch (err) {
          // Silently continue even if n8n is unreachable — don't block the user flow
          console.warn('⚠️ n8n webhook no accesible:', err.message);
        }

        // Show success regardless (webhook is fire-and-forget)
        btn.style.opacity = '1';
        btn.style.background = '#00ff88';
        btn.style.borderColor = '#00ff88';
        btn.style.color = '#000';
        btn.textContent = '¡PAGO COMPLETADO CON ÉXITO! ✅';
        try { localStorage.removeItem('empireCart'); localStorage.removeItem('empireDiscount'); } catch(e) {}
        cartItems = [];
        sharedDiscount = 0;
        setTimeout(() => {
          alert('¡Gracias por tu compra! Tu pedido será validado y recibirás la confirmación pronto.');
          window.location.href = 'index.html';
        }, 1500);
      });
    }

    /* -- Payment Method Toggle -- */
    const cardBox = document.getElementById('card-details-box');
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (!cardBox) return;
        const isCard = radio.value === 'card';
        cardBox.style.display = isCard ? 'flex' : 'none';
        cardBox.querySelectorAll('input').forEach(i => {
          isCard ? i.setAttribute('required', 'true') : i.removeAttribute('required');
        });
      });
    });
  }

});
