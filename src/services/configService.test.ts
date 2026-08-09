const configMocks = vi.hoisted(() => ({
  from: vi.fn(),
  selectForGet: vi.fn(),
  eqForGet: vi.fn(),
  maybeSingle: vi.fn(),
  update: vi.fn(),
  eqForUpdate: vi.fn(),
  selectForUpdate: vi.fn(),
  single: vi.fn(),
  insert: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({ supabase: { from: configMocks.from } }))

import { buildBusinessConfigUpdate, getBusinessConfig, updateBusinessConfig } from './configService'

const config = {
  id: 1,
  nombre_negocio: 'Pasta Casa',
  whatsapp: '+54 9 11 2345-6789',
  cbu: '1234567890123456789012',
  identificacion_fiscal: '20-42468452-0',
  titular: 'Titular de prueba',
  horas_limite_pago: 24,
  updated_at: '2026-01-01T00:00:00Z',
}

const changes = {
  nombre_negocio: config.nombre_negocio,
  whatsapp: config.whatsapp,
  cbu: config.cbu,
  identificacion_fiscal: config.identificacion_fiscal,
  titular: config.titular,
  horas_limite_pago: config.horas_limite_pago,
}

describe('configService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    configMocks.from.mockReturnValue({
      select: configMocks.selectForGet,
      update: configMocks.update,
      insert: configMocks.insert,
      upsert: configMocks.upsert,
      delete: configMocks.delete,
    })
    configMocks.selectForGet.mockReturnValue({ eq: configMocks.eqForGet })
    configMocks.eqForGet.mockReturnValue({ maybeSingle: configMocks.maybeSingle })
    configMocks.update.mockReturnValue({ eq: configMocks.eqForUpdate })
    configMocks.eqForUpdate.mockReturnValue({ select: configMocks.selectForUpdate })
    configMocks.selectForUpdate.mockReturnValue({ single: configMocks.single })
    configMocks.maybeSingle.mockResolvedValue({ data: config, error: null })
    configMocks.single.mockResolvedValue({ data: { ...config, updated_at: '2026-01-02T00:00:00Z' }, error: null })
  })

  it('carga exclusivamente la configuración con id = 1', async () => {
    await expect(getBusinessConfig()).resolves.toEqual(config)
    expect(configMocks.from).toHaveBeenCalledWith('configuracion_publica')
    expect(configMocks.eqForGet).toHaveBeenCalledWith('id', 1)
  })

  it('informa claramente si la fila id = 1 no existe', async () => {
    configMocks.maybeSingle.mockResolvedValue({ data: null, error: null })
    await expect(getBusinessConfig()).rejects.toThrow('id = 1')
    expect(configMocks.insert).not.toHaveBeenCalled()
    expect(configMocks.upsert).not.toHaveBeenCalled()
  })

  it('actualiza únicamente los campos permitidos y updated_at, sin enviar id', async () => {
    await updateBusinessConfig(changes)

    const payload = configMocks.update.mock.calls[0][0]
    expect(Object.keys(payload).sort()).toEqual([
      'cbu', 'horas_limite_pago', 'identificacion_fiscal', 'nombre_negocio', 'titular', 'updated_at', 'whatsapp',
    ].sort())
    expect(payload).not.toHaveProperty('id')
    expect(configMocks.eqForUpdate).toHaveBeenCalledWith('id', 1)
    expect(configMocks.insert).not.toHaveBeenCalled()
    expect(configMocks.upsert).not.toHaveBeenCalled()
    expect(configMocks.delete).not.toHaveBeenCalled()
  })

  it('el constructor del update tampoco admite id', () => {
    const payload = buildBusinessConfigUpdate(changes)
    expect(payload).not.toHaveProperty('id')
    expect(payload.updated_at).toEqual(expect.any(String))
  })
})
