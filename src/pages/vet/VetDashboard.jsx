// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import { useAuth } from '../../context/AuthContext';
// import API from '../../services/api';
// import { toast } from 'react-toastify';
// import {
//   Loader2, Calendar, Clock, FlaskConical, CheckCircle2,
//   ArrowRight, Plus, TestTube2, Pill, Stethoscope, Scissors,
// } from 'lucide-react';

// export default function VetDashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState(null);
//   const [vet, setVet] = useState(null);
//   const [schedule, setSchedule] = useState([]);
//   const [queue, setQueue] = useState([]);
//   const [activePatient, setActivePatient] = useState(null);
//   const [labTests, setLabTests] = useState([]);
//   const [prescriptions, setPrescriptions] = useState([]);

//   // ============================================
//   // LOAD ALL DATA
//   // ============================================
//   useEffect(() => {
//     const loadAll = async () => {
//       try {
//         setLoading(true);

//         const [dashRes, schedRes, queueRes] = await Promise.all([
//           API.get('/vet/dashboard'),
//           API.get('/vet/schedule/today'),
//           API.get('/vet/patient-queue'),
//         ]);

//         setStats(dashRes.data.stats);
//         setVet(dashRes.data.vet);
//         setSchedule(schedRes.data.schedule || []);
//         setQueue(queueRes.data.queue || []);

//         // Active patient
//         const active = (schedRes.data.schedule || []).find(
//           (s) => s.status === 'in_consultation'
//         ) || (schedRes.data.schedule || [])[0];

//         if (active) {
//           const patientRes = await API.get(`/vet/patients/${active.animal_id}`);
//           setActivePatient({
//             ...patientRes.data.patient,
//             appointment: active,
//           });
//         }

//         // Lab tests
//         const labRes = await API.get('/vet/results-to-review').catch(() => ({
//           data: { results: [] },
//         }));
//         setLabTests((labRes.data.results || []).slice(0, 3));

//         // Prescriptions
//         const rxRes = await API.get('/pharmacy/dispensing-queue').catch(() => ({
//           data: { queue: [] },
//         }));
//         setPrescriptions((rxRes.data.queue || []).slice(0, 2));
//       } catch (err) {
//         console.error('Load error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadAll();
//   }, []);

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Good morning';
//     if (hour < 18) return 'Good afternoon';
//     return 'Good evening';
//   };

//   const getStatusDot = (status) => {
//     const colors = {
//       completed: 'bg-gray-400',
//       in_consultation: 'bg-orange-500',
//       checked_in: 'bg-teal-500',
//       confirmed: 'bg-blue-500',
//       pending: 'bg-purple-500',
//     };
//     return colors[status] || 'bg-gray-400';
//   };

//   // ============================================
//   // NAVIGATION HANDLERS
//   // ============================================
//   const handleOpenCalendar = () => {
//     navigate('/vet/appointments');
//   };

//   const handleOrderLab = () => {
//     navigate('/vet/lab-order');
//   };

//   const handleNewPrescription = () => {
//     navigate('/vet/prescriptions');
//   };

//   const handleViewLaboratory = () => {
//     navigate('/vet/laboratory');
//   };

//   const handleViewConsultations = () => {
//     navigate('/vet/consultations');
//   };

//   const handleViewFollowUps = () => {
//     navigate('/vet/follow-ups');
//   };

//   const handleViewSurgery = () => {
//     navigate('/vet/surgery');
//   };

//   const handlePatientClick = async (apt) => {
//     try {
//       const res = await API.get(`/vet/patients/${apt.animal_id}`);
//       setActivePatient({
//         ...res.data.patient,
//         appointment: apt,
//       });
//     } catch (e) {
//       console.error(e);
//       toast.error('Failed to load patient');
//     }
//   };

//   // ============================================
//   // LOADING
//   // ============================================
//   if (loading) {
//     return (
//       <DashboardLayout title="Today">
//         <div className="flex items-center justify-center py-20">
//           <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
//         </div>
//       </DashboardLayout>
//     );
//   }

//   // ============================================
//   // RENDER
//   // ============================================
//   return (
//     <DashboardLayout
//       title={`${getGreeting()}, ${user?.full_name?.split(' ')[0] || 'Dr.'}`}
//       subtitle={vet?.branch_name ? `${vet.branch_name} · Consultation room 3` : 'Riverside Clinic · Consultation room 3'}
//     >
//       {/* ============================================ */}
//       {/* STAT CARDS - 4 (Clickable) */}
//       {/* ============================================ */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
//         {/* Card 1: Today's appointments */}
//         <button
//           onClick={handleOpenCalendar}
//           className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
//         >
//           <div className="flex items-start gap-4">
//             <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
//               <Calendar className="w-7 h-7 text-teal-600" strokeWidth={2.5} />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold text-gray-600 mb-1">
//                 Today's appointments
//               </p>
//               <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
//                 {stats?.today_appointments?.total || 0}
//               </p>
//               <p className="text-xs font-semibold text-teal-600">
//                 {stats?.today_appointments?.completed || 0} completed
//                 <span className="text-gray-400"> · </span>
//                 <span className="text-red-600">
//                   {stats?.today_appointments?.urgent || 0} urgent
//                 </span>
//               </p>
//             </div>
//           </div>
//         </button>

