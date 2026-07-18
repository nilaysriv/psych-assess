import { TemplateBuilder } from "../template-builder";

export default function NewTemplatePage() {
  return (
    <TemplateBuilder
      initial={{
        title: "",
        description: "",
        questions: [],
      }}
    />
  );
}
