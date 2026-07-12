"use client";

import { useState, useEffect } from "react";

// 9 Realistic Premium Products Catalog with Specific Pre-Applied Discounts
const INITIAL_PRODUCTS = [
  { id: 1, name: "Premium Basmati Rice (5kg)", category: "Grains & Pulses", price: 12.99, unit: "bag", stock: 12, salesCount: 0, code: "BR-01", visual: "🌾", currentDiscount: 0 },
  { id: 2, name: "Organic Desi Ghee (1kg)", category: "Dairy & Oils", price: 18.50, unit: "jar", stock: 5, salesCount: 0, code: "DG-03", visual: "🍯", currentDiscount: 15 }, // 15% OFF
  { id: 3, name: "Premium Quality Mutton", category: "Meat & Poultry", price: 14.99, unit: "kg", stock: 15, salesCount: 0, code: "MT-09", visual: "🥩", currentDiscount: 10 }, // 10% OFF
  { id: 4, name: "Fresh Farm Eggs (Dozen)", category: "Dairy & Oils", price: 2.49, unit: "pack", stock: 3, salesCount: 0, code: "EG-12", visual: "🥚", currentDiscount: 0 },
  { id: 5, name: "Pure Organic Honey", category: "Packaged Foods", price: 8.99, unit: "bottle", stock: 8, salesCount: 0, code: "HN-05", visual: "🐝", currentDiscount: 0 },
  { id: 6, name: "Fresh Boneless Chicken", category: "Meat & Poultry", price: 6.49, unit: "kg", stock: 18, salesCount: 0, code: "CK-07", visual: "🍗", currentDiscount: 0 },
  { id: 7, name: "Premium Olive Oil (1L)", category: "Dairy & Oils", price: 11.99, unit: "bottle", stock: 6, salesCount: 0, code: "OL-22", visual: "🫒", currentDiscount: 5 }, // 5% OFF
  { id: 8, name: "Whole Wheat Atta (10kg)", category: "Grains & Pulses", price: 9.99, unit: "bag", stock: 10, salesCount: 0, code: "WT-44", visual: "🍞", currentDiscount: 0 },
  { id: 9, name: "Premium Tea Blend (500g)", category: "Packaged Foods", price: 4.25, unit: "pack", stock: 14, salesCount: 0, code: "TE-18", visual: "☕", currentDiscount: 0 },
];

