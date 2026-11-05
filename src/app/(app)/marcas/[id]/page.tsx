import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { PageHeader } from "@/components/ui";
import { BrandForm } from "../BrandForm";

export default async function EditBrandPage({ params }: PageProps<"/marcas/[id]">) {
  const { id } = await params;
  const [brand] = await db.select().from(schema.brands).where(eq(schema.brands.id, Number(id)));
  if (!brand) notFound();
  return (
    <>
      <PageHeader eyebrow="Mis marcas" title={brand.name} />
      <BrandForm brand={brand} />
    </>
  );
}
