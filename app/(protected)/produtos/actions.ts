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

export async function inativarProduto(id: string) {
  await prisma.produto.update({
    where: { id },
    data: { ativo: false },
  })

  revalidatePath('/produtos')
}

export async function reativarProduto(id: string) {
  await prisma.produto.update({
    where: { id },
    data: { ativo: true },
  })

  revalidatePath('/produtos')
}

export async function listarItensFicha(produtoId: string) {
  return await prisma.itemFicha.findMany({
    where: { produtoId },
    include: { materiaPrima: true },
    orderBy: { materiaPrima: { nome: 'asc' } },
  })
}

export async function adicionarItemFicha(produtoId: string, formData: FormData) {
  const materiaPrimaId = formData.get('materiaPrimaId') as string
  const quantidade = parseFloat(formData.get('quantidade') as string)

  if (!materiaPrimaId || isNaN(quantidade) || quantidade <= 0) return

  await prisma.itemFicha.create({
    data: {
      produtoId,
      materiaPrimaId,
      quantidade,
    },
  })

  revalidatePath(`/produtos/${produtoId}/editar`)
}

export async function removerItemFicha(itemId: string, produtoId: string) {
  await prisma.itemFicha.delete({
    where: { id: itemId },
  })

  revalidatePath(`/produtos/${produtoId}/editar`)
}