// // pages/pharmacy/DispensingQueue.jsx
// import { useEffect, useMemo, useState } from 'react';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import pharmacyApi from '../../services/pharmacyApi';
// import { Card, PageHeader, Btn, Pill, EmptyState, Spinner } from '../../components/pharmacy/ui';
// import { rxStatusColor } from '../../utils/pharmacyStatus';
// import { toast } from 'react-toastify';

// const TABS = [
//   { key: '',          label: 'All' },
//   { key: 'pending',   label: 'Pending' },
//   { key: 'checking',  label: 'Checking' },
//   { key: 'ready',     label: 'Ready' },
//   { key: 'dispensed', label: 'Dispensed' },
// ];

// export default function DispensingQueue() {
//   const [tab, setTab]           = useState('');
//   const [queue, setQueue]       = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [loading, setLoading]   = useState(true);
//   const [busy, setBusy]         = useState(false);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await pharmacyApi.getQueue(tab ? { status: tab } : {});
//       setQueue(data.queue || []);
//       if (data.queue?.length && !selected) setSelected(data.queue[0]);
//     } catch {
//       toast.error('Failed to load queue');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, [tab]);

//   const handleReady = async () => {
//     if (!selected) return;
//     setBusy(true);
//     try {
//       await pharmacyApi.markReady(selected.id);
//       toast.success('Marked as ready ✅');
//       await load();
//     } catch (e) {
//       toast.error(e.response?.data?.message || 'Failed');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const handleDispense = async () => {
//     if (!selected) return;
//     setBusy(true);
//     try {
//       await pharmacyApi.dispense(selected.id, {
//         quantity: parseInt(selected.quantity) || 1,
//       });
//       toast.success('Dispensed & stock updated ✅');
//       await load();
//     } catch (e) {
//       toast.error(e.response?.data?.message || 'Failed');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const initials = (n) =>
//     n?.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() || '?';

//   const counts = useMemo(() => ({
//     total: queue.length,
//     priority: queue.filter(q => q.priority === 'priority' || q.priority === 'urgent').length,
//   }), [queue]);

//   return (
//     <DashboardLayout
//       title="Dispensing queue"
//       subtitle="Electronic prescriptions awaiting pharmacy action"
//     >
//       {/* Tabs */}
//       <div className="flex gap-2 mb-4">
//         {TABS.map(t => (
//           <button
//             key={t.key}
//             onClick={() => setTab(t.key)}
//             className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
//               tab === t.key ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 border border-gray-200'
//             }`}
//           >
//             {t.label}
//           </button>
//         ))}
//         <span className="ml-auto text-xs text-gray-500 self-center">
//           {counts.total} in queue · {counts.priority} priority
//         </span>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left: table */}
//         <div className="lg:col-span-2">
//           <Card>
//             {loading ? <Spinner /> : queue.length === 0 ? (
//               <EmptyState text="No prescriptions in queue ✅" />
//             ) : (
//               <table className="w-full">
//                 <thead>
//                   <tr className="text-left text-[11px] text-gray-500 tracking-wider border-b border-gray-100">
//                     <th className="py-3 font-semibold">RX</th>
//                     <th className="py-3 font-semibold">PATIENT &amp; OWNER</th>
//                     <th className="py-3 font-semibold">MEDICATION</th>
//                     <th className="py-3 font-semibold">STATUS</th>
//                     <th className="py-3"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {queue.map(row => {
//                     const isSel = selected?.id === row.id;
//                     const label = row.priority === 'priority' || row.priority === 'urgent'
//                       ? 'Priority'
//                       : (row.status_label || row.status);
//                     return (
//                       <tr
//                         key={row.id}
//                         onClick={() => setSelected(row)}
//                         className={`border-b border-gray-50 cursor-pointer ${
//                           isSel ? 'bg-teal-50/40' : 'hover:bg-gray-50'
//                         }`}
//                       >
//                         <td className="py-4 font-semibold text-teal-700 text-sm">{row.rx_number}</td>
//                         <td className="py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700
//                                             flex items-center justify-center text-xs font-bold">
//                               {initials(row.animal_name)}
//                             </div>
//                             <div>
//                               <p className="text-sm font-semibold text-gray-900">{row.animal_name}</p>
//                               <p className="text-xs text-gray-500">{row.owner_name}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="py-4">
//                           <p className="text-sm">{row.medicine_name}</p>
//                           <p className="text-xs text-gray-500">Dr. {row.vet_name || '—'}</p>
//                         </td>
//                         <td className="py-4">
//                           <Pill color={
//                             label === 'Priority' ? 'red' :
//                             label === 'Ready to fill' ? 'blue' :
//                             label === 'Checking' ? 'amber' :
//                             label === 'Ready' ? 'green' : 'gray'
//                           }>{label}</Pill>
//                         </td>
//                         <td className="py-4">
//                           <button className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-teal-100
//                                              flex items-center justify-center text-teal-700">
//                             →
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             )}
//           </Card>
//         </div>

//         {/* Right: dispense panel */}
//         <div>
//           <Card>
//             {!selected ? (
//               <EmptyState text="Select a prescription" />
//             ) : (
//               <>
//                 <h3 className="text-lg font-bold text-gray-900">Dispense {selected.rx_number}</h3>
//                 <p className="text-xs text-gray-500 mb-4">
//                   {selected.animal_name} · Digital prescription
//                 </p>

//                 <div className="bg-teal-50 rounded-xl p-4 mb-3">
//                   <p className="font-bold text-gray-900 text-sm mb-1">{selected.medicine_name}</p>
//                   <p className="text-xs text-gray-600 mb-2">{selected.instructions || 'As directed'}</p>
//                   <p className="text-xs font-semibold text-teal-700">Quantity: {selected.quantity}</p>
//                 </div>

//                 <div className="bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2
//                                 text-xs font-medium mb-3">
//                   ✅ Allergy and interaction check passed
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-3 mb-4">
//                   <p className="text-[10px] tracking-wider text-gray-500 font-bold">SELECTED LOT</p>
//                   <p className="text-xs text-gray-800 mt-1">
//                     {selected.batch_number || 'N/A'} · Exp {selected.expiry_date || '—'}
//                   </p>
//                 </div>

//                 {selected.status === 'pending' && (
//                   <Btn variant="secondary" className="w-full mb-2 justify-center"
//                        onClick={handleReady} disabled={busy}>
//                     Mark as ready
//                   </Btn>
//                 )}

//                 <Btn className="w-full justify-center"
//                      onClick={handleDispense}
//                      disabled={busy || selected.status === 'dispensed'}>
//                   🖨️ {busy ? 'Processing…' : 'Print label & dispense'}
//                 </Btn>
//               </>
//             )}
//           </Card>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }