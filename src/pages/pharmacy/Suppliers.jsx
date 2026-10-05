// // pages/pharmacy/Suppliers.jsx
// import { useEffect, useState } from 'react';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import pharmacyApi from '../../services/pharmacyApi';
// import { Card, PageHeader, EmptyState, Spinner } from '../../components/pharmacy/ui';
// import { toast } from 'react-toastify';

// export default function Suppliers() {
//   const [suppliers, setSuppliers] = useState([]);
//   const [loading, setLoading]     = useState(true);

//   useEffect(() => {
//     pharmacyApi.getSuppliers()
//       .then(r => setSuppliers(r.data.suppliers || []))
//       .catch(() => toast.error('Failed to load suppliers'))
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <DashboardLayout
//       title="Suppliers"
//       subtitle="Vendors · manufacturers · distributors"
//     >
//       <Card>
//         <PageHeader
//           title="Supplier directory"
//           subtitle={`${suppliers.length} active vendors`}
//         />

//         {loading ? <Spinner /> : suppliers.length === 0 ? (
//           <EmptyState text="No suppliers registered" />
//         ) : (
//           <ul className="divide-y divide-gray-100">
//             {suppliers.map(s => (
//               <li key={s.id} className="py-4 flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700
//                                   flex items-center justify-center font-bold">
//                     {s.name?.charAt(0).toUpperCase()}
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-900">{s.name}</p>
//                     <p className="text-xs text-gray-500">
//                       {s.contact_person || '—'} · {s.phone || '—'}
//                     </p>
//                     <p className="text-xs text-gray-400">{s.email || ''}</p>
//                   </div>
//                 </div>
//                 <div className="text-right text-xs">
//                   <p className="text-gray-500">Medicines</p>
//                   <p className="font-bold text-gray-900 text-base">{s.medicine_count || 0}</p>
//                   <p className="text-gray-500 mt-1">Active orders</p>
//                   <p className="font-bold text-teal-700 text-base">{s.active_orders || 0}</p>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </DashboardLayout>
//   );
// }