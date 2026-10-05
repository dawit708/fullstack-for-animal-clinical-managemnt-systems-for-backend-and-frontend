// // pages/pharmacy/PurchaseOrders.jsx
// import { useEffect, useState } from 'react';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import pharmacyApi from '../../services/pharmacyApi';
// import { Card, PageHeader, Btn, Pill, EmptyState, Spinner, Input, Select } from '../../components/pharmacy/ui';
// import { poStatusColor } from '../../utils/pharmacyStatus';
// import { toast } from 'react-toastify';

// export default function PurchaseOrders() {
//   const [orders, setOrders]         = useState([]);
//   const [suppliers, setSuppliers]   = useState([]);
//   const [loading, setLoading]       = useState(true);
//   const [showCreate, setShowCreate] = useState(false);
//   const [form, setForm]             = useState({
//     supplier_id: '', expected_date: '', notes: '',
//     items: [{ item_name: '', quantity: 1, unit_price: 0 }],
//   });

//   const load = async () => {
//     setLoading(true);
//     try {
//       const [pos, sups] = await Promise.all([
//         pharmacyApi.getPOs(),
//         pharmacyApi.getSuppliers(),
//       ]);
//       setOrders(pos.data.orders || []);
//       setSuppliers(sups.data.suppliers || []);
//     } catch {
//       toast.error('Failed to load purchase orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const updateItem = (idx, patch) => {
//     setForm(f => ({
//       ...f,
//       items: f.items.map((it, i) => i === idx ? { ...it, ...patch } : it),
//     }));
//   };

//   const addItem = () =>
//     setForm(f => ({ ...f, items: [...f.items, { item_name: '', quantity: 1, unit_price: 0 }] }));

//   const removeItem = (idx) =>
//     setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

//   const submit = async () => {
//     if (!form.supplier_id || form.items.some(i => !i.item_name || !i.quantity)) {
//       return toast.error('Fill supplier and all items');
//     }
//     try {
//       await pharmacyApi.createPO({
//         supplier_id: parseInt(form.supplier_id),
//         expected_date: form.expected_date || null,
//         notes: form.notes,
//         items: form.items.map(i => ({
//           item_name: i.item_name,
//           quantity: parseInt(i.quantity),
//           unit_price: parseFloat(i.unit_price),
//         })),
//       });
//       toast.success('PO created ✅');
//       setShowCreate(false);
//       setForm({ supplier_id:'', expected_date:'', notes:'',
//                 items:[{ item_name:'', quantity:1, unit_price:0 }] });
//       load();
//     } catch (e) {
//       toast.error(e.response?.data?.message || 'Failed to create');
//     }
//   };

//   const receive = async (id) => {
//     if (!window.confirm('Receive this order? Stock will be added.')) return;
//     try {
//       await pharmacyApi.receivePO(id);
//       toast.success('Order received, stock updated ✅');
//       load();
//     } catch (e) {
//       toast.error(e.response?.data?.message || 'Failed to receive');
//     }
//   };

//   return (
//     <DashboardLayout
//       title="Purchase orders"
//       subtitle="Procurement & stock intake from vendors"
//     >
//       <Card>
//         <PageHeader
//           title="Purchase orders"
//           subtitle="Create, track & receive orders"
//           action={<Btn onClick={() => setShowCreate(v => !v)}>＋ New order</Btn>}
//         />

//         {showCreate && (
//           <div className="bg-gray-50 rounded-xl p-4 mb-5">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
//               <Select label="Supplier *"
//                       value={form.supplier_id}
//                       onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}>
//                 <option value="">Select supplier…</option>
//                 {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//               </Select>
//               <Input label="Expected date" type="date"
//                      value={form.expected_date}
//                      onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))} />
//             </div>

//             <p className="text-xs font-semibold text-gray-600 mb-2">Items</p>
//             {form.items.map((item, idx) => (
//               <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
//                 <div className="col-span-5">
//                   <Input placeholder="Item name"
//                          value={item.item_name}
//                          onChange={e => updateItem(idx, { item_name: e.target.value })} />
//                 </div>
//                 <div className="col-span-2">
//                   <Input type="number" placeholder="Qty"
//                          value={item.quantity}
//                          onChange={e => updateItem(idx, { quantity: e.target.value })} />
//                 </div>
//                 <div className="col-span-3">
//                   <Input type="number" placeholder="Unit price"
//                          value={item.unit_price}
//                          onChange={e => updateItem(idx, { unit_price: e.target.value })} />
//                 </div>
//                 <div className="col-span-2 flex items-center">
//                   {form.items.length > 1 && (
//                     <Btn variant="ghost" onClick={() => removeItem(idx)}>✕</Btn>
//                   )}
//                 </div>
//               </div>
//             ))}

//             <Btn variant="secondary" onClick={addItem}>＋ Add item</Btn>

//             <div className="flex justify-end gap-2 mt-4">
//               <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
//               <Btn onClick={submit}>Create PO</Btn>
//             </div>
//           </div>
//         )}

//         {loading ? <Spinner /> : orders.length === 0 ? (
//           <EmptyState text="No purchase orders yet" />
//         ) : (
//           <ul className="divide-y divide-gray-100">
//             {orders.map(o => (
//               <li key={o.id} className="py-4 flex items-center justify-between">
//                 <div>
//                   <p className="font-semibold text-gray-900">{o.po_number}</p>
//                   <p className="text-xs text-gray-500">
//                     {o.supplier_name} · {o.item_count} items · ${Number(o.total_amount).toFixed(2)}
//                   </p>
//                   <div className="mt-1.5 flex gap-2 items-center">
//                     <Pill color={poStatusColor(o.status)}>{o.status}</Pill>
//                     {o.expected_date && (
//                       <span className="text-[11px] text-gray-400">
//                         ETA {new Date(o.expected_date).toLocaleDateString()}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 {o.status !== 'received' && o.status !== 'cancelled' && (
//                   <Btn onClick={() => receive(o.id)}>Receive</Btn>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </DashboardLayout>
//   );
// }