//         {/* Card 2: Waiting now */}
//         <button
//           onClick={handleOpenCalendar}
//           className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
//         >
//           <div className="flex items-start gap-4">
//             <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
//               <Clock className="w-7 h-7 text-orange-500" strokeWidth={2.5} />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold text-gray-600 mb-1">
//                 Waiting now
//               </p>
//               <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
//                 {stats?.waiting_now?.count || 0}
//               </p>
//               <p className="text-xs font-semibold text-orange-500">
//                 Longest wait {stats?.waiting_now?.longest_wait_minutes || 0} min
//               </p>
//             </div>
//           </div>
//         </button>

//         {/* Card 3: Results to review */}
//         <button
//           onClick={handleViewLaboratory}
//           className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
//         >
//           <div className="flex items-start gap-4">
//             <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
//               <FlaskConical className="w-7 h-7 text-red-500" strokeWidth={2.5} />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold text-gray-600 mb-1">
//                 Results to review
//               </p>
//               <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
//                 {stats?.results_to_review?.count || 0}
//               </p>
//               <p className="text-xs font-semibold text-red-500">
//                 {stats?.results_to_review?.abnormal || 0} abnormal result
//               </p>
//             </div>
//           </div>
//         </button>

//         {/* Card 4: Follow-ups */}
//         <button
//           onClick={handleViewFollowUps}
//           className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
//         >
//           <div className="flex items-start gap-4">
//             <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
//               <CheckCircle2 className="w-7 h-7 text-blue-500" strokeWidth={2.5} />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold text-gray-600 mb-1">
//                 Follow-ups
//               </p>
//               <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
//                 {stats?.follow_ups?.count || 0}
//               </p>
//               <p className="text-xs font-semibold text-blue-600">
//                 {stats?.follow_ups?.need_scheduling || 0} need scheduling
//               </p>
//             </div>
//           </div>
//         </button>
//       </div>

//       {/* ============================================ */}
//       {/* MAIN GRID */}
//       {/* ============================================ */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
//         {/* ============================================ */}
//         {/* LEFT - TODAY'S SCHEDULE */}
//         {/* ============================================ */}
//         <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200">
//           <div className="p-5 border-b border-gray-100">
//             <div className="flex items-center justify-between mb-1">
//               <h3 className="text-xl font-extrabold text-black">
//                 Today's schedule
//               </h3>
//               <button
//                 onClick={handleOpenCalendar}
//                 className="flex items-center gap-1 px-3 py-1.5 
//                            bg-teal-50 border border-teal-200 
//                            text-teal-700 rounded-lg text-xs font-bold"
//               >
//                 Open calendar
//                 <ArrowRight className="w-3 h-3" />
//               </button>
//             </div>
//             <p className="text-sm font-semibold text-gray-500">
//               {new Date().toLocaleDateString('en-US', { weekday: 'long' })} · {schedule.length} appointments
//             </p>
//           </div>

//           {/* Patient Queue Badge (Clickable) */}
//           {queue.length > 0 && (
//             <button
//               onClick={handleOpenCalendar}
//               className="w-full mx-5 mt-5 p-3.5 bg-orange-50 border border-orange-200 rounded-xl"
//               style={{ width: 'calc(100% - 40px)' }}
//             >
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-bold text-orange-900">
//                   Patient queue
//                 </span>
//                 <span className="text-sm font-bold text-orange-900">
//                   {queue.length} waiting
//                 </span>
//               </div>
//             </button>
//           )}

//           {/* Schedule List */}
//           <div className="p-5 space-y-2">
//             {schedule.length === 0 ? (
//               <div className="py-8 text-center">
//                 <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
//                 <p className="text-sm font-semibold text-gray-400">
//                   No appointments
//                 </p>
//               </div>
//             ) : (
//               schedule.slice(0, 5).map((apt) => {
//                 const isActive = activePatient?.appointment?.appointment_id === apt.appointment_id;
//                 return (
//                   <button
//                     key={apt.appointment_id}
//                     onClick={() => handlePatientClick(apt)}
//                     className={`w-full text-left p-3.5 rounded-xl border-2 ${
//                       isActive
//                         ? 'bg-teal-50 border-teal-300'
//                         : 'bg-white border-gray-100'
//                     }`}
//                   >
//                     <div className="flex items-start gap-3">
//                       <p className="text-sm font-extrabold text-black w-12 flex-shrink-0">
//                         {new Date(apt.appointment_date).toLocaleTimeString('en-US', {
//                           hour: '2-digit',
//                           minute: '2-digit',
//                           hour12: false,
//                         })}
//                       </p>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-bold text-black truncate">
//                           {apt.animal_name}
//                         </p>
//                         <p className="text-xs font-medium text-gray-500 truncate">
//                           {apt.reason || apt.service_name || 'Checkup'}
//                         </p>
//                         <p className="text-xs font-medium text-gray-400 truncate">
//                           {apt.species === 'dog' ? 'Canine' : apt.species === 'cat' ? 'Feline' : apt.species} · {Math.floor((apt.age_months || 0) / 12)}y
//                         </p>
//                       </div>
//                       <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(apt.status)} flex-shrink-0 mt-1.5`}></div>
//                     </div>
//                   </button>
//                 );
//               })
//             )}

