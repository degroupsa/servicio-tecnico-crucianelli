// src/ContentPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

// Firebase (añadimos setDoc)
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

interface Content {
  id: string;
  title: string;
  type: string;
  category: string;
  createdAt: Date;
  fileUrl?: string;
  treeId?: string;
}

const initialFormState = { title: '', type: '', category: '', fileUrl: '' };

export default function ContentPage() {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Content | null>(null);
  const navigate = useNavigate();

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'content'));
      const contents = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          type: data.type,
          category: data.category,
          createdAt: data.createdAt
            ? (data.createdAt as Timestamp).toDate()
            : new Date(),
          fileUrl: data.fileUrl,
          treeId: data.treeId,
        };
      });
      setContentList(contents);
    } catch (error) {
      console.error('Error al obtener el contenido:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleOpenAddDialog = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setOpenFormDialog(true);
  };

  const handleEdit = (content: Content) => {
    if (content.type === 'Árbol de Soluciones' && content.treeId) {
      navigate(`/contenido/arbol/${content.treeId}`);
    } else {
      setEditingId(content.id);
      setFormData({
        title: content.title,
        type: content.type,
        category: content.category,
        fileUrl: content.fileUrl || '',
      });
      setOpenFormDialog(true);
    }
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingId(null);
  };

  const handleOpenConfirmDialog = (content: Content) => {
    setItemToDelete(content);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setItemToDelete(null);
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name!]: value });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.type) {
      alert('Por favor, completa al menos el título y el tipo.');
      return;
    }
    if (
      (formData.type === 'PDF' || formData.type === 'Video') &&
      !formData.fileUrl
    ) {
      alert('Para PDF o Video, la URL del archivo es requerida.');
      return;
    }

    if (editingId) {
      const docRef = doc(db, 'content', editingId);
      await updateDoc(docRef, { ...formData });
    } else {
      if (formData.type === 'Árbol de Soluciones') {
        const newTreeRef = doc(collection(db, 'solutionTrees'));

        // Paso clave que faltaba: crear el documento en la colección 'solutionTrees'
        await setDoc(newTreeRef, {
          title: formData.title,
          createdAt: Timestamp.now(),
          rootNodeId: null,
        });

        const newContentData = {
          title: formData.title,
          type: formData.type,
          category: formData.category,
          createdAt: Timestamp.now(),
          treeId: newTreeRef.id,
        };
        await addDoc(collection(db, 'content'), newContentData);
      } else {
        await addDoc(collection(db, 'content'), {
          ...formData,
          createdAt: Timestamp.now(),
        });
      }
    }
    handleCloseFormDialog();
    fetchContent();
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    await deleteDoc(doc(db, 'content', itemToDelete.id));
    setContentList(
      contentList.filter((content) => content.id !== itemToDelete.id)
    );
    handleCloseConfirmDialog();
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">Gestión de Contenido</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Añadir Contenido
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Fecha de Creación</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : contentList.length > 0 ? (
              contentList.map((content) => (
                <TableRow
                  key={content.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {content.title}
                  </TableCell>
                  <TableCell>{content.type}</TableCell>
                  <TableCell>{content.category}</TableCell>
                  <TableCell>
                    {content.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {content.type === 'Árbol de Soluciones' && (
                      <IconButton
                        component={RouterLink}
                        to={`/view/tree/${content.treeId}`}
                        title="Ver Árbol"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleEdit(content)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenConfirmDialog(content)}
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay contenido para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openFormDialog} onClose={handleCloseFormDialog}>
        <DialogTitle>
          {editingId ? 'Editar Contenido' : 'Añadir Nuevo Contenido'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Título"
            type="text"
            fullWidth
            value={formData.title}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo</InputLabel>
            <Select
              name="type"
              value={formData.type}
              label="Tipo"
              onChange={handleInputChange}
              disabled={!!editingId}
            >
              <MenuItem value={'Video'}>Video</MenuItem>
              <MenuItem value={'PDF'}>PDF</MenuItem>
              <MenuItem value={'Árbol de Soluciones'}>
                Árbol de Soluciones
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="category"
            label="Categoría"
            type="text"
            fullWidth
            value={formData.category}
            onChange={handleInputChange}
          />
          {formData.type !== 'Árbol de Soluciones' && (
            <TextField
              margin="dense"
              name="fileUrl"
              label="URL del Archivo"
              type="text"
              fullWidth
              value={formData.fileUrl}
              onChange={handleInputChange}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar "
            <strong>{itemToDelete?.title}</strong>"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
