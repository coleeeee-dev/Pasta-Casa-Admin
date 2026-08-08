import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const orderMocks = vi.hoisted(() => ({
  getOrders: vi.fn(),
  getOrderDetails: vi.fn(),
  updateOrderStatus: vi.fn(),
}))

vi.mock('../services/orderService', () => orderMocks)

import { OrdersPage } from './OrdersPage'

describe('OrdersPage', () => {
  it('filtra los pedidos pendientes de coordinación', async () => {
    orderMocks.getOrders.mockResolvedValue([])
    render(<OrdersPage />)

    await waitFor(() => expect(orderMocks.getOrders).toHaveBeenCalledWith(undefined))
    fireEvent.click(screen.getByRole('button', { name: 'Pendiente de coordinación' }))
    await waitFor(() => expect(orderMocks.getOrders).toHaveBeenCalledWith('pendiente_coordinacion'))
  })
})
