'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/session'
import { Client } from 'pg'

function getDbClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const client = getDbClient()
  try {
    await client.connect()
    const res = await client.query(
      'SELECT * FROM public.app_users WHERE email = $1 LIMIT 1',
      [email]
    )

    if (res.rows.length === 0) {
      return { error: 'Email atau password salah.' }
    }

    const user = res.rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return { error: 'Email atau password salah.' }
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (err) {
    console.error('Login error:', err)
    return { error: 'Terjadi kesalahan server. Coba lagi.' }
  } finally {
    await client.end()
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getCurrentUser() {
  const { getSession } = await import('@/lib/session')
  return getSession()
}

export async function updateProfile(data: { name: string; email?: string; password?: string }) {
  const session = await getCurrentUser()
  if (!session) throw new Error('Not authenticated')

  const client = getDbClient()
  try {
    await client.connect()
    
    let query = 'UPDATE public.app_users SET name = $1'
    let values: any[] = [data.name]
    let paramIndex = 2
    
    if (data.email) {
      query += `, email = $${paramIndex}`
      values.push(data.email)
      paramIndex++
    }

    if (data.password) {
      const hash = await bcrypt.hash(data.password, 10)
      query += `, password_hash = $${paramIndex}`
      values.push(hash)
      paramIndex++
    }
    
    query += ` WHERE id = $${paramIndex}`
    values.push(session.id)
    
    await client.query(query, values)
    
    await createSession({
      ...session,
      name: data.name,
      email: data.email || session.email
    })

    return { success: true }
  } catch (err) {
    console.error('Update profile error:', err)
    throw new Error('Gagal memperbarui profil')
  } finally {
    await client.end()
  }
}
