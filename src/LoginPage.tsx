// src/LoginPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('Error: Revisa tu email y contraseña.');
      console.error('Error de autenticación:', err);
    }
  };

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh' }}
    >
      <Grid item xs={11} sm={8} md={4} lg={3}>
        <Paper
          component="form"
          onSubmit={handleLogin}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
          }}
          elevation={3}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="center"
          >
            Iniciar Sesión
          </Typography>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          {error && (
            <Typography color="error" variant="body2" textAlign="center">
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>
            Entrar
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}
