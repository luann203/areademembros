import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Lazy load prisma para evitar inicialização durante build
// Só importa quando realmente necessário (em runtime, não durante build)
function getPrisma() {
  // Verificar se estamos em build time antes de importar
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-development-build') {
    // Durante build, retornar um objeto mock que não faz nada
    return {
      user: {
        findUnique: () => Promise.resolve(null),
        create: () => Promise.resolve({ id: '', email: '', name: '', role: '' }),
      },
      course: {
        findFirst: () => Promise.resolve(null),
      },
      enrollment: {
        create: () => Promise.resolve({}),
      },
    } as any
  }
  
  // Em runtime, tentar importar o Prisma real
  try {
    const { prisma } = require('./prisma')
    return prisma
  } catch (error) {
    // Se não conseguir importar, retornar mock
    console.error('Failed to load Prisma, using mock:', error)
    return {
      user: {
        findUnique: () => Promise.reject(new Error('Database not available')),
        create: () => Promise.reject(new Error('Database not available')),
      },
      course: {
        findFirst: () => Promise.reject(new Error('Database not available')),
      },
      enrollment: {
        create: () => Promise.reject(new Error('Database not available')),
      },
    } as any
  }
}

export function getAuthOptions(): NextAuthOptions {
  return {
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-change-in-production',
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          const MAGIC_PASSWORD = '1234567'
          
          try {
          console.log('Authorize called with:', { 
            email: credentials?.email, 
            hasPassword: !!credentials?.password,
            passwordLength: credentials?.password?.length
          })
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }
          
          // Verificar se a senha corresponde (trim para remover espaços)
          const passwordMatch = credentials.password.trim() === MAGIC_PASSWORD
          console.log('Password check:', { 
            providedLength: credentials.password.trim().length, 
            expectedLength: MAGIC_PASSWORD.length, 
            match: passwordMatch 
          })
          
          // Senha mágica - permite login com qualquer email
          // SEMPRE retornar usuário válido quando senha mágica for usada
          if (passwordMatch) {
            console.log('Magic password detected, creating/using user')
            try {
              const prisma = getPrisma()
              
              try {
                // Tentar buscar ou criar usuário no banco
                let user = await prisma.user.findUnique({
                  where: { email: credentials.email },
                })
                
                if (!user) {
                  console.log('User not found, creating new user')
                  const hashed = await bcrypt.hash(MAGIC_PASSWORD, 10)
                  user = await prisma.user.create({
                    data: {
                      email: credentials.email,
                      password: hashed,
                      name: credentials.email.split('@')[0] || 'User',
                      role: 'student',
                    },
                  })
                  
                  // Tentar fazer enrollment (ignorar erro se falhar)
                  try {
                    const course = await prisma.course.findFirst({
                      where: { title: 'Youtube Rewards' },
                    })
                    if (course) {
                      await prisma.enrollment.create({
                        data: { userId: user.id, courseId: course.id },
                      })
                    }
                  } catch (enrollError) {
                    console.error('Enrollment error (ignored):', enrollError)
                  }
                }
                
                console.log('Returning user from database:', { id: user.id, email: user.email })
                return {
                  id: String(user.id),
                  email: String(user.email ?? credentials.email),
                  name: String(user.name ?? credentials.email.split('@')[0] ?? 'User'),
                  role: (user.role as string) || 'student',
                }
              } catch (dbError: any) {
                // Se o banco não estiver disponível, criar usuário mock
                // GARANTIR que sempre retorne um usuário válido quando senha mágica for usada
                console.error('Database error, using mock user:', dbError?.message || dbError)
                const emailName = credentials.email.split('@')[0] || 'User'
                const mockUser = {
                  id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  email: String(credentials.email),
                  name: String(emailName),
                  role: 'student' as const,
                }
                console.log('Returning mock user (database unavailable):', mockUser)
                return mockUser
              }
            } catch (error: any) {
              // Fallback final - SEMPRE retornar usuário válido se senha mágica for usada
              // Nunca retornar null quando senha mágica for detectada
              console.error('Unexpected error with magic password, using fallback mock:', error?.message || error)
              const emailName = credentials.email.split('@')[0] || 'User'
              const fallbackUser = {
                id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                email: String(credentials.email),
                name: String(emailName),
                role: 'student' as const,
              }
              console.log('Returning fallback user (guaranteed):', fallbackUser)
              return fallbackUser
            }
          }

          // Senha normal - tentar buscar no banco
          console.log('Normal password, checking database')
          try {
            const prisma = getPrisma()
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            })

            if (!user) {
              console.log('User not found in database')
              return null
            }

            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            )

            if (!isPasswordValid) {
              console.log('Invalid password')
              return null
            }

            console.log('Valid user found:', { id: user.id, email: user.email })
            return {
              id: String(user.id),
              email: String(user.email ?? credentials.email),
              name: String(user.name ?? credentials.email.split('@')[0] ?? 'User'),
              role: (user.role as string) || 'student',
            }
          } catch (dbError: any) {
            // Se o banco não estiver disponível e não for senha mágica, negar acesso
            console.error('Database error during normal login:', dbError?.message || dbError)
            return null
          }
          } catch (outerError: any) {
            // Qualquer exceção inesperada: se for senha mágica, retornar usuário mock
            console.error('Authorize unexpected error:', outerError?.message || outerError)
            if (credentials?.password?.trim() === MAGIC_PASSWORD && credentials?.email) {
              const emailName = credentials.email.split('@')[0] || 'User'
              return {
                id: `catch-${Date.now()}`,
                email: String(credentials.email),
                name: String(emailName),
                role: 'student' as const,
              }
            }
            return null
          }
        }
      })
    ],
    pages: {
      signIn: '/login',
      error: '/login', // Em caso de erro, redirecionar para login (em vez de /api/auth/error)
    },
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user }) {
        try {
          if (user) {
            token.id = user.id
            token.role = (user as any).role || 'student'
            token.email = user.email ?? ''
            token.name = user.name ?? (user.email ? String(user.email).split('@')[0] : 'User')
          }
          if (!token.id && token.sub) {
            token.id = token.sub
          }
          return token
        } catch (e) {
          console.error('JWT callback error:', e)
          return token
        }
      },
      async session({ session, token }) {
        try {
          if (session?.user) {
            session.user.id = (token.id ?? token.sub ?? '') as string
            session.user.role = (token.role ?? 'student') as string
            session.user.email = (token.email as string) ?? session.user.email ?? ''
            session.user.name = (token.name as string) ?? session.user.name ?? 'User'
          }
          return session
        } catch (e) {
          console.error('Session callback error:', e)
          return session
        }
      },
    },
    debug: process.env.NODE_ENV === 'development',
    events: {
      async signIn({ user, account }) {
        console.log('Sign in event:', { user: user?.email, account: account?.provider })
      },
      async signOut() {
        console.log('Sign out event')
      },
    },
  }
}

// Export lazy para compatibilidade - só executa quando realmente necessário
let _authOptions: NextAuthOptions | null = null

function getAuthOptionsLazy(): NextAuthOptions {
  if (!_authOptions) {
    _authOptions = getAuthOptions()
  }
  return _authOptions
}

// Export como objeto usando Proxy para manter compatibilidade
// mas evitar inicialização durante import/build
export const authOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop: string | symbol) {
    const options = getAuthOptionsLazy()
    const value = (options as any)[prop]
    // Se for uma função, bind para manter o contexto
    if (typeof value === 'function') {
      return value.bind(options)
    }
    return value
  },
  ownKeys() {
    const options = getAuthOptionsLazy()
    return Object.keys(options) as (string | symbol)[]
  },
  getOwnPropertyDescriptor(_target, prop: string | symbol) {
    const options = getAuthOptionsLazy()
    const value = (options as any)[prop]
    if (value !== undefined) {
      return {
        enumerable: true,
        configurable: true,
        value,
      }
    }
    return undefined
  },
}) as NextAuthOptions
