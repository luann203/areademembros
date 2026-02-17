import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware mínimo - apenas passa a requisição adiante sem processar nada
  // Isso evita qualquer problema com Edge Runtime ou dependências
  return NextResponse.next()
}

// Matcher vazio desabilita o middleware completamente
// Se precisar reativar, adicione rotas específicas aqui
export const config = {
  matcher: [
    // Desabilitado temporariamente para evitar erros no Edge Runtime
    // '/dashboard/:path*',
  ],
}
