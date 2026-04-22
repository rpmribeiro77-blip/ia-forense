export type VocabField = {
  label: string;
  value: string;
};

export type VocabEntry = {
  term: string;
  fields: VocabField[];
};

const FIELD_LABELS = new Set([
  "Conceito",
  "Utilidade",
  "Importância para o advogado",
  "Exemplo prático",
  "Erro comum",
]);

function normalizeRaw(raw: string): string {
  // Some source files contain literal "\n" sequences instead of actual line breaks.
  return raw.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
}

export function parseVocabBlock(raw: string, skipHeaderLines = 2): VocabEntry[] {
  const lines = normalizeRaw(raw)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const body = lines.slice(skipHeaderLines);
  const entries: VocabEntry[] = [];
  let current: VocabEntry | null = null;

  for (const line of body) {
    const sep = line.indexOf(":");
    if (sep > 0 && current) {
      const label = line.slice(0, sep).trim();
      const value = line.slice(sep + 1).trim();
      if (FIELD_LABELS.has(label) && value.length > 0) {
        current.fields.push({ label, value });
        continue;
      }
    }

    if (current) entries.push(current);
    current = { term: line, fields: [] };
  }

  if (current) entries.push(current);
  return entries.filter((entry) => entry.term.length > 0);
}