//             {/* View All Link */}
//             {schedule.length > 5 && (
//               <button
//                 onClick={handleOpenCalendar}
//                 className="w-full py-2.5 text-sm font-bold text-teal-600 rounded-lg"
//               >
//                 View all {schedule.length} →
//               </button>
//             )}
//           </div>

//           {/* Quick Actions */}
//           <div className="p-5 pt-0">
//             <div className="pt-4 border-t border-gray-100 space-y-2">
//               <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">
//                 Quick Actions
//               </p>
//               <button
//                 onClick={handleViewConsultations}
//                 className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm font-bold text-black"
//               >
//                 <Stethoscope className="w-4 h-4 text-teal-600" />
//                 Consultations
//               </button>
//               <button
//                 onClick={handleViewSurgery}
//                 className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm font-bold text-black"
//               >
//                 <Scissors className="w-4 h-4 text-purple-600" />
//                 Surgery schedule
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ============================================ */}
//         {/* CENTER - PATIENT DETAIL */}
//         {/* ============================================ */}
//         <div className="lg:col-span-5">
//           {activePatient ? (
//             <div className="bg-white rounded-2xl border border-gray-200">
//               {/* Patient Header */}
//               <div className="p-5 border-b border-gray-100">
//                 <div className="flex items-start gap-3 mb-4">
//                   <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center flex-shrink-0">
//                     <span className="text-base font-black">
//                       {activePatient.name?.substring(0, 2).toUpperCase()}
//                     </span>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-base font-extrabold text-black">
//                       {activePatient.name}
//                     </h3>
//                     <p className="text-xs font-semibold text-gray-600">
//                       {activePatient.breed} · {activePatient.gender === 'male' ? 'Male' : 'Female'}
//                       {activePatient.is_neutered ? ' neutered' : ''} ·{' '}
//                       {activePatient.age_years || 0}y
//                       {activePatient.age_months ? ` ${activePatient.age_months % 12}m` : ''} ·{' '}
//                       {activePatient.weight_kg} kg
//                     </p>
//                   </div>
//                   <span className="inline-flex items-center px-3 py-1 
//                                   bg-teal-100 text-teal-800 
//                                   rounded-full text-xs font-extrabold flex-shrink-0">
//                     In consultation · 14 min
//                   </span>
//                 </div>

//                 {/* Tags */}
//                 <div className="flex flex-wrap gap-1.5">
//                   {activePatient.allergies?.map((a) => (
//                     <span key={a.id} className="inline-flex items-center gap-1 px-2.5 py-1 
//                                                 bg-red-100 text-red-800 
//                                                 rounded-full text-xs font-bold">
//                       ⚠️ Allergy: {a.allergen}
//                     </span>
//                   ))}
//                   {activePatient.chronic_conditions?.map((c) => (
//                     <span key={c.id} className="inline-flex items-center px-2.5 py-1 
//                                                 bg-orange-100 text-orange-800 
//                                                 rounded-full text-xs font-bold">
//                       {c.condition_name}
//                     </span>
//                   ))}
//                   {activePatient.microchip_verified && (
//                     <span className="inline-flex items-center px-2.5 py-1 
//                                     bg-green-100 text-green-800 
//                                     rounded-full text-xs font-bold">
//                       Microchip verified
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Vitals */}
//               <div className="grid grid-cols-4 gap-2 px-5 py-4 bg-gray-50 border-b border-gray-100">
//                 <div className="text-center">
//                   <p className="text-xs font-semibold text-gray-500 mb-1">Temperature</p>
//                   <p className="text-lg font-extrabold text-black">
//                     {activePatient.latest_vitals?.temperature || '38.7'} °C
//                   </p>
//                 </div>
//                 <div className="text-center">
//                   <p className="text-xs font-semibold text-gray-500 mb-1">Heart rate</p>
//                   <p className="text-lg font-extrabold text-black">
//                     {activePatient.latest_vitals?.heart_rate || '92'} bpm
//                   </p>
//                 </div>
//                 <div className="text-center">
//                   <p className="text-xs font-semibold text-gray-500 mb-1">Respiration</p>
//                   <p className="text-lg font-extrabold text-black">
//                     {activePatient.latest_vitals?.respiration || '24'} rpm
//                   </p>
//                 </div>
//                 <div className="text-center">
//                   <p className="text-xs font-semibold text-gray-500 mb-1">BCS</p>
//                   <p className="text-lg font-extrabold text-black">
//                     {activePatient.latest_vitals?.bcs || '6'} / 9
//                   </p>
//                 </div>
//               </div>

