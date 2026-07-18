-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('single_choice', 'multi_choice', 'likert', 'numeric', 'short_text', 'long_text');

-- CreateEnum
CREATE TYPE "InstanceStatus" AS ENUM ('pending', 'completed', 'expired', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_templates" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "has_scoring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "subscale" TEXT,
    "config" JSONB NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_rules" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "severity_bands" JSONB NOT NULL DEFAULT '[]',
    "subscales" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "scoring_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_instances" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InstanceStatus" NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_answers" JSONB NOT NULL,
    "total_score" INTEGER,
    "subscale_scores" JSONB,
    "severity_label" TEXT,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "clients_owner_id_idx" ON "clients"("owner_id");

-- CreateIndex
CREATE INDEX "assessment_templates_owner_id_idx" ON "assessment_templates"("owner_id");

-- CreateIndex
CREATE INDEX "questions_template_id_idx" ON "questions"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "scoring_rules_template_id_key" ON "scoring_rules"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_instances_token_key" ON "assessment_instances"("token");

-- CreateIndex
CREATE INDEX "assessment_instances_template_id_idx" ON "assessment_instances"("template_id");

-- CreateIndex
CREATE INDEX "assessment_instances_client_id_idx" ON "assessment_instances"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "responses_instance_id_key" ON "responses"("instance_id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assessment_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_rules" ADD CONSTRAINT "scoring_rules_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assessment_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_instances" ADD CONSTRAINT "assessment_instances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assessment_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_instances" ADD CONSTRAINT "assessment_instances_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "assessment_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
