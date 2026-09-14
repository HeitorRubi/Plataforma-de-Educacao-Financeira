import assert from "node:assert/strict";

const configuredBaseUrl =
  process.argv[2] ?? process.env.TEST_BASE_URL ?? "http://localhost:3000";
const baseUrl = configuredBaseUrl.replace(/\/+$/, "");

try {
  new URL(baseUrl);
} catch {
  throw new Error("TEST_BASE_URL deve conter uma URL absoluta válida.");
}

async function request(path, init) {
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new Error(
      `Não foi possível acessar ${baseUrl}${path}. Confirme que a aplicação está disponível.`,
      { cause: error },
    );
  }
}

for (const path of ["/", "/login", "/cadastro"]) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} deveria responder HTTP 200.`);
}

const loginResponse = await request("/login");
const expectedHeaders = {
  "content-security-policy": "frame-ancestors 'none'",
  "cross-origin-opener-policy": "same-origin",
  "permissions-policy": "camera=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

for (const [header, expectedValue] of Object.entries(expectedHeaders)) {
  assert.match(
    loginResponse.headers.get(header) ?? "",
    new RegExp(expectedValue.replace(/[()']/g, "\\$&"), "i"),
    `Cabeçalho ${header} ausente ou inválido.`,
  );
}

assert.equal(loginResponse.headers.has("x-powered-by"), false);

for (const path of ["/admin", "/chat", "/perfil", "/area-autenticada"]) {
  const response = await request(path);
  assert.ok(
    [302, 303, 307, 308].includes(response.status),
    `${path} deveria redirecionar sem sessão.`,
  );

  const location = response.headers.get("location");
  assert.ok(location, `${path} deveria informar o destino do redirecionamento.`);
  assert.equal(new URL(location, baseUrl).pathname, "/login");
}

const chatResponse = await request("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question: "O que é renda fixa?" }),
});
assert.equal(chatResponse.status, 401);
assert.match(chatResponse.headers.get("cache-control") ?? "", /no-store/i);
assert.match(chatResponse.headers.get("content-type") ?? "", /application\/json/i);
assert.equal(typeof (await chatResponse.json()).error, "string");

const historyResponse = await request(
  "/api/chat/sessions/00000000-0000-4000-8000-000000000000",
);
assert.equal(historyResponse.status, 401);
assert.match(historyResponse.headers.get("cache-control") ?? "", /no-store/i);

console.log(`Smoke HTTP aprovado em ${baseUrl}.`);
