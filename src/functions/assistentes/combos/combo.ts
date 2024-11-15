'use server'
import { PrismaClient } from "@prisma/client"   

const prisma = new PrismaClient()


export async function criarCombo(data: any) {
    const { nome, descricao, campos , userEmail, produtos } = data

    const combo = await prisma.combos.create({
        data: {
            nome,
            descricao,
            campos,
            userEmail,
        }
    }).then((res:any) => {
        console.log(res)
        return {
            status: 'success',
            id: res.id,
            result: res
        }
    }).catch((err) => {
        console.log(err)
        return {
            status: 'error',
        }
    }) as any

    if(combo.id)    {
        const produtosDoCombo = await prisma.produtosDoCombo.create({
            data: {
                comboId: combo.id,
                JSON: produtos
            }
        }).then((res) => {
            console.log(res)
            return {
                status: 'success'
            }
        }).catch((err) => {
            console.log(err)
            return {
                status: 'error'
            }
        })
    }

  

    return combo
}

export async function getCombos(userEmail: string, id?: string, email?: string) {
    const combos = await prisma.combos.findMany({
        where: {
            id: id ? id : undefined,
            userEmail
        }
    }).then((res) => {
        return res
    }).catch((err) => {
        return false
    })
    
    return combos
}

export async function addProdutoNoCombo(data: any) {
    const { comboID, produto } = JSON.parse(data)
    console.log(comboID, produto)

    const combo = await prisma.produtosDoCombo.upsert({
        where: {
            comboId: comboID,
        },
        update: {
            JSON: produto
        },
        create: {
            comboId: comboID,
            JSON: produto
        }
    }).then((res) => {
        console.log(res)
        return {
            status: 'success'
        }
    }).catch((err) => {
        console.log(err)
        return {
            status: 'error'
        }
    })
        

    

    return combo
}

export async function getProdutosDoCombo(comboID: string) {
    const produtos = await prisma.produtosDoCombo.findUnique({
        where: {
            comboId: comboID
        }
    }).then((res) => {
        return res
    }).catch((err) => {
        return false
    })
    
    return produtos
}

export async function removeProdutoDoCombo(data: any) {
    const { comboID, produto } = JSON.parse(data)
    console.log(comboID, produto)

    const combo = await prisma.produtosDoCombo.update({
        where: {
            comboId: comboID
        },
        data: {
            JSON: [...produto]
        }
    }).then((res) => {
        console.log(res)
        return {
            status: 'success'
        }
    }).catch((err) => {
        console.log(err)
        return {
            status: 'error'
        }
    })

    

    return combo
}

export async function deleteCombo(comboID: string) {
    const combo = await prisma.combos.delete({
        where: {
            id: comboID
        }
    }).then((res) => {
        return {
            status: 'success'
        }
    }).catch((err) => {
        return {
            status: 'error'
        }
    })

    return combo
}

export async function ativarCombo(comboID: string , assistenteID: string) {
    console.log(comboID, assistenteID)
    const combo = await prisma.assistente.update({
        where: {
            id: assistenteID
        },
        data: {
            comboId: comboID
        }
    }).then((res) => {
        console.log(res)
        return {
            status: 'success'
        }
    }).catch((err) => {
        console.log(err)
        return {
            status: 'error'
        }
    })

    return combo
}