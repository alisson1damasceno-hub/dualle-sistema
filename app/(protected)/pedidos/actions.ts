'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── LISTAR ────────────────────────────────────────────────────────────────

export async function listarPedidos() {
  return await prisma.pedido.findMany({
    orderBy: { criadoEm: 'desc' },
    include: {
      cliente: true,         // traz os dados do cliente junto
      itens: {
        include: {
          produto: true,     // traz os dados do produto em cada item
        },
      },
    },
  })
}

// ─── BUSCAR POR ID ──────────────────────────────────────────────────────────

export async function buscarPedidoPorId(id: string) {
  return await prisma.pedido.findUnique({
    where: { id },
    include: {
      cliente: true,
      itens: {
        include: { produto: true },
        orderBy: { produto: { nome: 'asc' } },
      },
    },
  })
}

// ─── CRIAR PEDIDO ──────────────────────────────────────────────────────────

export async function criarPedido(formData: FormData) {
  const clienteId = formData.get('clienteId') as string
  const canal = formData.get('canal') as string
  const canalPedidoId = formData.get('canalPedidoId') as string
  const prazoRaw = formData.get('prazo') as string
  const observacoes = formData.get('observacoes') as string

  const pedido = await prisma.pedido.create({
    data: {
      clienteId: clienteId || null,       // null se não selecionou cliente
      canal: canal || 'direto',
      canalPedidoId: canalPedidoId || null,
      prazo: prazoRaw ? new Date(prazoRaw) : null,  // converte string → Date
      observacoes: observacoes || null,
    },
  })

  // Após criar, vai direto para a página de detalhe do pedido
  revalidatePath('/pedidos')
  redirect(`/pedidos/${pedido.id}`)
}

// ─── ADICIONAR ITEM AO PEDIDO ───────────────────────────────────────────────

export async function adicionarItemPedido(pedidoId: string, formData: FormData) {
  const produtoId = formData.get('produtoId') as string
  const quantidade = parseInt(formData.get('quantidade') as string)
  const especificacoes = formData.get('especificacoes') as string

  if (!produtoId || isNaN(quantidade) || quantidade <= 0) return

  // Busca o produto para capturar o preço ATUAL — esse será o snapshot
  const produto = await prisma.produto.findUnique({
    where: { id: produtoId },
  })

  if (!produto || !produto.precoVenda) return  // produto precisa ter preço definido

  await prisma.itemPedido.create({
    data: {
      pedidoId,
      produtoId,
      quantidade,
      precoUnitario: produto.precoVenda,   // SNAPSHOT: salva o preço de agora
      especificacoes: especificacoes || null,
    },
  })

  revalidatePath(`/pedidos/${pedidoId}`)
}

// ─── REMOVER ITEM DO PEDIDO ─────────────────────────────────────────────────

export async function removerItemPedido(itemId: string, pedidoId: string) {
  await prisma.itemPedido.delete({
    where: { id: itemId },
  })

  revalidatePath(`/pedidos/${pedidoId}`)
}

// ─── ATUALIZAR STATUS ───────────────────────────────────────────────────────

export async function atualizarStatusPedido(id: string, status: string) {
  await prisma.pedido.update({
    where: { id },
    data: { status },
  })

  revalidatePath(`/pedidos/${id}`)
  revalidatePath('/pedidos')
}

// ─── MARCAR COMO PAGO / NÃO PAGO ───────────────────────────────────────────

export async function alternarPagamento(id: string, pago: boolean) {
  await prisma.pedido.update({
    where: { id },
    data: { pago },
  })

  revalidatePath(`/pedidos/${id}`)
  revalidatePath('/pedidos')
}