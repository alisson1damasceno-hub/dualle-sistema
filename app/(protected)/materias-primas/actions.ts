'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function listarMateriasPrimas() {
  return await prisma.materiaPrima.findMany({
    orderBy: { nome: 'asc' },
  })
}

export async function criarMateriaPrima(formData: FormData) {
  const nome = formData.get('nome') as string
  const unidade = formData.get('unidade') as string
  const precoUnitario = parseFloat(formData.get('precoUnitario') as string)

  if (!nome || !unidade || isNaN(precoUnitario)) return

  await prisma.materiaPrima.create({
    data: { nome, unidade, precoUnitario },
  })

  revalidatePath('/materias-primas')
}

export async function deletarMateriaPrima(id: string) {
  await prisma.materiaPrima.delete({
    where: { id },
  })

  revalidatePath('/materias-primas')
}

export async function buscarMateriaPrimaPorId(id: string) {
  return await prisma.materiaPrima.findUnique({
    where: { id },
  })
}

export async function atualizarMateriaPrima(id: string, formData: FormData) {
  const nome = formData.get('nome') as string
  const unidade = formData.get('unidade') as string
  const precoUnitario = parseFloat(formData.get('precoUnitario') as string)

  if (!nome || !unidade || isNaN(precoUnitario)) return

  await prisma.materiaPrima.update({
    where: { id },
    data: { nome, unidade, precoUnitario },
  })

  revalidatePath('/materias-primas')
}