//               {/* SOAP Tabs */}
//               <div className="border-b border-gray-100">
//                 <div className="flex gap-6 px-5">
//                   <button className="py-3 text-sm font-extrabold text-teal-600 border-b-2 border-teal-500">
//                     SOAP notes
//                   </button>
//                   <button className="py-3 text-sm font-bold text-gray-400">
//                     History
//                   </button>
//                   <button className="py-3 text-sm font-bold text-gray-400">
//                     Attachments
//                   </button>
//                 </div>
//               </div>

//               {/* SOAP Content */}
//               <div className="p-5 space-y-3">
//                 <SOAPSection
//                   letter="S"
//                   title="SUBJECTIVE"
//                   content={activePatient.latest_soap_note?.subjective || 'Owner reports increased paw licking and erythema for 5 days; appetite and energy remain normal.'}
//                 />
//                 <SOAPSection
//                   letter="O"
//                   title="OBJECTIVE"
//                   content={activePatient.latest_soap_note?.objective || 'Interdigital erythema all paws, mild otitis externa. No pustules. Skin scrape negative.'}
//                 />
//                 <SOAPSection
//                   letter="A"
//                   title="ASSESSMENT"
//                   content={activePatient.latest_soap_note?.assessment || 'Atopic dermatitis flare with secondary otitis; rule out Malassezia overgrowth.'}
//                   highlighted={true}
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="p-5 pt-0">
//                 <div className="pt-4 border-t border-gray-100 flex gap-2">
//                   <button
//                     onClick={handleOrderLab}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
//                                bg-teal-500 text-white rounded-lg text-sm font-bold"
//                   >
//                     <FlaskConical className="w-4 h-4" />
//                     Order Lab
//                   </button>
//                   <button
//                     onClick={handleNewPrescription}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
//                                bg-white border-2 border-gray-300 text-black rounded-lg text-sm font-bold"
//                   >
//                     <Pill className="w-4 h-4" />
//                     New Rx
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
//               <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//               <h3 className="text-base font-bold text-black mb-1">
//                 No active patient
//               </h3>
//               <p className="text-sm font-medium text-gray-500">
//                 Select a patient from the schedule
//               </p>
//             </div>
//           )}
//         </div>

//         {/* ============================================ */}
//         {/* RIGHT - LABORATORY + PRESCRIPTION */}
//         {/* ============================================ */}
//         <div className="lg:col-span-3 space-y-5">
//           {/* Laboratory Panel */}
//           <div className="bg-white rounded-2xl border border-gray-200">
//             <button
//               onClick={handleViewLaboratory}
//               className="w-full p-5 border-b border-gray-100 text-left"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-extrabold text-black mb-0.5">
//                     Laboratory
//                   </h3>
//                   <p className="text-xs font-semibold text-gray-500">
//                     Orders and digital results
//                   </p>
//                 </div>
//                 <ArrowRight className="w-4 h-4 text-gray-400" />
//               </div>
//             </button>

//             <div className="p-4 space-y-2">
//               {labTests.length === 0 ? (
//                 <>
//                   <LabItem
//                     title="Ear cytology · OD"
//                     subtitle="Malassezia 4+ · Abnormal"
//                     abnormal={true}
//                     onClick={handleViewLaboratory}
//                   />
//                   <LabItem
//                     title="CBC + chemistry"
//                     subtitle="Suki · Completed"
//                     abnormal={false}
//                     onClick={handleViewLaboratory}
//                   />
//                   <LabItem
//                     title="Urinalysis"
//                     subtitle="Milo · Processing"
//                     abnormal={false}
//                     onClick={handleViewLaboratory}
//                   />
//                 </>
//               ) : (
//                 labTests.map((test) => (
//                   <LabItem
//                     key={test.id}
//                     title={test.test_type}
//                     subtitle={`${test.animal_name} · ${test.status}`}
//                     abnormal={test.is_abnormal}
//                     onClick={handleViewLaboratory}
//                   />
//                 ))
//               )}

//               <button
//                 onClick={handleOrderLab}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-3 
//                            bg-teal-500 text-white 
//                            rounded-xl text-sm font-bold mt-2"
//               >
//                 <Plus className="w-4 h-4" strokeWidth={3} />
//                 Order laboratory
//               </button>
//             </div>
//           </div>

//           {/* Prescription Panel */}
//           <div className="bg-white rounded-2xl border border-gray-200">
//             <button
//               onClick={handleNewPrescription}
//               className="w-full p-5 border-b border-gray-100 text-left"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-extrabold text-black mb-0.5">
//                     Prescription
//                   </h3>
//                   <p className="text-xs font-semibold text-gray-500">
//                     Digital prescription draft
//                   </p>
//                 </div>
//                 <ArrowRight className="w-4 h-4 text-gray-400" />
//               </div>
//             </button>

