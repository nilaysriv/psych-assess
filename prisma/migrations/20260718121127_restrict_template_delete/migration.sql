-- DropForeignKey
ALTER TABLE "assessment_instances" DROP CONSTRAINT "assessment_instances_template_id_fkey";

-- AddForeignKey
ALTER TABLE "assessment_instances" ADD CONSTRAINT "assessment_instances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assessment_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
