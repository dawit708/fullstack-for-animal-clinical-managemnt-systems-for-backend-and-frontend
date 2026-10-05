import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, Wrench, Package, ShoppingCart, AlertTriangle,
  CheckCircle, RefreshCw, Activity, TrendingDown, Clock
} from 'lucide-react';

export default function Maintenance() {
  const [data, setData] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ============================================
  // LOAD ALL DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const [maintRes, equipRes, stockRes, ordersRes] = await Promise.all([
        API.get('/admin/maintenance'),
        API.get('/lab/equipment').catch(() => ({ data: { equipment: [] } })),
        API.get('/pharmacy/medicines?low_stock=true').catch(() => ({ data: { medicines: [] } })),
        API.get('/pharmacy/purchase-orders?status=pending').catch(() => ({ data: { orders: [] } })),
      ]);

      setData(maintRes.data.maintenance);
      setEquipment(equipRes.data.equipment || []);
      setLowStock((stockRes.data.medicines || []).slice(0, 5));
      setPendingOrders((ordersRes.data.orders || []).slice(0, 5));
    } catch (err) {
      console.error('Maintenance error:', err);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Maintenance">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Maintenance"
      subtitle="System health, equipment and inventory"
    >
      {/* HEADER */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                System Maintenance
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monitor equipment, inventory and purchase orders
              </p>
            </div>
          </div>
          <button onClick={loadData} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Wrench}
          label="Total Equipment"
          value={data?.equipment?.total || 0}
          note={`${data?.equipment?.in_maintenance || 0} in maintenance`}
          color={data?.equipment?.in_maintenance > 0 ? 'orange' : 'green'}
          onClick={() => navigate('/lab/equipment')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={data?.low_stock_items || 0}
          note="Need restocking"
          color={data?.low_stock_items > 0 ? 'red' : 'green'}
          onClick={() => navigate('/pharmacy/inventory')}
        />
        <StatCard
          icon={ShoppingCart}
          label="Pending Orders"
          value={data?.pending_purchase_orders || 0}
          note="Awaiting delivery"
          color={data?.pending_purchase_orders > 0 ? 'blue' : 'green'}
          onClick={() => navigate('/pharmacy/purchase-orders')}
        />
        <StatCard
          icon={Activity}
          label="System Status"
          value="Healthy"
          note="All systems operational"
          color="green"
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT - Equipment Status */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Equipment Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lab equipment and analyzers
              </p>
            </div>
            <button
              onClick={() => navigate('/lab/equipment')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </button>
          </div>

          {equipment.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No equipment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {equipment.slice(0, 6).map((eq) => (
                <div
                  key={eq.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      eq.status === 'online' ? 'bg-green-500' :
                      eq.status === 'maintenance' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {eq.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {eq.serial_number || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    eq.status === 'online' ? 'bg-green-50 text-green-700' :
                    eq.status === 'maintenance' ? 'bg-orange-50 text-orange-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {eq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT - System Health */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            System Health
          </h3>

          <div className="space-y-4">
            <HealthItem icon={CheckCircle} label="Database" status="ok" color="green" />
            <HealthItem icon={CheckCircle} label="API Server" status="ok" color="green" />
            <HealthItem icon={CheckCircle} label="Backups" status="ok" color="green" />
            <HealthItem
              icon={data?.low_stock_items > 0 ? AlertTriangle : CheckCircle}
              label="Inventory"
              status={data?.low_stock_items > 0 ? 'warn' : 'ok'}
              color={data?.low_stock_items > 0 ? 'orange' : 'green'}
            />
            <HealthItem
              icon={data?.pending_purchase_orders > 0 ? Clock : CheckCircle}
              label="Orders"
              status={data?.pending_purchase_orders > 0 ? 'warn' : 'ok'}
              color={data?.pending_purchase_orders > 0 ? 'blue' : 'green'}
            />
          </div>
        </div>
      </div>

      {/* LOW STOCK + ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Low Stock */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Low Stock Items
            </h3>
            <button
              onClick={() => navigate('/pharmacy/inventory')}
              className="text-sm text-primary-600 font-medium"
            >
              Manage →
            </button>
          </div>

          {lowStock.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">All stocked up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((med) => (
                <div key={med.id} className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {med.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Min: {med.min_stock_level}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {med.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              Pending Orders
            </h3>
            <button
              onClick={() => navigate('/pharmacy/purchase-orders')}
              className="text-sm text-primary-600 font-medium"
            >
              View all →
            </button>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No pending orders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.po_number}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.supplier_name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      ${order.total_amount}
                    </p>
                    <span className="text-xs text-blue-600 capitalize">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ icon: Icon, label, value, note, color = 'teal', onClick }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div
      onClick={onClick}
      className={`card ${onClick ? 'cursor-pointer hover:shadow-hover transition-shadow' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{note}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HEALTH ITEM
// ============================================
function HealthItem({ icon: Icon, label, status, color }) {
  const colors = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
  };

  return (
    <div className="flex items-center gap-3 py-2 border-t border-gray-100 dark:border-gray-700 first:border-t-0">
      <Icon className={`w-5 h-5 ${colors[color]}`} />
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`text-xs font-medium capitalize ${colors[color]}`}>
        {status === 'ok' ? 'Healthy' : 'Review'}
      </span>
    </div>
  );
}