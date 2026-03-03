import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KycUploadForm } from './kyc-upload-form';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function KycPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, kyc_verified')
    .eq('user_id', user.id)
    .single();
  if (!profile) redirect('/login');

  const { data: documents } = await supabase
    .from('kyc_documents')
    .select('id, document_type, status, created_at, rejection_reason')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Identity verification (KYC)</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Upload a government-issued ID to verify your account.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {profile.kyc_verified ? (
          <Badge variant="success" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified
          </Badge>
        ) : (
          <Badge variant="warning">Not verified</Badge>
        )}
      </div>

      {!profile.kyc_verified && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <FileText className="h-5 w-5" />
            Upload government-issued ID
          </h2>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Accepted: passport, national ID, or driver&apos;s license. JPEG, PNG, WebP, or PDF. Max 10MB.
          </p>
          <KycUploadForm />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 px-4 py-3 font-medium text-slate-900 dark:border-slate-800 dark:text-white">
          Your submissions
        </h2>
        <div className="overflow-x-auto">
          {documents?.length ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {documents.map((d: Record<string, unknown>) => (
                  <tr key={d.id as string}>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      Government ID
                    </td>
                    <td className="px-4 py-3">
                      {d.status === 'approved' && <Badge variant="success">Approved</Badge>}
                      {d.status === 'rejected' && <Badge variant="error">Rejected</Badge>}
                      {d.status === 'pending' && <Badge variant="warning">Pending review</Badge>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(d.created_at as string)}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {d.status === 'rejected' && (d.rejection_reason as string) ? (
                        <span className="text-amber-600 dark:text-amber-400">{d.rejection_reason as string}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No submissions yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
