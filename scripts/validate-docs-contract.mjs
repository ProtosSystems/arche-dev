import fs from 'node:fs'

const docsFiles = ['docs/quickstart.md', 'docs/golden_path.md', 'docs/authentication.md']
const openapiPath = process.env.OPENAPI_PATH || 'docs/contracts/openapi-min.json'

if (!fs.existsSync(openapiPath)) {
  console.error(`OpenAPI file not found: ${openapiPath}`)
  process.exit(1)
}

const openapiRaw = fs.readFileSync(openapiPath, 'utf8')
let openapi
try {
  openapi = JSON.parse(openapiRaw)
} catch {
  console.error(`OpenAPI file is not valid JSON: ${openapiPath}`)
  process.exit(1)
}

const paths = openapi.paths || {}
const globalSecurity = Array.isArray(openapi.security) ? openapi.security : []
const failures = []

function normalizeSnippet(snippet) {
  return snippet.replace(/\\\s*\n/g, ' ').replace(/\s+/g, ' ').trim()
}

function getHeadersFromCurl(snippet) {
  const headers = new Map()
  const normalized = normalizeSnippet(snippet)
  const headerRegex = /-H\s+['"]([^:'"]+)\s*:\s*([^'"]*)['"]/gi
  for (const match of normalized.matchAll(headerRegex)) {
    headers.set(match[1].trim().toLowerCase(), match[2].trim())
  }
  return headers
}

function getCurlMethod(snippet, fallbackMethod) {
  const normalized = normalizeSnippet(snippet)
  const methodMatch = normalized.match(/\s-X\s+([A-Z]+)/)
  return (methodMatch?.[1] || fallbackMethod).toUpperCase()
}

function getCurlUrl(snippet) {
  const normalized = normalizeSnippet(snippet)
  const explicitUrl = normalized.match(/https?:\/\/[^\s'"\\]+/)
  return explicitUrl?.[0] ?? null
}

function pathMatchesContract(contractPath, actualPathname) {
  const escaped = contractPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = `^${escaped.replace(/\\\{[^}]+\\\}/g, '[^/]+')}$`
  return new RegExp(pattern).test(actualPathname)
}

function operationRequiresAuth(contractPath, operation) {
  if (contractPath.startsWith('/v1/protected')) {
    return true
  }

  const operationSecurity = Array.isArray(operation.security) ? operation.security : []
  if (operationSecurity.length > 0 || globalSecurity.length > 0) {
    return true
  }

  const responses = operation.responses || {}
  return Object.prototype.hasOwnProperty.call(responses, '401') || Object.prototype.hasOwnProperty.call(responses, '403')
}

function requiredParameters(operation) {
  return (operation.parameters || []).filter((parameter) => parameter && parameter.required)
}

for (const file of docsFiles) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing docs file: ${file}`)
    continue
  }

  const content = fs.readFileSync(file, 'utf8')

  if (content.includes('Authorization: Bearer')) {
    failures.push(`${file}: contains non-canonical auth example 'Authorization: Bearer'`)
  }

  if (!content.includes('X-Api-Key')) {
    failures.push(`${file}: missing canonical auth header 'X-Api-Key'`)
  }

  if (/arche\.fi\/docs|docs\.arche\.fi\/docs/.test(content)) {
    failures.push(`${file}: contains incorrect docs path under /docs`)
  }

  const contractBlocks = [
    ...content.matchAll(
      /<!--\s*contract:\s*(GET|POST|PUT|PATCH|DELETE)\s+([^\s]+)\s*-->\s*```(?:bash|sh|http)?\n([\s\S]*?)```/g
    ),
  ]

  for (const [, taggedMethod, contractPath, snippet] of contractBlocks) {
    const operation = paths[contractPath]?.[taggedMethod.toLowerCase()]
    if (!operation) {
      failures.push(`${file}: ${taggedMethod} ${contractPath} not found in OpenAPI contract`)
      continue
    }

    const curlMethod = getCurlMethod(snippet, taggedMethod)
    if (curlMethod !== taggedMethod) {
      failures.push(`${file}: curl method ${curlMethod} does not match tagged contract method ${taggedMethod}`)
    }

    const url = getCurlUrl(snippet)
    if (!url) {
      failures.push(`${file}: missing absolute request URL in example for ${taggedMethod} ${contractPath}`)
      continue
    }

    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch {
      failures.push(`${file}: invalid URL in example for ${taggedMethod} ${contractPath}`)
      continue
    }

    if (!pathMatchesContract(contractPath, parsedUrl.pathname)) {
      failures.push(
        `${file}: example URL path ${parsedUrl.pathname} does not match contract path ${contractPath} for ${taggedMethod}`
      )
    }

    const headers = getHeadersFromCurl(snippet)

    if (operationRequiresAuth(contractPath, operation)) {
      const hasAuth = headers.has('x-api-key') || headers.has('authorization')
      if (!hasAuth) {
        failures.push(`${file}: missing auth header for ${taggedMethod} ${contractPath}`)
      }
    }

    for (const parameter of requiredParameters(operation)) {
      const location = parameter.in
      const name = parameter.name

      if (location === 'query' && !parsedUrl.searchParams.has(name)) {
        failures.push(`${file}: required query parameter '${name}' missing for ${taggedMethod} ${contractPath}`)
      }

      if (location === 'header' && !headers.has(name.toLowerCase())) {
        failures.push(`${file}: required header parameter '${name}' missing for ${taggedMethod} ${contractPath}`)
      }

      if (location === 'path' && parsedUrl.pathname.includes(`{${name}}`)) {
        failures.push(`${file}: required path parameter '${name}' was not concretely provided for ${taggedMethod} ${contractPath}`)
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Docs contract validation failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`Docs contract validation passed using ${openapiPath}.`)
