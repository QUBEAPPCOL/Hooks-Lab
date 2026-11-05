import { PageHeader } from "@/components/ui";
import { BrandForm } from "../BrandForm";

export default function NewBrandPage() {
  return (
    <>
      <PageHeader eyebrow="Mis marcas" title="Nueva marca" />
      <BrandForm />
    </>
  );
}
