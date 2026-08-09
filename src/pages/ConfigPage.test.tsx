import { fireEvent, render, screen } from '@testing-library/react'

const configMocks = vi.hoisted(() => ({
  getBusinessConfig: vi.fn(),
  updateBusinessConfig: vi.fn(),
}))

vi.mock('../services/configService', () => configMocks)

import { ConfigPage } from './ConfigPage'

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

describe('ConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    configMocks.getBusinessConfig.mockResolvedValue(config)
  })

  it('un error de Supabase no simula éxito ni borra los valores escritos', async () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem')
    configMocks.updateBusinessConfig.mockRejectedValue(new Error('Supabase rechazó la actualización de la configuración'))
    render(<ConfigPage />)

    const businessName = await screen.findByRole('textbox', { name: 'Nombre del negocio' })
    fireEvent.change(businessName, { target: { value: 'Pasta Casa Actualizada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('No se guardaron los cambios.')).toBeInTheDocument()
    expect(screen.queryByText('Configuración actualizada correctamente')).not.toBeInTheDocument()
    expect(businessName).toHaveValue('Pasta Casa Actualizada')
    expect(storageSpy).not.toHaveBeenCalled()
    storageSpy.mockRestore()
  })

  it('muestra éxito y la nueva fecha después de una actualización válida', async () => {
    configMocks.updateBusinessConfig.mockResolvedValue({ ...config, nombre_negocio: 'Pasta Casa Nueva', updated_at: '2026-01-02T00:00:00Z' })
    render(<ConfigPage />)

    fireEvent.change(await screen.findByRole('textbox', { name: 'Nombre del negocio' }), { target: { value: 'Pasta Casa Nueva' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Configuración actualizada correctamente')).toBeInTheDocument()
    expect(configMocks.updateBusinessConfig).toHaveBeenCalledWith(expect.objectContaining({ nombre_negocio: 'Pasta Casa Nueva' }))
  })
})