//             <div className="p-4 space-y-2">
//               {prescriptions.length === 0 ? (
//                 <button
//                   onClick={handleNewPrescription}
//                   className="w-full p-3 bg-teal-50 rounded-xl border border-teal-200 text-left"
//                 >
//                   <p className="text-sm font-bold text-black">
//                     Mometamax otic
//                   </p>
//                   <p className="text-xs font-semibold text-gray-600">
//                     Ear drops · 15g
//                   </p>
//                 </button>
//               ) : (
//                 prescriptions.map((rx) => (
//                   <button
//                     key={rx.id}
//                     onClick={handleNewPrescription}
//                     className="w-full p-3 bg-teal-50 rounded-xl border border-teal-200 text-left"
//                   >
//                     <p className="text-sm font-bold text-black truncate">
//                       {rx.medicine_name}
//                     </p>
//                     <p className="text-xs font-semibold text-gray-600">
//                       {rx.rx_number} · {rx.dosage}
//                     </p>
//                   </button>
//                 ))
//               )}

//               <button
//                 onClick={handleNewPrescription}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
//                            bg-white border-2 border-gray-200 
//                            text-black rounded-xl text-sm font-bold mt-2"
//               >
//                 <Pill className="w-4 h-4" />
//                 New prescription
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }

// // ============================================
// // SOAP SECTION COMPONENT
// // ============================================
// function SOAPSection({ letter, title, content, highlighted = false }) {
//   return (
//     <div className={`p-4 rounded-xl border-2 ${
//       highlighted
//         ? 'bg-teal-50 border-teal-300'
//         : 'bg-gray-50 border-gray-200'
//     }`}>
//       <div className="flex items-start gap-3">
//         <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black ${
//           highlighted
//             ? 'bg-teal-500 text-white'
//             : 'bg-gray-200 text-gray-700'
//         }`}>
//           {letter}
//         </div>
//         <div className="flex-1 min-w-0">
//           <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wide mb-1">
//             {title}
//           </p>
//           <p className="text-sm font-medium text-black leading-relaxed">
//             {content}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // LAB ITEM COMPONENT (Clickable)
// // ============================================
// function LabItem({ title, subtitle, abnormal, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`w-full p-3 rounded-xl border text-left ${
//         abnormal
//           ? 'bg-red-50 border-red-200'
//           : 'bg-teal-50 border-teal-200'
//       }`}
//     >
//       <div className="flex items-start gap-2">
//         <TestTube2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
//           abnormal ? 'text-red-500' : 'text-teal-600'
//         }`} strokeWidth={2.5} />
//         <div className="flex-1 min-w-0">
//           <p className="text-xs font-extrabold text-black truncate">
//             {title}
//           </p>
//           <p className="text-xs font-medium text-gray-600 truncate">
//             {subtitle}
//           </p>
//         </div>
//       </div>
//     </button>
//   );
// }
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, Calendar, Clock, FlaskConical, CheckCircle2,
  ArrowRight, Plus, TestTube2, Pill, Stethoscope, Scissors,
  AlertTriangle, RefreshCw,
} from 'lucide-react';

// ============================================
// HELPERS
// ============================================
const getErrMsg = (err) =>
  err?.response?.data?.message ||
  err?.message ||
  'Something went wrong. Please try again.';

const formatAge = (months) => {
  const total = Number(months) || 0;
  const y = Math.floor(total / 12);
  const m = total % 12;
  return `${y}y${m ? ` ${m}m` : ''}`;
};

const statusLabel = (apt) => {
  if (!apt) return '';
  const base = (apt.status || '').replace(/_/g, ' ');
  const text = base.charAt(0).toUpperCase() + base.slice(1);
  if (
    apt.status === 'checked_in' &&
    apt.wait_minutes !== null &&
    apt.wait_minutes !== undefined &&
    apt.wait_minutes >= 0
  ) {
    return `${text} · ${apt.wait_minutes} min`;
  }
  return text;
};

