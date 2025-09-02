// src/UsersPage.tsx

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

// Firebase
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

interface AppUser {
  id: string;
  email: string;
  role: 'admin' | 'technician' | 'client';
  createdAt: Date;
}

export default function UsersPage() {
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email,
            role: data.role,
            createdAt: data.createdAt
              ? (data.createdAt as Timestamp).toDate()
              : new Date(),
          } as AppUser;
        });
        setUsersList(users);
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Gestión de Usuarios
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Fecha de Registro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : usersList.length > 0 ? (
              usersList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell component="th" scope="row">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No hay usuarios para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
