import assert from "node:assert/strict";

const configuredBaseUrl =
  process.argv[2] ?? process.env.TEST_BASE_URL ?? "http://localhost:3000";
const baseUrl = configuredBaseUrl.replace(/\/+$/, "");
let parsedBaseUrl;

try {
  parsedBaseUrl = new URL(baseUrl);
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

const contentSecurityPolicy =
  loginResponse.headers.get("content-security-policy") ?? "";
for (const directive of [
  "default-src 'self'",
  "script-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
]) {
  assert.match(
    contentSecurityPolicy,
    new RegExp(directive.replace(/[()']/g, "\\$&"), "i"),
    `A CSP deveria conter ${directive}.`,
  );
}

const nonce = contentSecurityPolicy.match(/'nonce-([^']+)'/)?.[1];
assert.ok(nonce, "A CSP deveria incluir um nonce por requisicao.");

const repeatedLoginResponse = await request("/login");
const repeatedNonce = repeatedLoginResponse.headers
  .get("content-security-policy")
  ?.match(/'nonce-([^']+)'/)?.[1];
assert.ok(repeatedNonce, "A segunda resposta deveria incluir um nonce.");
assert.notEqual(nonce, repeatedNonce, "O nonce deve mudar a cada requisicao.");

if (parsedBaseUrl.protocol === "https:") {
  assert.match(
    contentSecurityPolicy,
    /upgrade-insecure-requests/i,
    "A CSP do ambiente HTTPS deveria promover requisicoes inseguras.",
  );
  assert.match(
    loginResponse.headers.get("strict-transport-security") ?? "",
    /max-age=\d+/i,
    "O ambiente HTTPS deveria enviar HSTS.",
  );
}

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