export default function VetDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [vet, setVet] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [queue, setQueue] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  // ============================================
  // LOAD ALL DATA
  // ============================================
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // allSettled: one failing request does not break the others
      const [dashR, schedR, queueR] = await Promise.allSettled([
        API.get('/vet/dashboard'),
        API.get('/vet/schedule/today'),
        API.get('/vet/patient-queue'),
      ]);

      // Dashboard is required. If it fails, show the real server message.
      if (dashR.status === 'rejected') {
        console.error('Dashboard load error:', dashR.reason);
        setError(getErrMsg(dashR.reason));
        return;
      }

      setStats(dashR.value.data.stats || null);
      setVet(dashR.value.data.vet || null);

      const scheduleList =
        schedR.status === 'fulfilled' ? schedR.value.data.schedule || [] : [];
      const queueList =
        queueR.status === 'fulfilled' ? queueR.value.data.queue || [] : [];

      if (schedR.status === 'rejected') {
        console.error('Schedule load error:', schedR.reason);
        toast.error(`Schedule: ${getErrMsg(schedR.reason)}`);
      }
      if (queueR.status === 'rejected') {
        console.error('Queue load error:', queueR.reason);
        toast.error(`Queue: ${getErrMsg(queueR.reason)}`);
      }

      setSchedule(scheduleList);
      setQueue(queueList);

      // Active patient (never breaks the dashboard if it fails)
      const active =
        scheduleList.find((s) => s.status === 'in_consultation') ||
        scheduleList[0];

      if (active) {
        try {
          const patientRes = await API.get(`/vet/patients/${active.animal_id}`);
          setActivePatient({
            ...patientRes.data.patient,
            appointment: active,
          });
        } catch (e) {
          console.error('Active patient load error:', e);
          setActivePatient(null);
        }
      } else {
        setActivePatient(null);
      }

      // Lab results (optional)
      try {
        const labRes = await API.get('/vet/results-to-review');
        setLabTests((labRes.data.results || []).slice(0, 3));
      } catch {
        setLabTests([]);
      }

      // Prescriptions (optional)
      try {
        const rxRes = await API.get('/pharmacy/dispensing-queue');
        setPrescriptions((rxRes.data.queue || []).slice(0, 2));
      } catch {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error('Load error:', err);
      setError(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusDot = (status) => {
    const colors = {
      completed: 'bg-gray-400',
      in_consultation: 'bg-orange-500',
      checked_in: 'bg-teal-500',
      confirmed: 'bg-blue-500',
      pending: 'bg-purple-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================
  const handleOpenCalendar = () => navigate('/vet/appointments');
  const handleOrderLab = () => navigate('/vet/lab-order');
  const handleNewPrescription = () => navigate('/vet/prescriptions');
  const handleViewLaboratory = () => navigate('/vet/laboratory');
  const handleViewConsultations = () => navigate('/vet/consultations');
  const handleViewFollowUps = () => navigate('/vet/follow-ups');
  const handleViewSurgery = () => navigate('/vet/surgery');

  const handlePatientClick = async (apt) => {
    try {
      const res = await API.get(`/vet/patients/${apt.animal_id}`);
      setActivePatient({
        ...res.data.patient,
        appointment: apt,
      });
    } catch (e) {
      console.error(e);
      toast.error(getErrMsg(e));
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <DashboardLayout title="Today">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  // ============================================
  // ERROR (shows the real server message)
  // ============================================
  if (error) {
    return (
      <DashboardLayout title="Today">
        <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl border border-red-200 p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-extrabold text-black mb-2">
            Could not load dashboard
          </h3>
          <p className="text-sm font-medium text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const vitals = activePatient?.latest_vitals || {};
  const soap = activePatient?.latest_soap_note || {};

  const patientLine = activePatient
    ? [
        activePatient.breed,
        activePatient.gender === 'male'
          ? 'Male'
          : activePatient.gender === 'female'
          ? 'Female'
          : null,
        formatAge(activePatient.age_months),
        activePatient.weight_kg ? `${activePatient.weight_kg} kg` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout
      title={`${getGreeting()}, ${
        (user?.full_name || vet?.full_name || 'Dr.').split(' ')[0]
      }`}
      subtitle={vet?.branch_name || ''}
    >
      {/* ============================================ */}
      {/* STAT CARDS - 4 (Clickable) */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Card 1: Today's appointments */}
        <button
          onClick={handleOpenCalendar}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-7 h-7 text-teal-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Today's appointments
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.today_appointments?.total || 0}
              </p>
              <p className="text-xs font-semibold text-teal-600">
                {stats?.today_appointments?.completed || 0} completed
                <span className="text-gray-400"> · </span>
                <span className="text-red-600">
                  {stats?.today_appointments?.urgent || 0} urgent
                </span>
              </p>
            </div>
          </div>
        </button>

        {/* Card 2: Waiting now */}
        <button
          onClick={handleOpenCalendar}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-7 h-7 text-orange-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Waiting now
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.waiting_now?.count || 0}
              </p>
              <p className="text-xs font-semibold text-orange-500">
                Longest wait {stats?.waiting_now?.longest_wait_minutes || 0} min
              </p>
            </div>
          </div>
        </button>

        {/* Card 3: Results to review */}
        <button
          onClick={handleViewLaboratory}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-7 h-7 text-red-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Results to review
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.results_to_review?.count || 0}
              </p>
              <p className="text-xs font-semibold text-red-500">
                {stats?.results_to_review?.abnormal || 0} abnormal result
              </p>
            </div>
          </div>
        </button>

        {/* Card 4: Follow-ups */}
        <button
          onClick={handleViewFollowUps}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-blue-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Follow-ups
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.follow_ups?.count || 0}
              </p>
              <p className="text-xs font-semibold text-blue-600">
                {stats?.follow_ups?.need_scheduling || 0} need scheduling
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* ============================================ */}
      {/* MAIN GRID */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ============================================ */}
        {/* LEFT - TODAY'S SCHEDULE */}
        {/* ============================================ */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-extrabold text-black">
                Today's schedule
              </h3>
              <button
                onClick={handleOpenCalendar}
                className="flex items-center gap-1 px-3 py-1.5 
                           bg-teal-50 border border-teal-200 
                           text-teal-700 rounded-lg text-xs font-bold"
              >
                Open calendar
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })} ·{' '}
              {schedule.length} appointments
            </p>
          </div>

          {/* Patient Queue Badge (Clickable) */}
          {queue.length > 0 && (
            <div className="px-5 pt-5">
              <button
                onClick={handleOpenCalendar}
                className="w-full p-3.5 bg-orange-50 border border-orange-200 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-900">
                    Patient queue
                  </span>
                  <span className="text-sm font-bold text-orange-900">
                    {queue.length} waiting
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Schedule List */}
          <div className="p-5 space-y-2">
            {schedule.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">
                  No appointments
                </p>
              </div>
            ) : (
              schedule.slice(0, 5).map((apt) => {
                const isActive =
                  activePatient?.appointment?.appointment_id ===
                  apt.appointment_id;
                return (
                  <button
                    key={apt.appointment_id}
                    onClick={() => handlePatientClick(apt)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 ${
                      isActive
                        ? 'bg-teal-50 border-teal-300'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <p className="text-sm font-extrabold text-black w-12 flex-shrink-0">
                        {new Date(apt.appointment_date).toLocaleTimeString(
                          'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }
                        )}
                      </p>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black truncate">
                          {apt.animal_name}
                        </p>
                        <p className="text-xs font-medium text-gray-500 truncate">
                          {apt.reason || apt.service_name || 'Checkup'}
                        </p>
                        <p className="text-xs font-medium text-gray-400 truncate">
                          {apt.species === 'dog'
                            ? 'Canine'
                            : apt.species === 'cat'
                            ? 'Feline'
                            : apt.species}{' '}
                          · {Math.floor((apt.age_months || 0) / 12)}y
                        </p>
                      </div>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${getStatusDot(
                          apt.status
                        )} flex-shrink-0 mt-1.5`}
                      ></div>
                    </div>
                  </button>
                );
              })
            )}

            {/* View All Link */}
            {schedule.length > 5 && (
              <button
                onClick={handleOpenCalendar}
                className="w-full py-2.5 text-sm font-bold text-teal-600 rounded-lg"
              >
                View all {schedule.length} →
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-5 pt-0">
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                Quick Actions
              </p>
              <button
                onClick={handleViewConsultations}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm font-bold text-black"
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Consultations
              </button>
              <button
                onClick={handleViewSurgery}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm font-bold text-black"
              >
                <Scissors className="w-4 h-4 text-purple-600" />
                Surgery schedule
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CENTER - PATIENT DETAIL */}
        {/* ============================================ */}
        <div className="lg:col-span-5">
          {activePatient ? (
            <div className="bg-white rounded-2xl border border-gray-200">
              {/* Patient Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-black">
                      {activePatient.name?.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-extrabold text-black">
                      {activePatient.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-600">
                      {patientLine}
                    </p>
                  </div>
                  {activePatient.appointment?.status && (
                    <span
                      className="inline-flex items-center px-3 py-1 
                                  bg-teal-100 text-teal-800 
                                  rounded-full text-xs font-extrabold flex-shrink-0"
                    >
                      {statusLabel(activePatient.appointment)}
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {activePatient.allergies?.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 
                                                bg-red-100 text-red-800 
                                                rounded-full text-xs font-bold"
                    >
                      ⚠️ Allergy: {a.allergen}
                    </span>
                  ))}
                  {activePatient.chronic_conditions?.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center px-2.5 py-1 
                                                bg-orange-100 text-orange-800 
                                                rounded-full text-xs font-bold"
                    >
                      {c.condition_name}
                    </span>
                  ))}
                  {activePatient.microchip_verified && (
                    <span
                      className="inline-flex items-center px-2.5 py-1 
                                    bg-green-100 text-green-800 
                                    rounded-full text-xs font-bold"
                    >
                      Microchip verified
                    </span>
                  )}
                </div>
              </div>

              {/* Vitals (real data only) */}
              <div className="grid grid-cols-4 gap-2 px-5 py-4 bg-gray-50 border-b border-gray-100">
                <Vital label="Temperature" value={vitals.temperature} unit="°C" />
                <Vital label="Heart rate" value={vitals.heart_rate} unit="bpm" />
                <Vital label="Respiration" value={vitals.respiration} unit="rpm" />
                <Vital label="BCS" value={vitals.bcs} unit="/ 9" />
              </div>

              {/* SOAP Tabs */}
              <div className="border-b border-gray-100">
                <div className="flex gap-6 px-5">
                  <button className="py-3 text-sm font-extrabold text-teal-600 border-b-2 border-teal-500">
                    SOAP notes
                  </button>
                  <button className="py-3 text-sm font-bold text-gray-400">
                    History
                  </button>
                  <button className="py-3 text-sm font-bold text-gray-400">
                    Attachments
                  </button>
                </div>
              </div>

              {/* SOAP Content (real data only) */}
              <div className="p-5 space-y-3">
                <SOAPSection
                  letter="S"
                  title="SUBJECTIVE"
                  content={soap.subjective}
                />
                <SOAPSection
                  letter="O"
                  title="OBJECTIVE"
                  content={soap.objective}
                />
                <SOAPSection
                  letter="A"
                  title="ASSESSMENT"
                  content={soap.assessment}
                  highlighted={true}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0">
                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={handleOrderLab}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                               bg-teal-500 text-white rounded-lg text-sm font-bold"
                  >
                    <FlaskConical className="w-4 h-4" />
                    Order Lab
                  </button>
                  <button
                    onClick={handleNewPrescription}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                               bg-white border-2 border-gray-300 text-black rounded-lg text-sm font-bold"
                  >
                    <Pill className="w-4 h-4" />
                    New Rx
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-black mb-1">
                No active patient
              </h3>
              <p className="text-sm font-medium text-gray-500">
                Select a patient from the schedule
              </p>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* RIGHT - LABORATORY + PRESCRIPTION */}
        {/* ============================================ */}
        <div className="lg:col-span-3 space-y-5">
          {/* Laboratory Panel */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <button
              onClick={handleViewLaboratory}
              className="w-full p-5 border-b border-gray-100 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-black mb-0.5">
                    Laboratory
                  </h3>
                  <p className="text-xs font-semibold text-gray-500">
                    Orders and digital results
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            <div className="p-4 space-y-2">
              {labTests.length === 0 ? (
                <p className="py-4 text-center text-sm font-semibold text-gray-400">
                  No results to review
                </p>
              ) : (
                labTests.map((test) => (
                  <LabItem
                    key={test.id}
                    title={test.test_type}
                    subtitle={`${test.animal_name} · ${test.status}`}
                    abnormal={!!test.is_abnormal}
                    onClick={handleViewLaboratory}
                  />
                ))
              )}

              <button
                onClick={handleOrderLab}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                           bg-teal-500 text-white 
                           rounded-xl text-sm font-bold mt-2"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                Order laboratory
              </button>
            </div>
          </div>

          {/* Prescription Panel */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <button
              onClick={handleNewPrescription}
              className="w-full p-5 border-b border-gray-100 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-black mb-0.5">
                    Prescription
                  </h3>
                  <p className="text-xs font-semibold text-gray-500">
                    Digital prescriptions
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            <div className="p-4 space-y-2">
              {prescriptions.length === 0 ? (
                <p className="py-4 text-center text-sm font-semibold text-gray-400">
                  No recent prescriptions
                </p>
              ) : (
                prescriptions.map((rx) => (
                  <button
                    key={rx.id}
                    onClick={handleNewPrescription}
                    className="w-full p-3 bg-teal-50 rounded-xl border border-teal-200 text-left"
                  >
                    <p className="text-sm font-bold text-black truncate">
                      {rx.medicine_name}
                    </p>
                    <p className="text-xs font-semibold text-gray-600">
                      {rx.rx_number} · {rx.dosage}
                    </p>
                  </button>
                ))
              )}

              <button
                onClick={handleNewPrescription}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                           bg-white border-2 border-gray-200 
                           text-black rounded-xl text-sm font-bold mt-2"
              >
                <Pill className="w-4 h-4" />
                New prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================
// VITAL COMPONENT
// ============================================
function Vital({ label, value, unit }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  return (
    <div className="text-center">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-extrabold text-black">
        {hasValue ? `${value} ${unit}` : '—'}
      </p>
    </div>
  );
}

// ============================================
// SOAP SECTION COMPONENT
// ============================================
function SOAPSection({ letter, title, content, highlighted = false }) {
  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        highlighted
          ? 'bg-teal-50 border-teal-300'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black ${
            highlighted
              ? 'bg-teal-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {letter}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p
            className={`text-sm font-medium leading-relaxed ${
              content ? 'text-black' : 'text-gray-400 italic'
            }`}
          >
            {content || 'No notes recorded yet'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LAB ITEM COMPONENT (Clickable)
// ============================================
function LabItem({ title, subtitle, abnormal, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-xl border text-left ${
        abnormal ? 'bg-red-50 border-red-200' : 'bg-teal-50 border-teal-200'
      }`}
    >
      <div className="flex items-start gap-2">
        <TestTube2
          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
            abnormal ? 'text-red-500' : 'text-teal-600'
          }`}
          strokeWidth={2.5}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-black truncate">{title}</p>
          <p className="text-xs font-medium text-gray-600 truncate">
            {subtitle}
          </p>
        </div>
      </div>
    </button>
  );
}
