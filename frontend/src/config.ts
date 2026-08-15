const defaultBaseUrl = 'http://localhost:8080'
const recaptchaSiteKey = '';

export function getApiBaseUrl(): string {
  return (defaultBaseUrl).replace(/\/+$/, '')
}

export function getRecaptchaSiteKey(): string {
  return (recaptchaSiteKey ?? '').trim()
}

export function getApiUrl(): string {
  return `${getApiBaseUrl()}/api/query`
}
