-- CreateEnum
CREATE TYPE "OauthType" AS ENUM ('github', 'kakao');

-- CreateEnum
CREATE TYPE "ArticleBodyFormat" AS ENUM ('html', 'md', 'txt');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('pending', 'active', 'deleted');

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "status" "ArticleStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "posted_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_snapshots" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body_url" TEXT NOT NULL,
    "body_format" "ArticleBodyFormat" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "article_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_snapshot_attachments" (
    "id" UUID NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "attachment_id" UUID NOT NULL,

    CONSTRAINT "article_snapshot_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "parent_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_snapshots" (
    "id" UUID NOT NULL,
    "comment_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "comment_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_snapshot_attachments" (
    "id" UUID NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "attachment_id" UUID NOT NULL,

    CONSTRAINT "comment_snapshot_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentications" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "oauth_type" "OauthType" NOT NULL,
    "oauth_sub" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "authentications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_snapshots" ADD CONSTRAINT "article_snapshots_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_snapshot_attachments" ADD CONSTRAINT "article_snapshot_attachments_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "article_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_snapshot_attachments" ADD CONSTRAINT "article_snapshot_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_snapshots" ADD CONSTRAINT "comment_snapshots_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_snapshot_attachments" ADD CONSTRAINT "comment_snapshot_attachments_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "comment_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_snapshot_attachments" ADD CONSTRAINT "comment_snapshot_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authentications" ADD CONSTRAINT "authentications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
