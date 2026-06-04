import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, 
  Receipt, X, Search, Package, BarChart3, Users, Settings, 
  ChevronRight, Printer, QrCode, Smartphone, Check, AlertCircle,
  ArrowLeft, Save, Edit3, Tag, TrendingUp, Clock, Calendar,
  DollarSign, Percent, Grid, List, Filter, Download, Upload,
  Moon, Sun, LogOut, Lock, Unlock, History, RotateCcw, Send,
  User, Shield, Bell, FileText, Eye, EyeOff, Trash, ArrowUpDown,
  ChevronDown, ChevronUp, Store, Zap, Award, Star
} from 'lucide-react';

// ============================================
// TYPES & INTERFACES
// ============================================
interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
  image?: string;
  taxRate: number;
  description?: string;
  sku: string;
}

interface CartItem extends Product {
  quantity: number;
  discount: number;
  total: number;
}

interface Payment {
  method: 'cash' | 'card' | 'digital';
  amount: number;
  reference?: string;
}

interface Order {
  id: string;
  items: CartItem[];
  payments: Payment[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  change: number;
  timestamp: string;
  cashier: string;
  status: 'completed' | 'refunded' | 'pending';
  customer?: string;
  notes?: string;
}

interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
  pin: string;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

// ============================================
// MOCK DATA
// ============================================
const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Products', color: '#10b981', icon: 'grid' },
  { id: 'beverages', name: 'Beverages', color: '#3b82f6', icon: 'cup' },
  { id: 'snacks', name: 'Snacks', color: '#f59e0b', icon: 'cookie' },
  { id: 'dairy', name: 'Dairy', color: '#8b5cf6', icon: 'milk' },
  { id: 'produce', name: 'Produce', color: '#22c55e', icon: 'apple' },
  { id: 'frozen', name: 'Frozen', color: '#06b6d4', icon: 'snowflake' },
  { id: 'household', name: 'Household', color: '#ef4444', icon: 'home' },
  { id: 'personal', name: 'Personal Care', color: '#ec4899', icon: 'heart' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', barcode: '123456789012', name: 'Organic Matcha Latte', price: 5.99, cost: 3.50, category: 'beverages', stock: 45, taxRate: 0.08, sku: 'BEV-001', description: 'Premium ceremonial grade matcha with oat milk' },
  { id: '2', barcode: '123456789013', name: 'Sparkling Water', price: 2.49, cost: 1.20, category: 'beverages', stock: 120, taxRate: 0.08, sku: 'BEV-002', description: 'Natural mineral water with lime' },
  { id: '3', barcode: '123456789014', name: 'Cold Brew Coffee', price: 4.99, cost: 2.80, category: 'beverages', stock: 30, taxRate: 0.08, sku: 'BEV-003', description: '24-hour steeped cold brew, smooth taste' },
  { id: '4', barcode: '123456789015', name: 'Artisan Kombucha', price: 3.99, cost: 2.00, category: 'beverages', stock: 25, taxRate: 0.08, sku: 'BEV-004', description: 'Ginger turmeric fermented tea' },
  { id: '5', barcode: '123456789016', name: 'Premium Green Tea', price: 6.99, cost: 4.00, category: 'beverages', stock: 18, taxRate: 0.08, sku: 'BEV-005', description: 'Sencha green tea from Japan' },
  { id: '6', barcode: '123456789017', name: 'Gourmet Popcorn', price: 3.49, cost: 1.50, category: 'snacks', stock: 60, taxRate: 0.08, sku: 'SNK-001', description: 'Truffle parmesan flavor' },
  { id: '7', barcode: '123456789018', name: 'Dark Chocolate Bar', price: 4.99, cost: 2.50, category: 'snacks', stock: 40, taxRate: 0.08, sku: 'SNK-002', description: '85% cacao single origin' },
  { id: '8', barcode: '123456789019', name: 'Mixed Nuts', price: 7.99, cost: 4.50, category: 'snacks', stock: 35, taxRate: 0.08, sku: 'SNK-003', description: 'Almonds, cashews, walnuts, pistachios' },
  { id: '9', barcode: '123456789020', name: 'Protein Chips', price: 3.99, cost: 1.80, category: 'snacks', stock: 50, taxRate: 0.08, sku: 'SNK-004', description: 'Sea salt flavor, 20g protein' },
  { id: '10', barcode: '123456789021', name: 'Organic Almond Milk', price: 4.49, cost: 2.50, category: 'dairy', stock: 28, taxRate: 0.08, sku: 'DAI-001', description: 'Unsweetened, 1L carton' },
  { id: '11', barcode: '123456789022', name: 'Greek Yogurt', price: 2.99, cost: 1.50, category: 'dairy', stock: 42, taxRate: 0.08, sku: 'DAI-002', description: 'Plain, high protein, 500g' },
  { id: '12', barcode: '123456789023', name: 'Aged Cheddar', price: 8.99, cost: 5.00, category: 'dairy', stock: 15, taxRate: 0.08, sku: 'DAI-003', description: '18-month aged, sharp flavor' },
  { id: '13', barcode: '123456789024', name: 'Fresh Avocados', price: 1.99, cost: 0.80, category: 'produce', stock: 55, taxRate: 0.00, sku: 'PRO-001', description: 'Hass avocados, ripe and ready' },
  { id: '14', barcode: '123456789025', name: 'Organic Bananas', price: 0.99, cost: 0.40, category: 'produce', stock: 80, taxRate: 0.00, sku: 'PRO-002', description: 'Bunch of 6, organic certified' },
  { id: '15', barcode: '123456789026', name: 'Baby Spinach', price: 3.99, cost: 2.00, category: 'produce', stock: 22, taxRate: 0.00, sku: 'PRO-003', description: 'Pre-washed, 5oz container' },
  { id: '16', barcode: '123456789027', name: 'Frozen Pizza', price: 8.99, cost: 5.00, category: 'frozen', stock: 20, taxRate: 0.08, sku: 'FRZ-001', description: 'Margherita, wood-fired style' },
  { id: '17', barcode: '123456789028', name: 'Ice Cream', price: 6.99, cost: 3.50, category: 'frozen', stock: 16, taxRate: 0.08, sku: 'FRZ-002', description: 'Vanilla bean, premium quality' },
  { id: '18', barcode: '123456789029', name: 'Frozen Berries', price: 5.99, cost: 3.00, category: 'frozen', stock: 24, taxRate: 0.08, sku: 'FRZ-003', description: 'Mixed berries, 1kg bag' },
  { id: '19', barcode: '123456789030', name: 'Dish Soap', price: 3.99, cost: 2.00, category: 'household', stock: 40, taxRate: 0.08, sku: 'HOU-001', description: 'Lemon scent, eco-friendly' },
  { id: '20', barcode: '123456789031', name: 'Paper Towels', price: 5.99, cost: 3.50, category: 'household', stock: 30, taxRate: 0.08, sku: 'HOU-002', description: '6-pack, ultra absorbent' },
  { id: '21', barcode: '123456789032', name: 'Laundry Detergent', price: 12.99, cost: 8.00, category: 'household', stock: 18, taxRate: 0.08, sku: 'HOU-003', description: 'HE formula, 100 loads' },
  { id: '22', barcode: '123456789033', name: 'Shampoo', price: 7.99, cost: 4.50, category: 'personal', stock: 25, taxRate: 0.08, sku: 'PER-001', description: 'Sulfate-free, argan oil' },
  { id: '23', barcode: '123456789034', name: 'Face Moisturizer', price: 15.99, cost: 10.00, category: 'personal', stock: 12, taxRate: 0.08, sku: 'PER-002', description: 'SPF 30, daily protection' },
  { id: '24', barcode: '123456789035', name: 'Toothpaste', price: 4.99, cost: 2.50, category: 'personal', stock: 38, taxRate: 0.08, sku: 'PER-003', description: 'Whitening formula, 150ml' },
];

const USERS: User[] = [
  { id: '1', name: 'Admin User', role: 'admin', pin: '0000', active: true },
  { id: '2', name: 'Manager One', role: 'manager', pin: '1111', active: true },
  { id: '3', name: 'Cashier Jane', role: 'cashier', pin: '2222', active: true },
  { id: '4', name: 'Cashier Mike', role: 'cashier', pin: '3333', active: true },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};
const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function POSApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'orders' | 'reports' | 'settings'>('pos');
  const [darkMode, setDarkMode] = useState(true);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pos_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [holdOrders, setHoldOrders] = useState<{ id: string; cart: CartItem[]; timestamp: string; name: string }[]>(() => {
    const saved = localStorage.getItem('pos_hold_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHoldOrders, setShowHoldOrders] = useState(false);
  const [quickDiscount, setQuickDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pos_hold_orders', JSON.stringify(holdOrders));
  }, [holdOrders]);

  // Notification helper
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cart.reduce((sum, item) => sum + (item.price * item.quantity * item.taxRate), 0);
  const cartDiscount = cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.discount / 100)), 0) + (cartSubtotal * (quickDiscount / 100));
  const cartTotal = cartSubtotal + cartTax - cartDiscount;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showNotification('Out of stock!');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showNotification('Max stock reached!');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price * (1 - item.discount / 100) } : item);
      }
      return [...prev, { ...product, quantity: 1, discount: 0, total: product.price }];
    });
    showNotification(`Added ${product.name}`);
  };

  // Update cart quantity
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        const product = products.find(p => p.id === id);
        if (product && newQty > product.stock) {
          showNotification('Not enough stock!');
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.price * (1 - item.discount / 100) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Remove from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Apply item discount
  const applyItemDiscount = (id: string, discount: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, discount, total: item.quantity * item.price * (1 - discount / 100) } : item));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setQuickDiscount(0);
    setCustomerName('');
    setOrderNotes('');
  };

  // Hold order
  const holdOrder = () => {
    if (cart.length === 0) return;
    const holdOrder = { id: generateId(), cart: [...cart], timestamp: new Date().toISOString(), name: customerName || `Order #${holdOrders.length + 1}` };
    setHoldOrders(prev => [...prev, holdOrder]);
    clearCart();
    showNotification('Order held successfully');
  };

  // Recall hold order
  const recallHoldOrder = (holdId: string) => {
    const hold = holdOrders.find(h => h.id === holdId);
    if (hold) {
      setCart(hold.cart);
      setCustomerName(hold.name);
      setHoldOrders(prev => prev.filter(h => h.id !== holdId));
      setShowHoldOrders(false);
      showNotification('Order recalled');
    }
  };

  // Complete order
  const completeOrder = (payments: Payment[]) => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const order: Order = {
      id: generateId(),
      items: [...cart],
      payments,
      subtotal: cartSubtotal,
      tax: cartTax,
      discount: cartDiscount,
      total: cartTotal,
      change: totalPaid - cartTotal,
      timestamp: new Date().toISOString(),
      cashier: currentUser?.name || 'Unknown',
      status: 'completed',
      customer: customerName || undefined,
      notes: orderNotes || undefined,
    };

    // Update stock
    setProducts(prev => prev.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: Math.max(0, product.stock - cartItem.quantity) };
      }
      return product;
    }));

    setOrders(prev => [order, ...prev]);
    setLastOrder(order);
    setShowPayment(false);
    setShowReceipt(true);
    clearCart();
    showNotification('Order completed!');
  };

  // Refund order
  const refundOrder = (orderId: string) => {
    const orderToRefund = orders.find(o => o.id === orderId);
    if (orderToRefund) {
      // Restore stock
      orderToRefund.items.forEach(item => {
        setProducts(prev => prev.map(product => product.id === item.id ? { ...product, stock: product.stock + item.quantity } : product));
      });
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'refunded' as const } : order));
      showNotification('Order refunded');
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.barcode.includes(searchQuery) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold);

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setShowScanner(false);
      setShowBarcodeInput(false);
      setBarcodeInput('');
    } else {
      showNotification('Product not found!');
    }
  };

  // Login screen
  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border-b sticky top-0 z-40`}>
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">MartPOS</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Premium Point of Sale</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {[
              { id: 'pos', label: 'POS', icon: ShoppingCart },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: Receipt },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500/10 text-emerald-500 shadow-sm' 
                    : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-tight">{currentUser.name}</p>
                <p className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-red-50 hover:text-red-500'} transition-colors`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-4">
        {activeTab === 'pos' && (
          <POSTerminal
            darkMode={darkMode}
            products={filteredProducts}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cart={cart}
            addToCart={addToCart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            applyItemDiscount={applyItemDiscount}
            clearCart={clearCart}
            holdOrder={holdOrder}
            recallHoldOrder={recallHoldOrder}
            holdOrders={holdOrders}
            showHoldOrders={showHoldOrders}
            setShowHoldOrders={setShowHoldOrders}
            cartSubtotal={cartSubtotal}
            cartTax={cartTax}
            cartDiscount={cartDiscount}
            cartTotal={cartTotal}
            itemCount={itemCount}
            quickDiscount={quickDiscount}
            setQuickDiscount={setQuickDiscount}
            customerName={customerName}
            setCustomerName={setCustomerName}
            orderNotes={orderNotes}
            setOrderNotes={setOrderNotes}
            showScanner={showScanner}
            setShowScanner={setShowScanner}
            showPayment={showPayment}
            setShowPayment={setShowPayment}
            completeOrder={completeOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onBarcodeScan={handleBarcodeScan}
            lowStockProducts={lowStockProducts}
            showBarcodeInput={showBarcodeInput}
            setShowBarcodeInput={setShowBarcodeInput}
            barcodeInput={barcodeInput}
            setBarcodeInput={setBarcodeInput}
          />
        )}

        {activeTab === 'products' && (
          <ProductsManager
            darkMode={darkMode}
            products={products}
            setProducts={setProducts}
            categories={CATEGORIES}
            lowStockThreshold={lowStockThreshold}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersManager
            darkMode={darkMode}
            orders={orders}
            refundOrder={refundOrder}
            products={products}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsDashboard
            darkMode={darkMode}
            orders={orders}
            products={products}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            darkMode={darkMode}
            currentUser={currentUser}
            users={USERS}
            lowStockThreshold={lowStockThreshold}
            setLowStockThreshold={setLowStockThreshold}
          />
        )}
      </main>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastOrder && (
          <ReceiptModal
            order={lastOrder}
            onClose={() => setShowReceipt(false)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


// ============================================
// LOGIN SCREEN
// ============================================
function LoginScreen({ onLogin, darkMode }: { onLogin: (user: User) => void; darkMode: boolean }) {
  const [pin, setPin] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  const handlePinSubmit = () => {
    if (selectedUser && pin === selectedUser.pin) {
      onLogin(selectedUser);
    } else {
      setError('Invalid PIN');
      setPin('');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'clear') {
      setPin('');
      setError('');
    } else if (key === 'enter') {
      handlePinSubmit();
    } else if (pin.length < 4) {
      setPin(prev => prev + key);
      setError('');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-2xl`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">MartPOS</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select user and enter PIN</p>
        </div>

        {!selectedUser ? (
          <div className="grid grid-cols-2 gap-3">
            {USERS.filter(u => u.active).map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                  darkMode 
                    ? 'border-gray-800 hover:border-emerald-500/50 bg-gray-800/50' 
                    : 'border-gray-200 hover:border-emerald-500/50 bg-gray-50'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg font-bold text-white mx-auto mb-2">
                  {user.name.charAt(0)}
                </div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.role}</p>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-gray-800/50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-xs text-gray-400 capitalize">{selectedUser.role}</p>
              </div>
              <button onClick={() => { setSelectedUser(null); setPin(''); }} className="ml-auto text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length ? 'bg-emerald-500 scale-110' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
              ))}
            </div>

            {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'enter'].map(key => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`h-14 rounded-xl font-semibold text-lg transition-all active:scale-95 ${
                    key === 'enter' 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 col-start-3' 
                      : key === 'clear'
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : darkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {key === 'enter' ? <Check className="w-6 h-6 mx-auto" /> : 
                   key === 'clear' ? <X className="w-5 h-5 mx-auto" /> : key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// POS TERMINAL
// ============================================
function POSTerminal({
  darkMode, products, categories, selectedCategory, setSelectedCategory,
  searchQuery, setSearchQuery, cart, addToCart, updateQuantity, removeFromCart,
  applyItemDiscount, clearCart, holdOrder, recallHoldOrder, holdOrders,
  showHoldOrders, setShowHoldOrders, cartSubtotal, cartTax, cartDiscount,
  cartTotal, itemCount, quickDiscount, setQuickDiscount, customerName,
  setCustomerName, orderNotes, setOrderNotes, showScanner, setShowScanner,
  showPayment, setShowPayment, completeOrder, viewMode, setViewMode,
  onBarcodeScan, lowStockProducts, showBarcodeInput, setShowBarcodeInput,
  barcodeInput, setBarcodeInput
}: any) {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState(0);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showBarcodeInput && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [showBarcodeInput]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)]">
      {/* Products Panel */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Search & Filters */}
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, barcode, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 focus:border-emerald-500 text-white placeholder-gray-500' 
                    : 'bg-gray-50 border-gray-200 focus:border-emerald-500 text-gray-900 placeholder-gray-400'
                } border`}
              />
            </div>
            <button
              onClick={() => setShowBarcodeInput(!showBarcodeInput)}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all active:scale-95"
            >
              <Scan className="w-5 h-5" />
              <span className="hidden sm:inline">Scan</span>
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-500/10 text-emerald-500' : darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-emerald-500/10 text-emerald-500' : darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barcode Input */}
          <AnimatePresence>
            {showBarcodeInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mt-3">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="Enter barcode and press Enter..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && barcodeInput) {
                        onBarcodeScan(barcodeInput);
                        setBarcodeInput('');
                      }
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    } border`}
                  />
                  <button
                    onClick={() => {
                      if (barcodeInput) {
                        onBarcodeScan(barcodeInput);
                        setBarcodeInput('');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowBarcodeInput(false)}
                    className={`px-3 py-2 rounded-xl ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Categories */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'text-white shadow-lg'
                    : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color, boxShadow: `0 4px 20px ${cat.color}40` } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className={`flex-1 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm overflow-hidden`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {products.length} products found
            </p>
            {lowStockProducts.length > 0 && (
              <div className="flex items-center gap-2 text-amber-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {lowStockProducts.length} low stock
              </div>
            )}
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map((product: Product) => (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className={`relative p-4 rounded-2xl text-left transition-all ${
                      darkMode 
                        ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                    } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 10 && product.stock > 0 && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                    <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-2xl font-bold`}
                      style={{ backgroundColor: categories.find((c: Category) => c.id === product.category)?.color + '20', 
                               color: categories.find((c: Category) => c.id === product.category)?.color }}>
                      {product.name.charAt(0)}
                    </div>
                    <p className="font-medium text-sm leading-tight mb-1 line-clamp-2">{product.name}</p>
                    <p className="text-emerald-500 font-bold">{formatCurrency(product.price)}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Stock: {product.stock}
                    </p>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product: Product) => (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => addToCart(product)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                      darkMode 
                        ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={product.stock <= 0}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: categories.find((c: Category) => c.id === product.category)?.color + '20', 
                               color: categories.find((c: Category) => c.id === product.category)?.color }}>
                      {product.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{product.sku} • {product.barcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">{formatCurrency(product.price)}</p>
                      <p className={`text-xs ${product.stock <= 10 ? 'text-amber-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {product.stock} in stock
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className={`flex-1 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm flex flex-col overflow-hidden`}>
          {/* Cart Header */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-500" />
                Current Order
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowHoldOrders(true)}
                  className={`p-2 rounded-lg text-sm transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Hold Orders"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={holdOrder}
                  disabled={cart.length === 0}
                  className={`p-2 rounded-lg text-sm transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30`}
                  title="Hold Order"
                >
                  <Lock className="w-4 h-4" />
                </button>
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className={`p-2 rounded-lg text-sm transition-all ${darkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'} disabled:opacity-30`}
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              } border`}
            />
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cart is empty</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>Scan or click products to add</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map((item: CartItem) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700/50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatCurrency(item.price)} each
                          {item.discount > 0 && <span className="text-amber-500 ml-1">(-{item.discount}%)</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.total)}</p>
                        <button
                          onClick={() => { setSelectedItemForDiscount(item.id); setDiscountValue(item.discount); setShowDiscountModal(true); }}
                          className={`text-xs flex items-center gap-1 mt-1 ${darkMode ? 'text-gray-500 hover:text-emerald-400' : 'text-gray-400 hover:text-emerald-500'}`}
                        >
                          <Tag className="w-3 h-3" />
                          Discount
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Cart Summary */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} space-y-2`}>
            <div className="flex justify-between text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Items</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
              <span className="font-medium">{formatCurrency(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Tax</span>
              <span className="font-medium">{formatCurrency(cartTax)}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-sm text-amber-500">
                <span>Discount</span>
                <span className="font-medium">-{formatCurrency(cartDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-700">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-emerald-500">{formatCurrency(cartTotal)}</span>
            </div>

            {/* Quick Discount */}
            {cart.length > 0 && (
              <div className="flex gap-2 pt-2">
                {[5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setQuickDiscount(quickDiscount === pct ? 0 : pct)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      quickDiscount === pct
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pay {formatCurrency(cartTotal)}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            total={cartTotal}
            onClose={() => setShowPayment(false)}
            onComplete={completeOrder}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Discount Modal */}
      <AnimatePresence>
        {showDiscountModal && selectedItemForDiscount && (
          <DiscountModal
            value={discountValue}
            onChange={setDiscountValue}
            onApply={() => { applyItemDiscount(selectedItemForDiscount, discountValue); setShowDiscountModal(false); }}
            onClose={() => setShowDiscountModal(false)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Hold Orders Modal */}
      <AnimatePresence>
        {showHoldOrders && (
          <HoldOrdersModal
            holdOrders={holdOrders}
            onRecall={recallHoldOrder}
            onClose={() => setShowHoldOrders(false)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


// ============================================
// PAYMENT MODAL
// ============================================
function PaymentModal({ total, onClose, onComplete, darkMode }: { total: number; onClose: () => void; onComplete: (payments: Payment[]) => void; darkMode: boolean }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMethod, setCurrentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);

  const addPayment = () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return;
    setPayments(prev => [...prev, { method: currentMethod, amount: amt, reference: reference || undefined }]);
    setAmount('');
    setReference('');
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const quickAmounts = [5, 10, 20, 50, 100];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-lg rounded-3xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
      >
        <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            Payment
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Total Display */}
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Amount</p>
            <p className="text-3xl font-bold text-emerald-500">{formatCurrency(total)}</p>
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                Paid: <span className="font-medium text-white">{formatCurrency(totalPaid)}</span>
              </span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {remaining > 0 ? `Remaining: ${formatCurrency(remaining)}` : `Change: ${formatCurrency(change)}`}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'digital', label: 'Digital', icon: Smartphone },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setCurrentMethod(method.id as any)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  currentMethod === method.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : darkMode ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <method.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{method.label}</span>
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPayment()}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-lg font-bold outline-none ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  } border`}
                />
              </div>
              <button
                onClick={addPayment}
                disabled={!amount || parseFloat(amount) <= 0}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Amounts */}
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  ${amt}
                </button>
              ))}
              <button
                onClick={() => setAmount(remaining.toFixed(2))}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all"
              >
                Exact
              </button>
            </div>
          </div>

          {/* Reference (for card/digital) */}
          {(currentMethod === 'card' || currentMethod === 'digital') && (
            <input
              type="text"
              placeholder="Reference number (optional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              } border`}
            />
          )}

          {/* Payment List */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Payments:</p>
              {payments.map((payment, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    {payment.method === 'cash' && <Banknote className="w-4 h-4 text-emerald-500" />}
                    {payment.method === 'card' && <CreditCard className="w-4 h-4 text-blue-500" />}
                    {payment.method === 'digital' && <Smartphone className="w-4 h-4 text-purple-500" />}
                    <span className="text-sm font-medium capitalize">{payment.method}</span>
                    {payment.reference && <span className="text-xs text-gray-500">({payment.reference})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCurrency(payment.amount)}</span>
                    <button onClick={() => removePayment(index)} className="text-red-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Complete Button */}
          <button
            onClick={() => {
              if (totalPaid >= total) {
                onComplete(payments);
              }
            }}
            disabled={totalPaid < total}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {totalPaid >= total ? 'Complete Payment' : `Add ${formatCurrency(remaining)} more`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// DISCOUNT MODAL
// ============================================
function DiscountModal({ value, onChange, onApply, onClose, darkMode }: { value: number; onChange: (v: number) => void; onApply: () => void; onClose: () => void; darkMode: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-sm rounded-3xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-2xl p-6`}
      >
        <h3 className="font-bold text-lg mb-4">Apply Discount</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Discount Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={value}
              onChange={(e) => onChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              className={`w-full px-4 py-3 rounded-xl text-2xl font-bold text-center outline-none ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              } border`}
            />
          </div>
          <div className="flex gap-2">
            {[5, 10, 15, 20, 25, 50].map(pct => (
              <button
                key={pct}
                onClick={() => onChange(pct)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  value === pct ? 'bg-emerald-500 text-white' : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              Cancel
            </button>
            <button onClick={onApply} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all">
              Apply
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// HOLD ORDERS MODAL
// ============================================
function HoldOrdersModal({ holdOrders, onRecall, onClose, darkMode }: { holdOrders: any[]; onRecall: (id: string) => void; onClose: () => void; darkMode: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-lg rounded-3xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-2xl overflow-hidden`}
      >
        <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-500" />
            Held Orders ({holdOrders.length})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {holdOrders.length === 0 ? (
            <div className="text-center py-8">
              <Lock className={`w-10 h-10 mx-auto mb-2 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No held orders</p>
            </div>
          ) : (
            holdOrders.map((hold) => (
              <div key={hold.id} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{hold.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatDate(hold.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => onRecall(hold.id)}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg text-sm font-medium transition-all"
                  >
                    <Unlock className="w-4 h-4 inline mr-1" />
                    Recall
                  </button>
                </div>
                <div className="space-y-1">
                  {hold.cart.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{item.quantity}x {item.name}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700/50 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-emerald-500">
                    {formatCurrency(hold.cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0))}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// RECEIPT MODAL
// ============================================
function ReceiptModal({ order, onClose, darkMode }: { order: Order; onClose: () => void; darkMode: boolean }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const printReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Receipt ${order.id}</title></head>
            <body style="font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto;">
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md rounded-3xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
      >
        <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            Receipt
          </h2>
          <div className="flex gap-2">
            <button onClick={printReceipt} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={receiptRef} className="p-6 space-y-4">
          <div className="text-center border-b-2 border-dashed border-gray-700 pb-4">
            <h3 className="font-bold text-xl mb-1">MartPOS</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Premium Point of Sale</p>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatDate(order.timestamp)}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Order #{order.id}</p>
            {order.customer && <p className="text-sm font-medium mt-1">Customer: {order.customer}</p>}
          </div>

          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                  {item.discount > 0 && <span className="text-amber-500 text-xs"> (-{item.discount}%)</span>}
                </div>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>

          <div className={`border-t-2 border-dashed border-gray-700 pt-4 space-y-2`}>
            <div className="flex justify-between text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-amber-500">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700">
              <span>Total</span>
              <span className="text-emerald-500">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {order.payments.map((payment, index) => (
              <div key={index} className="flex justify-between">
                <span className="capitalize">{payment.method}</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
            {order.change > 0 && (
              <div className="flex justify-between font-medium text-emerald-500">
                <span>Change</span>
                <span>{formatCurrency(order.change)}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-4 border-t-2 border-dashed border-gray-700">
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cashier: {order.cashier}</p>
            <p className="text-xs mt-2">Thank you for shopping with us!</p>
            <QrCode className={`w-16 h-16 mx-auto mt-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all"
          >
            Close & New Order
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ============================================
// PRODUCTS MANAGER
// ============================================
function ProductsManager({ darkMode, products, setProducts, categories, lowStockThreshold }: any) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredProducts = products
    .filter((p: Product) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: Product, b: Product) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts((prev: Product[]) => prev.map(p => p.id === product.id ? product : p));
      setEditingProduct(null);
    } else {
      setProducts((prev: Product[]) => [...prev, { ...product, id: generateId() }]);
    }
    setShowAddModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev: Product[]) => prev.filter(p => p.id !== id));
    }
  };

  const exportProducts = () => {
    const csv = [
      ['ID', 'Barcode', 'SKU', 'Name', 'Category', 'Price', 'Cost', 'Stock', 'Tax Rate', 'Description'].join(','),
      ...products.map(p => [p.id, p.barcode, p.sku, `"${p.name}"`, p.category, p.price, p.cost, p.stock, p.taxRate, `"${p.description || ''}"`].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm`}>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              } border`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
            <button
              onClick={exportProducts}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => { setEditingProduct(null); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Product</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">SKU / Barcode</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 cursor-pointer" onClick={() => setSortBy('price')}>
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 cursor-pointer" onClick={() => setSortBy('stock')}>
                  Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Category</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product: Product) => (
                <tr key={product.id} className={`border-b ${darkMode ? 'border-gray-800/50 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                        style={{ backgroundColor: categories.find((c: Category) => c.id === product.category)?.color + '20',
                                 color: categories.find((c: Category) => c.id === product.category)?.color }}>
                        {product.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-mono">{product.sku}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{product.barcode}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-emerald-500">{formatCurrency(product.price)}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cost: {formatCurrency(product.cost)}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      product.stock <= lowStockThreshold
                        ? 'bg-amber-500/10 text-amber-500'
                        : product.stock <= 0
                        ? 'bg-red-500/10 text-red-500'
                        : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ backgroundColor: categories.find((c: Category) => c.id === product.category)?.color + '20',
                               color: categories.find((c: Category) => c.id === product.category)?.color }}>
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditingProduct(product); setShowAddModal(true); }}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'} transition-colors`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onSave={handleSaveProduct}
            onClose={() => { setShowAddModal(false); setEditingProduct(null); }}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// PRODUCT MODAL
// ============================================
function ProductModal({ product, categories, onSave, onClose, darkMode }: any) {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: '',
      barcode: '',
      name: '',
      price: 0,
      cost: 0,
      category: 'beverages',
      stock: 0,
      taxRate: 0.08,
      sku: '',
      description: '',
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-lg rounded-3xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
      >
        <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
          <h2 className="font-bold text-lg">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
              >
                {categories.filter((c: Category) => c.id !== 'all').map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// ORDERS MANAGER
// ============================================
function OrdersManager({ darkMode, orders, refundOrder, products }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'refunded'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.customer && order.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         order.cashier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportOrders = () => {
    const csv = [
      ['Order ID', 'Date', 'Customer', 'Cashier', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Status'].join(','),
      ...orders.map((o: Order) => [
        o.id, formatDate(o.timestamp), o.customer || 'Walk-in', o.cashier, o.items.length,
        o.subtotal, o.tax, o.discount, o.total, o.status
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm`}>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              } border`}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`px-3 py-2 rounded-xl text-sm outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'} border`}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              onClick={exportOrders}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Order</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Items</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Total</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: Order) => (
                <tr key={order.id} className={`border-b ${darkMode ? 'border-gray-800/50 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <td className="p-4">
                    <p className="font-medium text-sm font-mono">#{order.id}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{order.cashier}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{formatDateShort(order.timestamp)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{order.customer || 'Walk-in'}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{order.items.length} items</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} qty
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <p className="font-bold text-emerald-500">{formatCurrency(order.total)}</p>
                    {order.discount > 0 && <p className="text-xs text-amber-500">Saved {formatCurrency(order.discount)}</p>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                      order.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : order.status === 'refunded'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {order.status === 'completed' && (
                        <button
                          onClick={() => refundOrder(order.id)}
                          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'} transition-colors`}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-lg rounded-3xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
            >
              <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
                <h2 className="font-bold text-lg">Order Details #{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.timestamp)}</p>
                    </div>
                    <div>
                      <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cashier</p>
                      <p className="font-medium">{selectedOrder.cashier}</p>
                    </div>
                    <div>
                      <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Customer</p>
                      <p className="font-medium">{selectedOrder.customer || 'Walk-in'}</p>
                    </div>
                    <div>
                      <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Status</p>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                        selectedOrder.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className={`flex justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                        <div>
                          <p className="text-sm font-medium">{item.quantity}x {item.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatCurrency(item.price)} each</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} space-y-2`}>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Tax</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-amber-500">
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700">
                    <span>Total</span>
                    <span className="text-emerald-500">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Notes</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ============================================
// REPORTS DASHBOARD
// ============================================
function ReportsDashboard({ darkMode, orders, products }: any) {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const now = new Date();
  const filteredOrders = orders.filter((order: Order) => {
    const orderDate = new Date(order.timestamp);
    if (dateRange === 'today') {
      return orderDate.toDateString() === now.toDateString();
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekAgo;
    } else if (dateRange === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  }).filter((order: Order) => order.status === 'completed');

  const totalSales = filteredOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const totalItems = filteredOrders.reduce((sum: number, order: Order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalTax = filteredOrders.reduce((sum: number, order: Order) => sum + order.tax, 0);
  const totalDiscount = filteredOrders.reduce((sum: number, order: Order) => sum + order.discount, 0);

  // Top products
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  filteredOrders.forEach((order: Order) => {
    order.items.forEach((item: CartItem) => {
      if (!productSales[item.id]) {
        productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[item.id].quantity += item.quantity;
      productSales[item.id].revenue += item.total;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Hourly breakdown
  const hourlySales: Record<number, { count: number; revenue: number }> = {};
  filteredOrders.forEach((order: Order) => {
    const hour = new Date(order.timestamp).getHours();
    if (!hourlySales[hour]) hourlySales[hour] = { count: 0, revenue: 0 };
    hourlySales[hour].count += 1;
    hourlySales[hour].revenue += order.total;
  });
  const peakHour = Object.entries(hourlySales).sort((a, b) => b[1].revenue - a[1].revenue)[0];

  // Payment methods breakdown
  const paymentMethods: Record<string, { count: number; amount: number }> = {};
  filteredOrders.forEach((order: Order) => {
    order.payments.forEach((payment: Payment) => {
      if (!paymentMethods[payment.method]) paymentMethods[payment.method] = { count: 0, amount: 0 };
      paymentMethods[payment.method].count += 1;
      paymentMethods[payment.method].amount += payment.amount;
    });
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${color} bg-opacity-10`} style={{ backgroundColor: color + '20' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Date Range Filter */}
      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm`}>
        <div className="flex gap-2">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                dateRange === range.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={formatCurrency(totalSales)} subtitle={`${totalOrders} orders`} icon={DollarSign} color="#10b981" />
        <StatCard title="Total Orders" value={totalOrders.toString()} subtitle={`${totalItems} items sold`} icon={ShoppingCart} color="#3b82f6" />
        <StatCard title="Avg Order" value={formatCurrency(avgOrderValue)} subtitle="Per transaction" icon={TrendingUp} color="#f59e0b" />
        <StatCard title="Total Tax" value={formatCurrency(totalTax)} subtitle={`${formatCurrency(totalDiscount)} in discounts`} icon={Percent} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm`}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Products
          </h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className={`text-sm text-center py-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-amber-500/20 text-amber-500' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    index === 2 ? 'bg-orange-600/20 text-orange-600' :
                    darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{product.quantity} sold</p>
                  </div>
                  <p className="font-bold text-emerald-500">{formatCurrency(product.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm`}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            Payment Methods
          </h3>
          <div className="space-y-3">
            {Object.entries(paymentMethods).length === 0 ? (
              <p className={`text-sm text-center py-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</p>
            ) : (
              Object.entries(paymentMethods).map(([method, data]: [string, any]) => (
                <div key={method} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: method === 'cash' ? '#10b98120' : method === 'card' ? '#3b82f620' : '#8b5cf620',
                      color: method === 'cash' ? '#10b981' : method === 'card' ? '#3b82f6' : '#8b5cf6'
                    }}>
                    {method === 'cash' && <Banknote className="w-5 h-5" />}
                    {method === 'card' && <CreditCard className="w-5 h-5" />}
                    {method === 'digital' && <Smartphone className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{method}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{data.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(data.amount)}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {totalSales > 0 ? ((data.amount / totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Hourly Breakdown */}
      <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm`}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Hourly Sales Breakdown
        </h3>
        {Object.keys(hourlySales).length === 0 ? (
          <p className={`text-sm text-center py-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</p>
        ) : (
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 24 }, (_, i) => {
              const data = hourlySales[i];
              const maxRevenue = Math.max(...Object.values(hourlySales).map((d: any) => d.revenue));
              const height = data ? (data.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-emerald-500/30 hover:bg-emerald-500/50 transition-all"
                      style={{ height: `${height}%`, minHeight: data ? '4px' : '0' }}
                    />
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{i}</span>
                </div>
              );
            })}
          </div>
        )}
        {peakHour && (
          <p className={`text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Peak hour: <span className="font-medium text-emerald-500">{peakHour[0]}:00</span> with {formatCurrency(peakHour[1].revenue)} in sales
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// SETTINGS PANEL
// ============================================
function SettingsPanel({ darkMode, currentUser, users, lowStockThreshold, setLowStockThreshold }: any) {
  const [activeSection, setActiveSection] = useState<'general' | 'users' | 'store'>('general');
  const [storeName, setStoreName] = useState('MartPOS Store');
  const [storeAddress, setStoreAddress] = useState('123 Main Street, City');
  const [taxRate, setTaxRate] = useState(8);
  const [receiptFooter, setReceiptFooter] = useState('Thank you for shopping with us!');

  const clearAllData = () => {
    if (confirm('WARNING: This will delete ALL data including products, orders, and settings. This cannot be undone. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportAllData = () => {
    const data = {
      products: JSON.parse(localStorage.getItem('pos_products') || '[]'),
      orders: JSON.parse(localStorage.getItem('pos_orders') || '[]'),
      holdOrders: JSON.parse(localStorage.getItem('pos_hold_orders') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Sidebar */}
      <div className="lg:col-span-3">
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm space-y-1`}>
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'store', label: 'Store Info', icon: Store },
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <section.icon className="w-5 h-5" />
              {section.label}
            </button>
          ))}
          <div className={`pt-4 mt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={exportAllData}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Download className="w-5 h-5" />
              Backup Data
            </button>
            <button
              onClick={clearAllData}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-9">
        {activeSection === 'general' && (
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm space-y-6`}>
            <h2 className="font-bold text-xl mb-4">General Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Low Stock Threshold</label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                  className={`w-full px-3 py-2 rounded-lg outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Products below this stock level will be flagged</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Default Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 8)}
                  className={`w-full px-3 py-2 rounded-lg outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Receipt Footer Text</label>
              <textarea
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
              />
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                System Info
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Total Products</p>
                <p className="font-medium">{products.length}</p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Total Orders</p>
                <p className="font-medium">{orders.length}</p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Data Storage</p>
                <p className="font-medium">Local (Browser)</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm space-y-6`}>
            <h2 className="font-bold text-xl mb-4">User Management</h2>
            <div className="space-y-3">
              {users.map((user: User) => (
                <div key={user.id} className={`flex items-center gap-4 p-4 rounded-xl ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className={`text-sm capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      user.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                    {user.id === currentUser.id && (
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-500">
                        You
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className={darkMode ? 'text-amber-400' : 'text-amber-700'}>
                  User management is limited in this demo. Full user CRUD requires backend integration.
                </span>
              </p>
            </div>
          </div>
        )}

        {activeSection === 'store' && (
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-sm space-y-6`}>
            <h2 className="font-bold text-xl mb-4">Store Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Store Address</label>
                <textarea
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
                />
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
                <p className="text-sm font-medium mb-2">Preview</p>
                <div className="text-center">
                  <h3 className="font-bold text-lg">{storeName}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{storeAddress}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
