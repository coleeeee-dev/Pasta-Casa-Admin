import { createWhatsAppUrl, normalizeWhatsAppPhone } from './whatsapp'

describe('WhatsApp', () => {
  it('normaliza el teléfono conservando únicamente dígitos', () => {
    expect(normalizeWhatsAppPhone('+54 9 (11) 2345-6789')).toBe('5491123456789')
  })

  it('crea una URL con el teléfono, el nombre y el código del pedido', () => {
    const url = createWhatsAppUrl('+54 9 11 2345-6789', 'Cliente', 'PED-TEST')
    expect(url).toContain('https://wa.me/5491123456789?text=')
    expect(decodeURIComponent(url ?? '')).toContain('Hola Cliente, nos comunicamos por tu pedido PED-TEST.')
  })

  it('no crea una URL si no hay teléfono', () => {
    expect(createWhatsAppUrl(null, 'Cliente', 'PED-TEST')).toBeNull()
  })
})
