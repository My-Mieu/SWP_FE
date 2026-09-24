const writtenNumbers: Record<string, string> = {
  khong: '0', mot: '1', hai: '2', ba: '3', bon: '4', tu: '4', nam: '5', sau: '6',
  bay: '7', tam: '8', chin: '9', muoi: '0',
};

export function normalizeContactText(input: string) {
  const withoutMarks = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[|!]/g, 'i')
    .replace(/[@]/g, ' at ')
    .replace(/[(){}\[\],;:_-]/g, ' ');
  const withWrittenNumbers = withoutMarks.replace(
    /\b(khong|mot|hai|ba|bon|tu|nam|sau|bay|tam|chin|muoi)\b/g,
    (word) => writtenNumbers[word] ?? word,
  );
  return {
    spaced: withWrittenNumbers.replace(/\s+/g, ' ').trim(),
    compact: withWrittenNumbers.replace(/[^a-z0-9]/g, ''),
  };
}

export function contactSafetyLayer1(input: string) {
  const { spaced, compact } = normalizeContactText(input);
  const phone = /(?:^|[^0-9])(?:\+?84|0)?\d{8,11}(?:$|[^0-9])/.test(spaced) ||
    /(?:84|0)\d{8,11}/.test(compact);
  const email = /[a-z0-9._%+-]+\s*(?:@|at)\s*[a-z0-9.-]+\s*(?:\.|dot)\s*[a-z]{2,}/i.test(spaced) ||
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(compact);
  const url = /(?:https?:\/\/|www\.|[a-z0-9-]+\s*(?:\.|dot)\s*(?:com|vn|net|org)\b)/i.test(spaced) ||
    /(?:https?|www|zalo|facebook|telegram|viber)/i.test(compact);
  return { blocked: phone || email || url, phone, email, url, normalized: spaced };
}

// Layer 2 fallback classifier. The optional AI client can replace this
// classifier; the deterministic fallback keeps the safety decision fail-closed
// when an AI request is unavailable or times out.
export function contactSafetyLayer2(input: string) {
  const { spaced, compact } = normalizeContactText(input);
  const contactWords = /(lien he|goi|nhan tin|so dien thoai|email|dia chi|ket noi|inbox|ib|zalo|fb)/i;
  const digitLike = (compact.match(/\d/g) ?? []).length;
  return contactWords.test(spaced) && (digitLike >= 2 || compact.length < 80);
}

export function inspectContactMessage(input: string) {
  const layer1 = contactSafetyLayer1(input);
  return {
    blocked: layer1.blocked || contactSafetyLayer2(input),
    obvious: layer1.blocked,
    normalized: layer1.normalized,
  };
}

export async function classifyAmbiguousContact(input: string, timeoutMs = 1200) {
  // The current prototype has no configured AiClient. Keep the timeout/fallback
  // contract ready for the existing LLM integration without failing open.
  return await Promise.race([
    Promise.resolve(contactSafetyLayer2(input)),
    new Promise<boolean>((resolve) => window.setTimeout(() => resolve(contactSafetyLayer2(input)), timeoutMs)),
  ]);
}
