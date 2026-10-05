import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Search, User, Phone, PawPrint } from 'lucide-react';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/vet/patients');
        setPatients(data.patients || []);
      } catch (err) {
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = patients.filter((p) =>
    search
      ? p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.owner_name?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <DashboardLayout
      title="Patient records"
      subtitle={`${patients.length} patients in your care`}
    >
      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 
                       bg-white border-2 border-gray-300 rounded-lg 
                       text-sm font-semibold text-black placeholder-gray-400
                       focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
          <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No patients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/vet/patients/${p.id}`)}
              className="bg-white rounded-2xl border border-gray-200 p-5 text-left"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-black">
                    {p.name?.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-black truncate">
                    {p.name}
                  </h3>
                  <p className="text-xs font-semibold text-gray-600 truncate">
                    {p.breed} · {p.gender}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{p.owner_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{p.owner_phone}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-600">
                  {p.visit_count || 0} visits
                </span>
                {p.last_visit && (
                  <span className="font-semibold text-gray-500">
                    {new Date(p.last_visit).toLocaleDateString()}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}