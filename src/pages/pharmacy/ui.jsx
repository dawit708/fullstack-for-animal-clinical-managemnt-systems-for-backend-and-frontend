// // src/components/pharmacy/ui.jsx
// import React from 'react';

// export function Card({ children, className = '' }) {
//   return (
//     <div className={`bg-white border border-gray-100 rounded-2xl p-6 ${className}`}>
//       {children}
//     </div>
//   );
// }

// export function PageHeader({ title, subtitle, action }) {
//   return (
//     <div className="flex items-start justify-between mb-5">
//       <div>
//         <h3 className="text-lg font-bold text-gray-900">{title}</h3>
//         {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
//       </div>
//       {action}
//     </div>
//   );
// }

// export function Btn({ children, variant = 'primary', ...props }) {
//   const styles = {
//     primary:  'bg-teal-700 hover:bg-teal-800 text-white',
//     secondary:'bg-gray-100 hover:bg-gray-200 text-gray-800',
//     danger:   'bg-red-600 hover:bg-red-700 text-white',
//     ghost:    'bg-transparent hover:bg-gray-100 text-gray-700',
//   };
//   return (
//     <button
//       {...props}
//       className={`${styles[variant]} text-sm font-semibold px-4 py-2 rounded-lg
//                   inline-flex items-center gap-2 disabled:opacity-50
//                   disabled:cursor-not-allowed ${props.className || ''}`}
//     >
//       {children}
//     </button>
//   );
// }

// export function Input({ label, ...props }) {
//   return (
//     <label className="block">
//       {label && <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>}
//       <input
//         {...props}
//         className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
//                    focus:outline-none focus:ring-2 focus:ring-teal-500/30
//                    focus:border-teal-500"
//       />
//     </label>
//   );
// }

// export function Select({ label, children, ...props }) {
//   return (
//     <label className="block">
//       {label && <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>}
//       <select
//         {...props}
//         className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
//                    focus:outline-none focus:ring-2 focus:ring-teal-500/30"
//       >
//         {children}
//       </select>
//     </label>
//   );
// }

// export function Pill({ children, color = 'gray' }) {
//   const map = {
//     gray:  'bg-gray-100 text-gray-700',
//     blue:  'bg-blue-50 text-blue-700',
//     green: 'bg-emerald-50 text-emerald-700',
//     red:   'bg-red-50 text-red-700',
//     amber: 'bg-amber-50 text-amber-700',
//     teal:  'bg-teal-50 text-teal-700',
//     purple:'bg-purple-50 text-purple-700',
//   };
//   return (
//     <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[color]}`}>
//       {children}
//     </span>
//   );
// }

// export function EmptyState({ text }) {
//   return (
//     <div className="text-center py-12 text-gray-400 text-sm">
//       {text || 'Nothing here yet'}
//     </div>
//   );
// }

// export function Spinner() {
//   return (
//     <div className="flex justify-center py-12">
//       <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
//     </div>
//   );
// }