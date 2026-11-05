import { PageHeader, Empty } from "@/components/ui";

export default function ResultsPage() {
  return (
    <>
      <PageHeader eyebrow="Mis resultados · Fase 5" title="Aprendizaje">
        Aquí registrarás tus publicaciones y sus métricas (impresiones, comentarios, guardados, clics, leads, ventas) para comparar mecanismos, tonos y estructuras por marca y plataforma.
      </PageHeader>
      <Empty>
        Se construye en la Fase 5. Regla de diseño: el sistema avisará cuando la muestra sea insuficiente (menos de 10 publicaciones por grupo) y no atribuirá el resultado a una sola variable.
      </Empty>
    </>
  );
}
