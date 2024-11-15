-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'GERENTE', 'ATENDENTE', 'USER');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "whatsapp" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT DEFAULT 'ADMIN',
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "website" TEXT,
    "nameBusiness" TEXT,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '{"assistentes": "ALL" , "ensinamentos": "false" , "newAssistente": "false" }',
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionWhatsapp" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "assistenteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Inativo',
    "imageProfile" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionWhatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionInstagram" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "assistenteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Inativo',
    "imageProfile" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionInstagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTelegram" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "assistenteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Inativo',
    "imageProfile" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTelegram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionInstagramMsgs" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "assistenteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionInstagramMsgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTelegramMsgs" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "telegramID" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "assistenteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTelegramMsgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionWhatsappMsgs" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "assistenteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionWhatsappMsgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistente" (
    "id" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "userToken" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "image" TEXT DEFAULT '/perfil-img-default/3.webp',
    "status" TEXT DEFAULT 'Ativo',
    "comunicacao" TEXT DEFAULT 'FORMAL',
    "finalidade" TEXT DEFAULT 'VENDAS',
    "vectorStore" TEXT,
    "treinamento" TEXT,
    "treinamentoHttp" TEXT,
    "assistenteIdGPT" TEXT,
    "threadTreiamento" TEXT,
    "comboId" TEXT,
    "modelo" TEXT DEFAULT 'GPT-3.5 TURBO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assistente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creditos" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "creditos" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creditos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Combos" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" VARCHAR(1000),
    "campos" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Combos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutosDoCombo" (
    "id" TEXT NOT NULL,
    "combo_id" TEXT NOT NULL,
    "JSON" JSONB NOT NULL,

    CONSTRAINT "ProdutosDoCombo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SessionWhatsapp_user_id_key" ON "SessionWhatsapp"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SessionWhatsapp_sessionId_key" ON "SessionWhatsapp"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionWhatsapp_assistenteId_key" ON "SessionWhatsapp"("assistenteId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInstagram_user_id_key" ON "SessionInstagram"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInstagram_sessionId_key" ON "SessionInstagram"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInstagram_assistenteId_key" ON "SessionInstagram"("assistenteId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTelegram_user_id_key" ON "SessionTelegram"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTelegram_sessionId_key" ON "SessionTelegram"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTelegram_assistenteId_key" ON "SessionTelegram"("assistenteId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInstagramMsgs_userPhone_key" ON "SessionInstagramMsgs"("userPhone");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTelegramMsgs_telegramID_key" ON "SessionTelegramMsgs"("telegramID");

-- CreateIndex
CREATE UNIQUE INDEX "SessionWhatsappMsgs_userPhone_key" ON "SessionWhatsappMsgs"("userPhone");

-- CreateIndex
CREATE UNIQUE INDEX "Assistente_authToken_key" ON "Assistente"("authToken");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userEmail_key" ON "Admin"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Creditos_user_id_key" ON "Creditos"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutosDoCombo_combo_id_key" ON "ProdutosDoCombo"("combo_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionWhatsapp" ADD CONSTRAINT "SessionWhatsapp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInstagram" ADD CONSTRAINT "SessionInstagram_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTelegram" ADD CONSTRAINT "SessionTelegram_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInstagramMsgs" ADD CONSTRAINT "SessionInstagramMsgs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SessionInstagram"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTelegramMsgs" ADD CONSTRAINT "SessionTelegramMsgs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SessionTelegram"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionWhatsappMsgs" ADD CONSTRAINT "SessionWhatsappMsgs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SessionWhatsapp"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistente" ADD CONSTRAINT "Assistente_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creditos" ADD CONSTRAINT "Creditos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Combos" ADD CONSTRAINT "Combos_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutosDoCombo" ADD CONSTRAINT "ProdutosDoCombo_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "Combos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
