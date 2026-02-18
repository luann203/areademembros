import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChevronRight, Play } from 'lucide-react'

export default async function DemoLessonPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#6932CB]">
          Contents
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 font-medium">Aula demonstrativa</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 text-sm text-[#6932CB] font-medium mb-2">
            <Play className="w-4 h-4" />
            Demonstração
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-4">
            Aula demonstrativa
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            Esta é uma aula de exemplo. Quando você configurar um banco de dados (por exemplo
            Vercel Postgres) e adicionar cursos e matrículas, os seus cursos reais aparecerão
            em Contents e Classes, e você poderá assistir às aulas com progresso e certificado.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Para ver seus cursos:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>No Vercel: Storage → Create Database (ex.: Postgres)</li>
              <li>Defina a variável <code className="bg-gray-200 px-1 rounded">DATABASE_URL</code> no projeto</li>
              <li>Ajuste o schema do Prisma para <code className="bg-gray-200 px-1 rounded">postgresql</code> e rode as migrations</li>
            </ul>
          </div>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: '#6932CB' }}
            >
              Voltar ao Contents
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
