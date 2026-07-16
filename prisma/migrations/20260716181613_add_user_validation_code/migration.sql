-- CreateTable
CREATE TABLE "UserValidationCode" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UserValidationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserValidationCode_user_id_key" ON "UserValidationCode"("user_id");

-- AddForeignKey
ALTER TABLE "UserValidationCode" ADD CONSTRAINT "UserValidationCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
