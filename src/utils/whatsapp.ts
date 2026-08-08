export const normalizeWhatsAppPhone = (phone: string | null) => phone?.replace(/\D/g, '') ?? ''

export function createWhatsAppUrl(phone: string | null, name: string, orderCode: string): string | null {
  const normalizedPhone = normalizeWhatsAppPhone(phone)
  if (!normalizedPhone) return null

  const message = `Hola ${name}, nos comunicamos por tu pedido ${orderCode}.`
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}
