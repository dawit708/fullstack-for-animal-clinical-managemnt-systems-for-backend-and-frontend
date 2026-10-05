import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Shield, CheckCircle, AlertTriangle, Key } from 'lucide-react';

export default function Security() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/admin/security');
        setData(data.security);
      } catch (err) {
        toast.error('Failed to load security data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Security & access">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  const score = data?.score || 0;
  const circumference = 2 * Math.PI * 56;

  return (
    <DashboardLayout title="Security & access" subtitle="Platform security posture">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 text-green-600 rounded-xl mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Security Score</h3>
          
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="56" stroke="#e5e7eb" strokeWidth="10" fill="none" />
              <circle cx="80" cy="80" r="56" stroke="#10b981" strokeWidth="10" fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - score / 100)}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">{score}</span>
              <span className="text-xs text-gray-500">out of 100</span>
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium mt-4">
            {data?.no_critical_findings ? '✅ Strong security' : '⚠️ Needs review'}
          </p>
          <p className="text-xs text-gray-500 mt-1">MFA enforced for all staff</p>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <InfoCard
            icon={CheckCircle}
            color="green"
            title="Access Review"
            description="Verify user permissions and active accounts"
            status={data?.access_review?.needed ? 'warn' : 'ok'}
            note={data?.access_review?.needed ? `${data.access_review.count} accounts need review` : 'All up to date'}
          />
          <InfoCard
            icon={Shield}
            color="blue"
            title="Nightly Backup"
            description="Automatic daily database backups"
            status="ok"
            note={data?.last_backup ? `Last: ${data.last_backup.backup_name}` : 'No recent backup'}
          />
          <InfoCard
            icon={Key}
            color="orange"
            title="Credentials Expiring"
            description="Staff licenses and certifications"
            status={data?.credentials_expiring?.count > 0 ? 'warn' : 'ok'}
            note={`${data?.credentials_expiring?.count || 0} credentials`}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ icon: Icon, color, title, description, status, note }) {
  const colors = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          {status === 'ok' ? (
            <span className="text-green-600 font-medium">✅ {note}</span>
          ) : (
            <span className="text-orange-600 font-medium">⚠️ {note}</span>
          )}
        </div>
      </div>
    </div>
  );
}