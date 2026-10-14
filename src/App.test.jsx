import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App.jsx';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function submit() {
  fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'ana' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'test-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

test('envía las credenciales y muestra la sesión sin persistir secretos', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ access_token: 'test-token', token_type: 'Bearer', expires_in: 28800, role: 'librarian' }) });
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  submit();
  expect(await screen.findByText('Bibliotecario')).toBeInTheDocument();
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ username: 'ana', password: 'test-password' });
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(screen.getByLabelText('Contraseña')).toHaveValue('');
});

test('401 muestra un error genérico sin distinguir usuario y contraseña', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ code: 'INVALID_CREDENTIALS' }) }));
  render(<App />);
  submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas.');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar' })).not.toBeDisabled());
});

test('un fallo de red permite volver a intentar', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  render(<App />);
  submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
});
