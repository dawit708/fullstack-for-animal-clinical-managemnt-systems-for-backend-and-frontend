// // pages/pharmacy/ToolsConsumables.jsx
// import { useEffect, useState } from 'react';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import pharmacyApi from '../../services/pharmacyApi';
// import { Card, Pill, EmptyState, Spinner } from '../../components/pharmacy/ui';
// import { stockStatusColor } from '../../utils/pharmacyStatus';

// export default function ToolsConsumables() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     pharmacyApi.getTools()
//       .then(r => setItems(r.data.items || []))
//       .finally(() => setLoading(false));
//   }, []);

//   const grouped = items.reduce((acc, it) => {
//     const cat = it.category || 'Other';
//     (acc[cat] ||= []).push(it);
//     return acc;
//   }, {});

//   return (
//     <DashboardLayout
//       title="Tools & consumables"
//       subtitle="Syringes, gauze, PPE & daily operational supplies"
//     >
//       {loading ? <Spinner /> : items.length === 0 ? (
//         <Card><EmptyState text="No tools or consumables yet" /></Card>
//       ) : (
//         <div className="space-y-6">
//           {Object.entries(grouped).map(([cat, list]) => (
//             <Card key={cat}>
//               <h3 className="text-base font-bold text-gray-900 mb-3">{cat}</h3>
//               <ul className="divide-y divide-gray-100">
//                 {list.map(i => (
//                   <li key={i.id} className="py-3 flex justify-between items-center">
//                     <div>
//                       <p className="font-semibold text-sm">{i.name}</p>
//                       <p className="text-xs text-gray-500">Batch: {i.batch_number || '—'}</p>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <p className="font-bold">{i.stock_quantity}</p>
//                       <Pill color={stockStatusColor(i.stock_status)}>{i.stock_status}</Pill>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </Card>
//           ))}
//         </div>
//       )}
//     </DashboardLayout>
//   );
// }