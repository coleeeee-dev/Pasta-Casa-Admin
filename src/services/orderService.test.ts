vi.mock('../lib/supabase', () => ({ supabase: {} }))

import { buildOrderStatusUpdate } from './orderService'

describe('actualización de estado', () => {
  it('utiliza únicamente estado y updated_at', () => {
    const payload = buildOrderStatusUpdate('pago_confirmado')
    expect(payload.estado).toBe('pago_confirmado')
    expect(Object.keys(payload).sort()).toEqual(['estado', 'updated_at'])
  })
})
