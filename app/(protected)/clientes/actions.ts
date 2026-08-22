'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function listarClientes() {
  return await prisma.cliente.findMany({
    orderBy: { nome: 'asc' },
  })
}

export async function buscarClientePorId(id: string) {
  return await prisma.cliente.findUnique({
    where: { id },
  })
}

export async function criarCliente(formData: FormData) {
  const nome = formData.get('nome') as string
  const whatsapp = formData.get('whatsapp') as string
  const instagram = formData.get('instagram') as string
  const canal = formData.get('canal') as string

  if (!nome) return

  await prisma.cliente.create({
    data: {
      nome,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
      canal: canal || null,
    },
  })

  revalidatePath('/clientes')
}

export async function atualizarCliente(id: string, formData: FormData) {
  const nome = formData.get('nome') as string
  const whatsapp = formData.get('whatsapp') as string
  const instagram = formData.get('instagram') as string
  const canal = formData.get('canal') as string

  if (!nome) return

  await prisma.cliente.update({
    where: { id },
    data: {
      nome,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
      canal: canal || null,
    },
  })

  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function inativarCliente(id: string) {
  await prisma.cliente.update({
    where: { id },
    data: { ativo: false },
  })

  revalidatePath('/clientes')
}

export async function reativarCliente(id: string) {
  await prisma.cliente.update({
    where: { id },
    data: { ativo: true },
  })

  revalidatePath('/clientes')
}