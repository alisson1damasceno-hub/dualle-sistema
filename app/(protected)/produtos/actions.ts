'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function listarProdutos() {
  return await prisma.produto.findMany({
    orderBy: { nome: 'asc' },
  })
}

export async function buscarProdutoPorId(id: string) {
  return await prisma.produto.findUnique({
    where: { id },
  })
}

export async function criarProduto(formData: FormData) {
  const nome = formData.get('nome') as string
  const categoria = formData.get('categoria') as string
  const descricao = formData.get('descricao') as string
  const margemLucro = parseFloat(formData.get('margemLucro') as string)

  if (!nome || isNaN(margemLucro)) return

  await prisma.produto.create({
    data: {
      nome,
      categoria: categoria || null,
      descricao: descricao || null,
      margemLucro,
    },
  })

  revalidatePath('/produtos')
}

export async function atualizarProduto(id: string, formData: FormData) {
  const nome = formData.get('nome') as string
  const categoria = formData.get('categoria') as string
  const descricao = formData.get('descricao') as string
  const margemLucro = parseFloat(formData.get('margemLucro') as string)

  if (!nome || isNaN(margemLucro)) return

  await prisma.produto.update({
    where: { id },
    data: {
      nome,
      categoria: categoria || null,
      descricao: descricao || null,
      margemLucro,
    },
  })

  revalidatePath('/produtos')
  redirect('/produtos')
}

export async function deletarProduto(id: string) {
  await prisma.produto.delete({
    where: { id },
  })

  revalidatePath('/produtos')
}