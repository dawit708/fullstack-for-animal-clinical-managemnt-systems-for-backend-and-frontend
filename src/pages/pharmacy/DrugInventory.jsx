// // pages/pharmacy/DrugInventory.jsx
// import { useEffect, useState } from 'react';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import pharmacyApi from '../../services/pharmacyApi';
// import { Card, PageHeader, Btn, Pill, EmptyState, Spinner, Input, Select } from '../../components/pharmacy/ui';
// import { stockStatusColor } from '../../utils/pharmacyStatus';
// import { toast } from 'react-toastify';

// export default function DrugInventory() {
//   const [meds, setMeds]         = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [filters, setFilters]   = useState({ search: '', category: '', low_stock: '', expiring: '' });
//   const [showAdd, setShowAdd]   = useState(false);
//   const [form, setForm]         = useState({
//     name: '', generic_name: '', category: '', price: '',
//     stock_quantity: '', min_stock_level: 10, critical_stock_level: 5,
//     batch_number: '', expiry_date: '',
//   });

//   const load = async () => {
//     setLoading(true);
//     try {
//       const params = {};
//       if (filters.search)   params.search = filters.search;
//       if (filters.category) params.category = filters.category;
//       if (filters.low_stock === 'true') params.low_stock = 'true';
//       if (filters.expiring === 'true')  params.expiring = 'true';
//       const { data } = await pharmacyApi.getMedicines(params);
//       setMeds(data.medicines || []);
//     } catch {
//       toast.error('Failed to load inventory');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const t = setTimeout(load, 300); // debounce
//     return () => clearTimeout(t);
//   }, [filters]);

//   const handleAdd = async () => {
//     try {
//       await pharmacyApi.addMedicine({
//         ...form,
//         price: parseFloat(form.price) || 0,
//         stock_quantity: parseInt(form.stock_quantity) || 0,
//       });
//       toast.success('Medicine added ✅');
//       setShowAdd(false);
//       setForm({ name:'', generic_name:'', category:'', price:'', stock_quantity:'',
//                 min_stock_level:10, critical_stock_level:5, batch_number:'', expiry_date:'' });
//       load();
//     } catch (e) {
//       toast.error(e.response?.data?.message || 'Failed to add');
//     }
//   };

//   const summary = {
//     total: meds.length,
//     low: meds.filter(m => m.stock_status === 'low' || m.stock_status === 'critical').length,
//     out: meds.filter(m => m.stock_status === 'out_of_stock').length,
//   };

//   return (
//     <DashboardLayout
//       title="Drug inventory"
//       subtitle="All medicines across branches"
//     >
//       {/* Summary strip */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <Card className="!py-4"><p className="text-xs text-gray-500">Total items</p><p className="text-2xl font-bold">{summary.total}</p></Card>
//         <Card className="!py-4"><p className="text-xs text-gray-500">Low stock</p><p className="text-2xl font-bold text-amber-600">{summary.low}</p></Card>
//         <Card className="!py-4"><p className="text-xs text-gray-500">Out of stock</p><p className="text-2xl font-bold text-red-600">{summary.out}</p></Card>
//       </div>

//       <Card>
//         <PageHeader
//           title="Medicines"
//           subtitle="Filter, search & manage your catalog"
//           action={<Btn onClick={() => setShowAdd(v => !v)}>＋ Add medicine</Btn>}
//         />

//         {/* Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
//           <Input placeholder="Search name or generic…"
//                  value={filters.search}
//                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
//           <Select value={filters.category}
//                   onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
//             <option value="">All categories</option>
//             <option>Antibiotic</option><option>Vaccine</option>
//             <option>Painkiller</option><option>Dewormer</option>
//           </Select>
//           <Select value={filters.low_stock}
//                   onChange={e => setFilters(f => ({ ...f, low_stock: e.target.value }))}>
//             <option value="">Stock status</option>
//             <option value="true">Low stock only</option>
//           </Select>
//           <Select value={filters.expiring}
//                   onChange={e => setFilters(f => ({ ...f, expiring: e.target.value }))}>
//             <option value="">Expiry</option>
//             <option value="true">Expiring (60d)</option>
//           </Select>
//         </div>

//         {/* Add form */}
//         {showAdd && (
//           <div className="bg-gray-50 rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
//             <Input label="Name *" value={form.name}
//                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
//             <Input label="Generic name" value={form.generic_name}
//                    onChange={e => setForm(f => ({ ...f, generic_name: e.target.value }))} />
//             <Input label="Category" value={form.category}
//                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
//             <Input label="Price *" type="number" value={form.price}
//                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
//             <Input label="Stock qty" type="number" value={form.stock_quantity}
//                    onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} />
//             <Input label="Min level" type="number" value={form.min_stock_level}
//                    onChange={e => setForm(f => ({ ...f, min_stock_level: e.target.value }))} />
//             <Input label="Critical level" type="number" value={form.critical_stock_level}
//                    onChange={e => setForm(f => ({ ...f, critical_stock_level: e.target.value }))} />
//             <Input label="Batch #" value={form.batch_number}
//                    onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))} />
//             <Input label="Expiry date" type="date" value={form.expiry_date}
//                    onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
//             <div className="md:col-span-3 flex justify-end gap-2">
//               <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
//               <Btn onClick={handleAdd}>Save medicine</Btn>
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         {loading ? <Spinner /> : meds.length === 0 ? <EmptyState text="No medicines found" /> : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left text-xs text-gray-500 border-b">
//                   <th className="py-3">Name</th>
//                   <th className="py-3">Category</th>
//                   <th className="py-3">Stock</th>
//                   <th className="py-3">Price</th>
//                   <th className="py-3">Batch</th>
//                   <th className="py-3">Expiry</th>
//                   <th className="py-3">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {meds.map(m => (
//                   <tr key={m.id} className="border-b hover:bg-gray-50">
//                     <td className="py-3">
//                       <p className="font-semibold text-gray-900">{m.name}</p>
//                       <p className="text-xs text-gray-500">{m.generic_name || '—'}</p>
//                     </td>
//                     <td className="py-3">{m.category || '—'}</td>
//                     <td className="py-3 font-semibold">{m.stock_quantity}</td>
//                     <td className="py-3">${Number(m.price).toFixed(2)}</td>
//                     <td className="py-3 text-xs">{m.batch_number || '—'}</td>
//                     <td className="py-3 text-xs">
//                       {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '—'}
//                     </td>
//                     <td className="py-3">
//                       <Pill color={stockStatusColor(m.stock_status)}>
//                         {m.stock_status?.replace('_', ' ')}
//                       </Pill>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Card>
//     </DashboardLayout>
//   );
// }