export default function GroceryConsole() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Advanced Order Management Stream (Pending vs Completed)
  const [orders, setOrders] = useState<any[]>([]);
  
  const [revenue, setRevenue] = useState(0);
  const [mostSelling, setMostSelling] = useState("N/A");
  
  // Dynamic Admin Coupon States
  const [adminCouponCode, setAdminCouponCode] = useState("OFFER10");
  const [adminDiscountValue, setAdminDiscountValue] = useState(10); 
  
  // User Input Coupon States
  const [userCouponInput, setUserCouponInput] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("grocery_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const saveCart = (newCart: { [key: number]: number }) => {
    setCart(newCart);
    localStorage.setItem("grocery_cart", JSON.stringify(newCart));
  };

  const addToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const currentQty = cart[productId] || 0;
    if (currentQty >= product.stock) {
      alert(`Allocation Threshold Reached.`);
      return;
    }
    saveCart({ ...cart, [productId]: currentQty + 1 });
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

  const applyPromoCode = () => {
    if (userCouponInput.trim().toUpperCase() === adminCouponCode.trim().toUpperCase()) {
      const calculatedRate = adminDiscountValue / 100;
      setDiscountRate(calculatedRate);
      setCouponApplied(true);
      alert(`Discount Core Module Activated: ${adminDiscountValue}% Computed reduction.`);
    } else {
      alert("Invalid context parameter. Coupon code mismatch.");
    }
  };

  // Step 1: Customer Pushes Order to Admin Queue
  const handleCheckoutRequest = () => {
    let stockValid = true;
    let grossTotal = 0;
    const receiptItems: any[] = [];

    Object.keys(cart).forEach((idStr) => {
      const id = parseInt(idStr);
      const target = products.find((p) => p.id === id);
      if (target) {
        if (target.stock < cart[id]) {
          stockValid = false;
        } else {
          // Calculate price taking product-specific pre-applied discount into account
          const actualPrice = target.currentDiscount > 0 
            ? target.price * (1 - target.currentDiscount / 100) 
            : target.price;
          grossTotal += actualPrice * cart[id];
          receiptItems.push({ id: target.id, name: target.name, qty: cart[id], unitPrice: actualPrice });
        }
      }
    });

    if (!stockValid) {
      alert("Concurrency Race Blocked. Some items out of stock.");
      return;
    }

    const netTotal = grossTotal * (1 - discountRate);

    const pendingOrder = {
      id: Math.floor(Math.random() * 90000) + 10000,
      items: receiptItems,
      total: netTotal.toFixed(2),
      time: new Date().toLocaleTimeString(),
      status: "PENDING_APPROVAL",
    };

    setOrders([pendingOrder, ...orders]);
    saveCart({});
    setUserCouponInput("");
    setDiscountRate(0);
    setCouponApplied(false);
    alert(`Order dispatched to Administrative Core. Awaiting Admin verification code.`);
  };

  // Step 2: Admin Approves and Commits the Pipeline
  const handleAdminApprove = (orderId: number) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status !== "PENDING_APPROVAL") return;

    let allocationValid = true;
    const newProducts = [...products];

    // Deduct stock upon final approval step
    targetOrder.items.forEach((item: any) => {
      const productInStore = newProducts.find((p) => p.id === item.id);
      if (productInStore) {
        if (productInStore.stock < item.qty) {
          allocationValid = false;
        } else {
          productInStore.stock -= item.qty;
          productInStore.salesCount += item.qty;
        }
      }
    });

    if (!allocationValid) {
      alert("Cannot approve order. Inventory limits violated.");
      return;
    }

    // Update order status and metrics
    const updatedOrders = orders.map((o) => 
      o.id === orderId ? { ...o, status: "COMPLETED" } : o
    );

    const topProduct = [...newProducts].sort((a, b) => b.salesCount - a.salesCount)[0];

    setProducts(newProducts);
    setOrders(updatedOrders);
    setRevenue((prev) => prev + parseFloat(targetOrder.total));
    if (topProduct && topProduct.salesCount > 0) {
      setMostSelling(topProduct.name);
    }

    alert(`Transaction pipeline committed successfully for NODE-${orderId}.`);
  };

  const handleRestock = (productId: number) => {
    setProducts(products.map((p) => p.id === productId ? { ...p, stock: p.stock + 10 } : p));
  };

  const filteredProducts = products.filter((p) => {
    return p.name.toLowerCase().includes(search.toLowerCase()) && (category === "All" || p.category === category);
  });

  // Calculate Subtotal for customer delight feedback
  const getCartSubtotal = () => {
    return Object.keys(cart).reduce((total, idStr) => {
      const id = parseInt(idStr);
      const target = products.find((p) => p.id === id);
      if (!target) return total;
      const actualPrice = target.currentDiscount > 0 ? target.price * (1 - target.currentDiscount / 100) : target.price;
      return total + (actualPrice * cart[id]);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-[#0e1117] text-[#c9d1d9] p-6 font-sans">
      
      {/* Customer Delight Element 1: Top Dynamic Broadcast Bar */}
      {!isAdmin && (
        <div className="mb-4 bg-gradient-to-r from-blue-950 to-[#161b22] border border-blue-900/40 rounded-lg px-4 py-2 flex items-center justify-between text-xs text-blue-300 shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span><strong>Premium Flash Delivery Protocol:</strong> Active session qualifies for prioritized handling.</span>
          </div>
          <span className="text-[10px] font-mono bg-blue-900/40 px-2 py-0.5 rounded text-white border border-blue-800/30">Free Shipping $50+</span>
        </div>
      )}

      {/* Sleek Modern Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#21262d] pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-[11px] font-mono font-bold tracking-widest text-blue-400 uppercase">Core Inventory Console</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">GROCERY CORE / NODE</h1>
        </div>
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] font-medium text-xs px-4 py-2 rounded-lg tracking-wide transition shadow-sm"
        >
          {isAdmin ? "📂 Access Storefront Interface" : "📊 Initialize Administrative Console"}
        </button>
      </header>

      {!isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Space */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Interactive Embedded Abstract Element */}
            <div className="relative overflow-hidden bg-[#161b22] border border-[#21262d] rounded-xl p-5 flex justify-between items-center shadow-md">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white tracking-wide">Dynamic Operational Buffer</h2>
                <p className="text-[11px] text-[#8b949e] max-w-sm">Strict real-time structural assertions prevent race state manipulation during concurrent pipelines.</p>
              </div>
              <div className="w-20 h-20 opacity-40 hidden sm:block pointer-events-none">
                <iframe src='https://my.spline.design/glasscirclescopy-ca1775e114092497eb1dfda6bf5d1163/' frameBorder='0' width='100%' height='100%'></iframe>
              </div>
            </div>

            {/* Premium Industrial Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Query items database..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-[#161b22] border border-[#21262d] text-[#c9d1d9] rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-blue-500 placeholder-[#484f58] transition"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#161b22] border border-[#21262d] text-[#8b949e] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition"
              >
                <option value="All">All Categories</option>
                <option value="Grains & Pulses">Grains & Pulses</option>
                <option value="Dairy & Oils">Dairy & Oils</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
                <option value="Packaged Foods">Packaged Foods</option>
              </select>
            </div>

            {/* Upgraded Catalog Grid with Product-Specific Pre-applied Discounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const hasDiscount = p.currentDiscount > 0;
                const discountedPrice = hasDiscount ? (p.price * (1 - p.currentDiscount / 100)).toFixed(2) : p.price;

                return (
                  <div key={p.id} className="bg-[#161b22] border border-[#21262d] p-4 rounded-xl flex flex-col justify-between hover:border-[#30363d] transition shadow-sm group relative">
                    
                    {/* Discount Badge Display if applicable */}
                    {hasDiscount && (
                      <span className="absolute top-3 right-10 text-[9px] font-mono bg-green-950/80 text-green-400 px-2 py-0.5 rounded-full border border-green-800/40">
                        🔥-{p.currentDiscount}% SPECIAL
                      </span>
                    )}

                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono bg-[#21262d] text-[#8b949e] px-1.5 py-0.5 rounded border border-[#30363d]">{p.code}</span>
                        <span className="text-[10px] text-[#8b949e]">{p.visual}</span>
                      </div>
                      <h3 className="font-bold text-sm text-white mt-3 truncate">{p.name}</h3>
                      <p className="text-[11px] text-[#8b949e] mt-1">Scale: 1 {p.unit}</p>
                    </div>

                    <div className="mt-5 flex justify-between items-center border-t border-[#21262d] pt-3">
                      <div>
                        <p className="text-[9px] font-mono text-[#8b949e] uppercase tracking-wider">Price</p>
                        {hasDiscount ? (
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-black text-white">${discountedPrice}</p>
                            <p className="text-[10px] line-through text-[#484f58]">${p.price}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-black text-white">${p.price}</p>
                        )}
                      </div>
                      <div>
                        {p.stock > 0 ? (
                          <button
                            onClick={() => addToCart(p.id)}
                            className="bg-[#21262d] hover:bg-[#30363d] text-white text-[11px] font-medium px-3 py-1.5 rounded-md transition border border-[#30363d]"
                          >
                            Push ({p.stock})
                          </button>
                       ) : (
                          <span className="text-[10px] font-mono text-red-400 bg-red-950/20 px-2 py-1 rounded border border-red-900/30">Depleted</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allocation Cart Ledger */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 h-fit space-y-4 shadow-md">
            <h2 className="text-xs font-bold text-white tracking-widest font-mono uppercase flex items-center justify-between border-b border-[#21262d] pb-3">
              <span>Stack Allocation</span>
              <span className="text-[10px] bg-[#21262d] text-blue-400 px-2 py-0.5 rounded font-mono">{Object.keys(cart).length} Node(s)</span>
            </h2>

            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-12 text-[#484f58] border border-dashed border-[#21262d] rounded-xl bg-[#0e1117]/40">
                <p className="text-xs font-mono">Telemetry stack holds empty scope.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {Object.keys(cart).map((idStr) => {
                    const id = parseInt(idStr);
                    const product = products.find((p) => p.id === id);
                    if (!product) return null;
                    const calculatedPrice = product.currentDiscount > 0 ? product.price * (1 - product.currentDiscount / 100) : product.price;
                    return (
                      <div key={id} className="flex justify-between items-center bg-[#0e1117] border border-[#21262d] p-2.5 rounded-lg text-xs">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-white truncate">{product.name}</p>
                          <p className="text-[10px] text-green-400 font-mono">${calculatedPrice.toFixed(2)}</p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={product.stock}
                          value={cart[id]}
                          onChange={(e) => updateCartQty(id, parseInt(e.target.value) || 0)}
                          className="w-11 bg-[#161b22] border border-[#21262d] text-white text-center py-0.5 rounded text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Customer Delight Element 2: Progress Tracker towards target */}
                <div className="bg-[#0e1117] p-3 rounded-lg border border-[#21262d] space-y-1.5">
                  <div className="flex justify-between text-[10px] text-[#8b949e]">
                    <span>Shipping Optimization Matrix</span>
                    <span className="text-white font-mono">${getCartSubtotal().toFixed(2)} / $50.00</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (getCartSubtotal() / 50) * 100)}%` }}
                    ></div>
                  </div>
                  {getCartSubtotal() >= 50 ? (
                    <p className="text-[9px] text-green-400 font-mono">✓ Free shipping route unlocked.</p>
                  ) : (
                    <p className="text-[9px] text-[#8b949e] font-mono">Add ${(50 - getCartSubtotal()).toFixed(2)} more for complimentary route delivery.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#21262d] flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={userCouponInput}
                    onChange={(e) => setUserCouponInput(e.target.value)}
                    disabled={couponApplied}
                    className="flex-1 bg-[#0e1117] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#c9d1d9] focus:outline-none placeholder-[#484f58]"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={couponApplied}
                    className="bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 text-xs px-3 rounded-lg border border-[#30363d] transition font-medium text-white"
                  >
                    Apply
                  </button>
                </div>

                <button
                  onClick={handleCheckoutRequest}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-lg transition tracking-wide shadow-sm"
                >
                  Confirm Structural Pipeline
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Administrative Ledger Panel */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#161b22] border border-[#21262d] p-4 rounded-xl shadow-sm">
              <p className="text-[9px] font-mono text-[#8b949e] uppercase tracking-widest">Aggregated Pipeline Profit</p>
              <p className="text-xl font-black text-white mt-1">${revenue.toFixed(2)}</p>
            </div>
            <div className="bg-[#161b22] border border-[#21262d] p-4 rounded-xl shadow-sm">
              <p className="text-[9px] font-mono text-[#8b949e] uppercase tracking-widest">Invoices Captured</p>
              <p className="text-xl font-black text-white mt-1">{orders.filter(o => o.status === "COMPLETED").length}</p>
            </div>
            <div className="bg-[#161b22] border border-[#21262d] p-4 rounded-xl shadow-sm">
              <p className="text-[9px] font-mono text-[#8b949e] uppercase tracking-widest">Maximum Sales Velocity</p>
              <p className="text-xs font-bold text-blue-400 mt-2 truncate">{mostSelling}</p>
            </div>
            <div className="bg-[#161b22] border border-[#21262d] p-4 rounded-xl shadow-sm">
              <p className="text-[9px] font-mono text-[#8b949e] uppercase tracking-widest">Awaiting Verification Queue</p>
              <p className="text-xl font-black text-amber-400 mt-1">{orders.filter(o => o.status === "PENDING_APPROVAL").length}</p>
            </div>
          </div>

          {/* Dynamic Coupon Configuration Box (For Admin) */}
          <div className="bg-[#161b22] border border-blue-900/50 rounded-xl p-5 shadow-sm max-w-xl">
            <h3 className="font-bold text-xs text-blue-400 font-mono uppercase tracking-widest mb-3">🛠 nighttime Campaign & Coupon Configuration</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-mono text-[#8b949e] mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={adminCouponCode}
                  onChange={(e) => setAdminCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#0e1117] border border-[#21262d] text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:w-1/3">
                <label className="block text-[10px] uppercase font-mono text-[#8b949e] mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={adminDiscountValue}
                  onChange={(e) => setAdminDiscountValue(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-[#0e1117] border border-[#21262d] text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Synchronized Live Logger Stream - Now handles the Approval Pipeline flow! */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-[10px] text-[#8b949e] font-mono uppercase tracking-widest mb-4">Runtime Telemetry Streams (Orders Management)</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-[#484f58] text-xs font-mono">Awaiting stream packets from endpoint connections...</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {orders.map((o) => (
                    <div key={o.id} className={`border p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs font-mono ${o.status === "PENDING_APPROVAL" ? "bg-amber-950/20 border-amber-900/40" : "bg-[#0e1117] border-[#21262d]"}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-blue-400 font-bold">NODE-{o.id}</p>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded ${o.status === "PENDING_APPROVAL" ? "bg-amber-900/50 text-amber-300" : "bg-green-900/40 text-green-400"}`}>
                            {o.status === "PENDING_APPROVAL" ? "AWAITING ADMIN DONE" : "COMPLETED"}
                          </span>
                        </div>
                        <p className="text-[#8b949e] text-[10px] mt-1 truncate max-w-xs">{o.items.map((i: any) => `${i.name} (x${i.qty})`).join(", ")}</p>
                      </div>
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1">
                        <p className="text-white font-bold">${o.total}</p>
                        {o.status === "PENDING_APPROVAL" ? (
                          <button
                            onClick={() => handleAdminApprove(o.id)}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-sans font-semibold text-[10px] px-2.5 py-1 rounded tracking-wide transition shadow-sm mt-1"
                          >
                            ✓ APPROVE TRANSACTION
                          </button>
                        ) : (
                          <span className="text-[9px] text-[#484f58] block">{o.time}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Control Node Framework */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 shadow-sm h-fit">
              <h3 className="font-bold text-[10px] text-[#8b949e] font-mono uppercase tracking-widest mb-3">Inventory Optimization Hooks</h3>
              <div className="space-y-2.5">
                {products.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs border-b border-[#21262d] pb-2.5">
                    <div>
                      <span className="font-bold text-white text-xs block">{p.name}</span>
                      <span className="text-[#8b949e] font-mono text-[9px]">Capacity remaining: {p.stock} metrics</span>
                    </div>
                    <button
                      onClick={() => handleRestock(p.id)}
                      className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] font-mono text-[9px] font-bold px-2 py-1 rounded transition"
                    >
                      + DISPATCH REFILL
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}