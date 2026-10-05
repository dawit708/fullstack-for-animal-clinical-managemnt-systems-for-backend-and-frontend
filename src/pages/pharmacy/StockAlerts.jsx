// // pages/pharmacy/StockAlerts.jsx
// import { useEffect, useState } from 'react';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import pharmacyApi from '../../services/pharmacyApi';
// import { Card, Btn, Pill, EmptyState, Spinner } from '../../components/pharmacy/ui';
// import { alertTypeColor } from '../../utils/pharmacyStatus';
// import { toast } from 'react-toastify';

// const FILTERS = [
//   { key: 'active',    label: 'Active' },
//   { key: 'resolved',  label: 'Resolved' },
// ];

// export default function StockAlerts() {
//   const [filter, setFilter]   = useState('active');
//   const [alerts, setAlerts]   = useState([]);
//   const [loading, setLoading] = useState(true);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await pharmacyApi.getAlerts(filter === 'resolved' ? true : false);
//       setAlerts(data.alerts || []);
//     } catch {
//       toast.error('Failed to load alerts');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, [filter]);

//   const resolve = async (id) => {
//     try {
//       await pharmacyApi.resolveAlert(id);
//       toast.success('Alert resolved ✅');
//       load();
//     } catch {
//       toast.error('Failed to resolve');
//     }
//   };

//   const counts = {
//     critical: alerts.filter(a => a.alert_type === 'critical_stock').length,
//     low:      alerts.filter(a => a.alert_type === 'low_stock').length,
//     expiring: alerts.filter(a => a.alert_type === 'expiring').length,
//   };

//   return (
//     <DashboardLayout
//       title="Stock alerts"
//       subtitle="Prioritized attention · low stock, expiry & out-of-stock"
//     >
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <Card className="!py-4"><p className="text-xs text-gray-500">Critical</p><p className="text-2xl font-bold text-red-600">{counts.critical}</p></Card>
//         <Card className="!py-4"><p className="text-xs text-gray-500">Low stock</p><p className="text-2xl font-bold text-amber-600">{counts.low}</p></Card>
//         <Card className="!py-4"><p className="text-xs text-gray-500">Expiring</p><p className="text-2xl font-bold text-orange-600">{counts.expiring}</p></Card>
//       </div>

//       <div className="flex gap-2 mb-4">
//         {FILTERS.map(f => (
//           <button key={f.key}
//                   onClick={() => setFilter(f.key)}
//                   className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
//                     filter === f.key ? 'bg-teal-700 text-white'
//                                      : 'bg-white border border-gray-200 text-gray-600'
//                   }`}>
//             {f.label}
//           </button>
//         ))}
//       </div>

//       <Card>
//         {loading ? <Spinner /> : alerts.length === 0 ? (
//           <EmptyState text="No alerts 🎉" />
//         ) : (
//           <ul className="divide-y divide-gray-100">
//             {alerts.map(a => (
//               <li key={a.id} className="py-4 flex items-start justify-between gap-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Pill color={alertTypeColor(a.alert_type)}>
//                       {a.alert_type.replace('_', ' ')}
//                     </Pill>
//                     <p className="font-semibold text-sm">{a.medicine_name}</p>
//                   </div>
//                   <p className="text-xs text-gray-500">{a.message}</p>
//                   <p className="text-[11px] text-gray-400 mt-1">
//                     {new Date(a.created_at).toLocaleString()}
//                   </p>
//                 </div>
//                 {!a.is_resolved && (
//                   <Btn variant="secondary" onClick={() => resolve(a.id)}>Resolve</Btn>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </DashboardLayout>
//   );
// }