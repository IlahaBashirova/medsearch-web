import { pharmaciesMock } from "./mockData.js";

export async function searchPharmacies(query) {
  await new Promise((r) => setTimeout(r, 350));

  // Dizayn mərhələsi: dərman adına görə aptekləri backend hesablayacaq.
  // Hələlik hər query üçün bütün aptekləri göstəririk ki, UI boş qalmasın.
  const q = (query || "").trim();
  if (!q) return pharmaciesMock;

  return pharmaciesMock;
}

export async function getPharmacyById(id) {
  await new Promise((r) => setTimeout(r, 250));
  const found = pharmaciesMock.find((p) => String(p.id) === String(id));
  if (!found) throw new Error("Aptek tapılmadı");
  return found;
}