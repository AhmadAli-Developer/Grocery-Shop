'use client';

import { useState, useEffect } from 'react';

// Mock Data for Grocery Products
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Fresh Organic Bananas',
    category: 'Fruits & Vegetables',
    price: 2.99,
    unit: 'kg',
    stock: 15,
    img: '🍌',
  },
  {
    id: 2,
    name: 'Premium Whole Milk',
    category: 'Dairy',
    price: 1.49,
    unit: 'pack',
    stock: 2,
    img: '🥛',
  },
  {
    id: 3,
    name: 'Sourdough Crusty Bread',
    category: 'Bakery',
    price: 3.99,
    unit: 'each',
    stock: 8,
    img: '🍞',
  },
  {
    id: 4,
    name: 'Cold Pressed Orange Juice',
    category: 'Beverages',
    price: 4.49,
    unit: 'each',
    stock: 0,
    img: '🧃',
  },
  {
    id: 5,
    name: 'Red Tomatoes',
    category: 'Fruits & Vegetables',
    price: 1.99,
    unit: 'kg',
    stock: 25,
    img: '🍅',
  },
];

export default function Storefront() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  // Local Storage Check for Cart Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('grocery_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const saveCart = (newCart: { [key: number]: number }) => {
    setCart(newCart);
    localStorage.setItem('grocery_cart', JSON.stringify(newCart));
  };

  const addToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const currentQty = cart[productId] || 0;
    if (currentQty >= product.stock) {
      alert(`Sorry, only ${product.stock} units available in stock!`);
      return;
    }

    const updated = { ...cart, [productId]: currentQty + 1 };
    saveCart(updated);
  };

  const updateCartQty = (productId: number, qty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || qty > product.stock) return;

    if (qty <= 0) {
      const { [productId]: _, ...rest } = cart;
      saveCart(rest);
    } else {
      saveCart({ ...cart, [productId]: qty });
    }
  };

  const handleCheckout = () => {
    // Concurrency & Stock Validation Simulation
    let stockValid = true;
    const newProducts = [...products];
    const receiptItems: any[] = [];

    Object.keys(cart).forEach((idStr) => {
      const id = parseInt(idStr);
      const target = newProducts.find((p) => p.id === id);
      if (target) {
        if (target.stock < cart[id]) {
          stockValid = false;
          alert(`Overselling Blocked! ${target.name} ran out of stock.`);
        } else {
          target.stock -= cart[id];
          receiptItems.push({ name: target.name, qty: cart[id] });
        }
      }
    });

    if (!stockValid) return;

    setProducts(newProducts);
    const orderRecord = {
      id: Math.floor(Math.random() * 90000) + 10000,
      items: receiptItems,
      time: new Date().toLocaleTimeString(),
    };
    setOrders([orderRecord, ...orders]);
    saveCart({});
    alert(`Order Confirmed! Your order ID is #${orderRecord.id}`);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || p.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Real-time Header Info */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Grocery Shop.
          </h1>
          <p className="text-xs text-slate-400">
            Premium Full-Stack Challenge Platform
          </p>
        </div>
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="bg-slate-800 hover:bg-slate-700 text-xs px-4 py-2 rounded-lg font-mono tracking-wider transition border border-slate-700"
        >
          {isAdmin ? 'SWITCH TO STOREFRONT' : 'GO TO LIVE ADMIN DASHBOARD'}
        </button>
      </header>

      {!isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Storefront Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3D Visual Hero Simulation Area */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 to-slate-900 rounded-2xl p-6 border border-emerald-500/20 shadow-2xl">
              <div className="absolute right-4 top-2 w-48 h-48 opacity-80 pointer-events-none hidden md:block">
                <iframe
                  src="https://my.spline.design/glasscirclescopy-ca1775e114092497eb1dfda6bf5d1163/"
                  frameBorder="0"
                  width="100%"
                  height="100%"
                ></iframe>
              </div>
              <h2 className="text-xl font-bold text-emerald-400 mb-2">
                Immersive Grocery Experience
              </h2>
              <p className="text-sm text-slate-400 max-w-md">
                Strict type validation, localized persistence caching, dynamic
                query streaming, and high concurrency race condition handling.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search premium products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="All">All Categories</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition duration-300 transform hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-emerald-400/80 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/40">
                        {p.category}
                      </span>
                      <h3 className="font-semibold text-lg mt-2 text-slate-200 group-hover:text-white transition">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Per {p.unit}
                      </p>
                    </div>
                    <div className="text-3xl bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 group-hover:scale-110 transition duration-300">
                      {p.img}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center border-t border-slate-800/60 pt-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-mono">
                        Price
                      </p>
                      <p className="text-xl font-black text-white">
                        ${p.price}
                      </p>
                    </div>
                    <div>
                      {p.stock > 0 ? (
                        <button
                          onClick={() => addToCart(p.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition tracking-wide shadow-lg shadow-emerald-950/50"
                        >
                          ADD TO CART ({p.stock} Left)
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-3 py-2 rounded-lg border border-rose-900/30">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Persistent Sidebar Shopping Cart */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 h-fit space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-200 flex items-center justify-between">
              <span>Shopping Cart</span>
              <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                {Object.keys(cart).length} unique items
              </span>
            </h2>

            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-2xl">📦</p>
                <p className="text-xs font-mono">
                  Your basket is completely empty.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {Object.keys(cart).map((idStr) => {
                    const id = parseInt(idStr);
                    const product = products.find((p) => p.id === id);
                    if (!product) return null;
                    return (
                      <div
                        key={id}
                        className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-medium text-slate-200 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            ${product.price} / {product.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={product.stock}
                            value={cart[id]}
                            onChange={(e) =>
                              updateCartQty(id, parseInt(e.target.value) || 0)
                            }
                            className="w-14 bg-slate-950 border border-slate-800 rounded text-center py-1 text-xs font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm py-3 rounded-xl transition tracking-wider shadow-xl shadow-emerald-950/20"
                >
                  SECURE SECURE CHECKOUT (SANDBOX)
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Real-Time Live Admin / Vendor Panel */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Live System Concurrency State
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                Isolating (Atomic)
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Total Orders Captured
              </p>
              <p className="text-2xl font-bold text-teal-400 mt-1">
                {orders.length}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs font-mono text-rose-400 uppercase tracking-wider">
                Low Stock Status Alerts
              </p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {products.filter((p) => p.stock <= 3).length} Warning Triggers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Inventory Tuning Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-md text-slate-300 mb-4 font-mono uppercase tracking-wider">
                Live Inventory Synchronizer
              </h3>
              <div className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center text-xs border-b border-slate-800 pb-2"
                  >
                    <span className="font-medium text-slate-300">{p.name}</span>
                    <span
                      className={`font-mono px-2 py-0.5 rounded font-bold ${
                        p.stock <= 3
                          ? 'bg-rose-950 text-rose-400 border border-rose-900'
                          : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {p.stock} units remaining
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Web Socket Order Stream Emulation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-md text-slate-300 mb-4 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Incoming Sockets Stream (No Refresh)
              </h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-600 text-xs font-mono">
                  Listening for transactional checkouts from storefront...
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-center text-xs font-mono"
                    >
                      <div>
                        <p className="text-emerald-400 font-bold">
                          Order #{o.id}
                        </p>
                        <p className="text-slate-400 mt-1">
                          {o.items
                            .map((i: any) => `${i.name} (x${i.qty})`)
                            .join(', ')}
                        </p>
                      </div>
                      <span className="text-slate-500">{o.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
