// // pages/pharmacy/Vaccines.jsx
// import { useEffect, useState } from 'react';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import pharmacyApi from '../../services/pharmacyApi';
// import { Card, Pill, EmptyState, Spinner } from '../../components/pharmacy/ui';
// import { stockStatusColor } from '../../utils/pharmacyStatus';
// import { toast } from 'react-toastify';

// export default function Vaccines() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     pharmacyApi.getVaccines()
//       .then(r => setItems(r.data.vaccines || []))
//       .catch(() => toast.error('Failed to load vaccines'))
//       .finally(() => setLoading(false));
//   }, []);

//   const low = items.filter(v => v.stock_status !== 'ok').length;

//   return (
//     <DashboardLayout
//       title="Vaccines"
//       subtitle="Cold-chain immunizations · batch & expiry controlled"
//     >
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <Card className="!py-4"><p className="text-xs text-gray-500">Vaccines tracked</p><p className="text-2xl font-bold">{items.length}</p></Card>
//         <Card className="!py-4"><p className="text-xs text-gray-500">Need attention</p><p className="text-2xl font-bold text-amber-600">{low}</p></Card>
//         <Card className="!py-4"><p className="text-xs text-gray-500">Cold-chain</p><p className="text-2xl font-bold text-blue-600">2–8°C</p></Card>
//       </div>

//       <Card>
//         <h3 className="text-lg font-bold text-gray-900 mb-4">Vaccine stock</h3>
//         {loading ? <Spinner /> : items.length === 0 ? (
//           <EmptyState text="No vaccines in stock" />
//         ) : (
//           <ul className="divide-y divide-gray-100">
//             {items.map(v => (
//               <li key={v.id} className="py-4 flex items-center justify-between">
//                 <div>
//                   <p className="font-semibold text-gray-900">{v.name}</p>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Batch: {v.batch_number || '—'} · Exp: {v.expiry_date || '—'}
//                   </p>
//                 </div>
//                 <div className="text-right flex items-center gap-3">
//                   <div>
//                     <p className="text-lg font-bold">{v.stock_quantity}</p>
//                     <p className="text-[10px] text-gray-500">units</p>
//                   </div>
//                   <Pill color={stockStatusColor(v.stock_status)}>{v.stock_status}</Pill>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </DashboardLayout>
//   );
// }