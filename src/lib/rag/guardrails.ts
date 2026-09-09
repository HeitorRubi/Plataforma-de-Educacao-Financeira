const PERSONALIZED_ADVICE_PATTERNS = [
  /\b(devo|posso|vale a pena)\b.{0,60}\b(comprar|vender|investir|aplicar)\b/,
  /\b(comprar|vender|investir|aplicar)\b.{0,60}\b(para mim|minha|meu)\b/,
  /\b(recomenda|recomende|indique|sugira)\b.{0,60}\b(acao|acoes|ativo|ativos|investimento|investimentos)\b/,
  /\b(minha carteira|meu dinheiro|meu patrimonio)\b/,
];

function normalizeQuestion(question: string): string {
  return question
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

export function requestsPersonalizedFinancialAdvice(question: string): boolean {
  const normalizedQuestion = normalizeQuestion(question);

  return PERSONALIZED_ADVICE_PATTERNS.some((pattern) =>
    pattern.test(normalizedQuestion),
  );
}
