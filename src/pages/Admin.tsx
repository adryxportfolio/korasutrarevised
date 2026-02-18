import { useState, useEffect, useCallback } from 'react';
import { Shield, LogOut, Users, Phone, Mail, Package, IndianRupee, Calendar, RefreshCw, ChevronDown, ChevronUp, Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Order {
  id: number;
  name: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
  totalPrice: string;
  currency: string;
  createdAt: string;
  lineItems: { title: string; quantity: number; price: string }[];
}

interface Customer {
  id: string;
  phone: string;
  countryCode: string;
  name: string | null;
  email: string | null;
  isVerified: boolean;
  shopifyCustomerId: string | null;
  createdAt: string;
  lastActivity: string;
  orders: Order[];
  totalOrders: number;
  totalSpent: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
}

function getStatusColor(status: string | null) {
  switch (status?.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-800 border-green-200';
    case 'fulfilled': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'refunded': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-secondary text-muted-foreground border-border';
  }
}

export default function Admin() {
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('ks_admin_token'));
  const [adminUsername, setAdminUsername] = useState<string>(() => localStorage.getItem('ks_admin_user') || '');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'orders' | 'spent'>('recent');

  const fetchCustomers = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-get-customers`, {
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        if (res.status === 401) {
          handleLogout();
          toast.error('Session expired. Please log in again.');
        } else {
          toast.error(data.error || 'Failed to fetch customers');
        }
        return;
      }
      setCustomers(data.customers || []);
    } catch {
      toast.error('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      fetchCustomers(adminToken);
    }
  }, [adminToken, fetchCustomers]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Login failed');
        return;
      }
      localStorage.setItem('ks_admin_token', data.token);
      localStorage.setItem('ks_admin_user', data.username);
      setAdminToken(data.token);
      setAdminUsername(data.username);
      toast.success('Welcome to Admin Panel');
    } catch {
      toast.error('Failed to connect to server');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ks_admin_token');
    localStorage.removeItem('ks_admin_user');
    setAdminToken(null);
    setAdminUsername('');
    setCustomers([]);
  };

  const filteredCustomers = customers
    .filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.phone.includes(q) ||
        (c.name?.toLowerCase().includes(q)) ||
        (c.email?.toLowerCase().includes(q)) ||
        (`${c.countryCode}${c.phone}`.includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);
  const verifiedCustomers = customers.filter(c => c.isVerified).length;

  // LOGIN PAGE
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Kora Sutra — Secure Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 bg-card border border-border rounded-sm p-6">
            <div>
              <label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Username
              </label>
              <Input
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Admin username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Admin password"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-heading text-lg">Kora Sutra Admin</h1>
              <p className="text-xs text-muted-foreground font-body">Welcome, {adminUsername}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adminToken && fetchCustomers(adminToken)}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Refresh'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-body uppercase tracking-wide">Total Customers</span>
            </div>
            <p className="text-2xl font-heading">{customers.length}</p>
            <p className="text-xs text-muted-foreground">{verifiedCustomers} verified</p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-body uppercase tracking-wide">Total Orders</span>
            </div>
            <p className="text-2xl font-heading">{totalOrders}</p>
            <p className="text-xs text-muted-foreground">Via Shopify</p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <IndianRupee className="w-4 h-4" />
              <span className="text-xs font-body uppercase tracking-wide">Total Revenue</span>
            </div>
            <p className="text-2xl font-heading">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground">From placed orders</p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-xs font-body uppercase tracking-wide">OTP Verified</span>
            </div>
            <p className="text-2xl font-heading">{verifiedCustomers}</p>
            <p className="text-xs text-muted-foreground">{customers.length > 0 ? Math.round((verifiedCustomers / customers.length) * 100) : 0}% of total</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by phone, name, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(['recent', 'orders', 'spent'] as const).map(s => (
              <Button
                key={s}
                variant={sortBy === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(s)}
                className="capitalize"
              >
                {s === 'recent' ? 'Latest' : s === 'orders' ? 'Most Orders' : 'Most Spent'}
              </Button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-heading text-base">
              Customers ({filteredCustomers.length})
            </h2>
            {isLoading && <span className="text-xs text-muted-foreground font-body animate-pulse">Syncing with Shopify...</span>}
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-body">{isLoading ? 'Loading customers...' : searchQuery ? 'No customers match your search' : 'No customers registered yet'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredCustomers.map(customer => (
                <div key={customer.id}>
                  {/* Customer Row */}
                  <div
                    className="px-4 py-4 hover:bg-secondary/20 cursor-pointer transition-colors"
                    onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading text-sm">{customer.name || 'Unknown'}</span>
                          {customer.isVerified && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-800 border border-green-200 h-4">
                              OTP Verified
                            </Badge>
                          )}
                          {customer.shopifyCustomerId && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border border-blue-200 h-4">
                              Shopify Synced
                            </Badge>
                          )}
                        </div>
                        
                        {/* Phone - prominently displayed */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {customer.countryCode} {customer.phone}
                          </span>
                        </div>
                        
                        {customer.email && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground font-body truncate">{customer.email}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground font-body">
                            Joined {formatDate(customer.createdAt)} at {formatTime(customer.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-body">Orders</p>
                            <p className="font-heading text-lg leading-none">{customer.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-body">Spent</p>
                            <p className="font-heading text-sm">
                              {customer.totalSpent > 0 ? `₹${customer.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
                            </p>
                          </div>
                          {expandedCustomer === customer.id
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Orders */}
                  {expandedCustomer === customer.id && (
                    <div className="px-4 pb-4 bg-secondary/10 border-t border-border">
                      <h3 className="text-xs font-body uppercase tracking-widest text-muted-foreground py-3">
                        Order History ({customer.totalOrders})
                      </h3>
                      {customer.orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground font-body py-2">No orders found in Shopify</p>
                      ) : (
                        <div className="space-y-3">
                          {customer.orders.map(order => (
                            <div key={order.id} className="bg-card border border-border rounded-sm p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-heading text-sm">{order.name}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${getStatusColor(order.financialStatus)}`}>
                                    {order.financialStatus}
                                  </span>
                                  {order.fulfillmentStatus && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${getStatusColor(order.fulfillmentStatus)}`}>
                                      {order.fulfillmentStatus}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-heading text-sm">₹{parseFloat(order.totalPrice).toLocaleString('en-IN')}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {order.lineItems.map((item, i) => (
                                  <p key={i} className="text-xs text-muted-foreground font-body">
                                    {item.quantity}× {item.title} — ₹{parseFloat(item.price).toLocaleString('en-IN')}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
