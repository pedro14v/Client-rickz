// 'use server'
// import { Client, LocalAuth } from 'whatsapp-web.js';
// import qrcode from 'qrcode';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// interface ClientInstance {
//   client: Client;
//   qrCode: string | null;
//   isReady: boolean;
// }

// const clients: { [key: string]: ClientInstance } = {};

// export const createClient = async (userId: string) => {
//   if (clients[userId]) {
//     return clients[userId];
//   }

//   const client = new Client({
//     authStrategy: new LocalAuth({ clientId: userId, dataPath: './.wwebjs_auth' })
//   });

//   let qrCode: string | null = null;
//   let isReady = false;

//   client.on('qr', (qr) => {
//     console.log(`QR RECEIVED---- for ${userId}`);
//     qrCode = qr;
//   });

//   client.on('ready', async () => {
//     console.log(`Client is ready for ${userId}`);
//     isReady = true;
//     // Salvar a sessão no banco de dados
//     await prisma.authSessionWhatsapp.create({
//       data: {
//         userId: parseInt(userId),
//         sessionId: client.pupPage ? client.pupPage.target()._targetId : "no-session-id",
//       }
//     });
//   });

//   client.initialize();

//   await new Promise<void>((resolve) => {
//     const interval = setInterval(async () => {
//       if (qrCode !== null) {
//         clearInterval(interval);
//         resolve();
//       }
//     }, 1000);
//   });

//   clients[userId] = { client, qrCode, isReady };
  
//   return clients[userId];
// };

// export const getQRCode = async (userId: string) => {
//   const clientInstance = await createClient(userId);
//   console.log(clientInstance.qrCode)
//   if (clientInstance.qrCode) {
//     return await qrcode.toDataURL(clientInstance.qrCode);
//   }
//   throw new Error('QR code not available');
// };

// export const destroyClient = async (userId: string) => {
//   if (clients[userId]) {
//     clients[userId].client.destroy();
//     delete clients[userId];
//     // Remover a sessão do banco de dados
//     await prisma.authSessionWhatsapp.deleteMany({
//       where: {
//         userId: parseInt(userId)
//       }
//     });
//     console.log(`Client destroyed for ${userId}`);
//   }
// };

// export const restoreSessions = async () => {
//   const sessions = await prisma.authSessionWhatsapp.findMany();
//   for (const session of sessions) {
//     await createClient(session.userId.toString());
//   }
// };

// export const isClientOnline = (userId: string): boolean => {
//   const clientInstance = clients[userId];
//   return clientInstance ? clientInstance.isReady : false;
// };
