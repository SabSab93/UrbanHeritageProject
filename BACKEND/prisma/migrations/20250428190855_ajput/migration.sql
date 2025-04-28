-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_anonymised" BOOLEAN NOT NULL DEFAULT false;
