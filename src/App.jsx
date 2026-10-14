import { useEffect, useState } from 'react';

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!session) return;
    const timeout = setTimeout(() => {
      setSession(null);
      setError('La sesión ha vencido. Inicia sesión de nuevo.');
    }, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timeout);
  }, [session]);

  async function login(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch(apiUrl + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(response.status === 401 ? 'Credenciales inválidas.' : response.status === 422 ? 'Revisa los campos de la solicitud.' : 'No se pudo iniciar sesión.');
        return;
      }
      if (body.token_type !== 'Bearer' || body.expires_in !== 28800 || !body.access_token || !['admin', 'librarian'].includes(body.role)) {
        throw new Error('Respuesta de autenticación inválida');
      }
      // Token únicamente en memoria; no se guarda contraseña ni sesión en almacenamiento del navegador.
      setSession({ token: body.access_token, role: body.role, expiresAt: Date.now() + body.expires_in * 1000 });
      setPassword('');
    } catch {
      setError('No se pudo conectar con el servicio. Intenta de nuevo.');
    } finally {
      setPending(false);
    }
  }

  return <main>
    <header><span className="brand">ML</span><div><p className="eyebrow">Manager Library</p><p>Gestión de biblioteca</p></div></header>
    <section className="card">
      {session ? <>
        <p className="eyebrow">Sesión iniciada</p>
        <h1>Bienvenido a la biblioteca</h1>
        <p>Rol: <strong>{session.role === 'admin' ? 'Administrador' : 'Bibliotecario'}</strong></p>
        <p>Tu sesión tiene una vigencia de ocho horas.</p>
        <button onClick={() => { setSession(null); setPassword(''); setError(''); }}>Cerrar sesión</button>
      </> : <>
        <p className="eyebrow">Acceso de operadores</p>
        <h1>Iniciar sesión</h1>
        <p>Ingresa tus credenciales para operar según tu rol.</p>
        <form onSubmit={login}>
          <label htmlFor="username">Usuario</label>
          <input id="username" name="username" autoComplete="username" maxLength={120} value={username} onChange={event => setUsername(event.target.value)} required disabled={pending}/>
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required disabled={pending}/>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" disabled={pending}>{pending ? 'Iniciando sesión…' : 'Entrar'}</button>
        </form>
      </>}
    </section>
  </main>;
}
