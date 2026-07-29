import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

async function getContract(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*, customers(full_name)')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }
  
  return data;
}

interface ContractPortalPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ContractPortalPage({ params }: ContractPortalPageProps) {
  const contract = await getContract(params.id);

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Contrato de Prestação de Serviços</h1>
        
        {/* Renderiza o conteúdo do contrato. O ideal seria usar uma lib como 'marked' para converter para HTML */}
        <div 
          className="prose prose-sm sm:prose-base max-w-none"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {contract.content_final}
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Gerado em: {new Date(contract.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    </main>
  );
}
