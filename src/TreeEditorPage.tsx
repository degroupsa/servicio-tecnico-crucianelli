// src/TreeEditorPage.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Divider from '@mui/material/Divider';
import StarIcon from '@mui/icons-material/Star';

interface Node {
  id: string;
  text: string;
  type: 'question' | 'solution';
  options: { text: string; nextNodeId: string }[];
}

const initialFormState: Omit<Node, 'id'> = {
  text: '',
  type: 'question',
  options: [],
};

export default function TreeEditorPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const [treeTitle, setTreeTitle] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [rootNodeId, setRootNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!treeId) return;

    const fetchTreeData = async () => {
      const contentRef = collection(db, 'content');
      const qTitle = query(contentRef, where('treeId', '==', treeId));
      const contentSnap = await getDocs(qTitle);
      if (!contentSnap.empty) {
        setTreeTitle(contentSnap.docs[0].data().title);
      }

      const treeRef = doc(db, 'solutionTrees', treeId);
      const treeSnap = await getDoc(treeRef);
      if (treeSnap.exists()) {
        setRootNodeId(treeSnap.data().rootNodeId || null);
      }
    };

    const fetchNodes = async () => {
      const q = query(
        collection(db, 'treeNodes'),
        where('treeId', '==', treeId)
      );
      const querySnapshot = await getDocs(q);
      const nodesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Node[];
      setNodes(nodesData);
    };

    fetchTreeData();
    fetchNodes();
  }, [treeId]);

  const handleSelectNode = (node: Node) => {
    setSelectedNode(node);
    setFormData({
      text: node.text,
      type: node.type,
      options: node.options || [],
    });
  };

  const handleAddNewNode = () => {
    setSelectedNode(null);
    setFormData(initialFormState);
  };

  const handleFormChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionChange = (
    index: number,
    field: 'text' | 'nextNodeId',
    value: string
  ) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', nextNodeId: '' }],
    });
  };

  const handleSaveNode = async () => {
    if (!treeId || !formData.text) return;

    const dataToSave = { ...formData };
    if (formData.type === 'solution') {
      dataToSave.options = [];
    }

    if (selectedNode) {
      const nodeRef = doc(db, 'treeNodes', selectedNode.id);
      await updateDoc(nodeRef, dataToSave);
    } else {
      await addDoc(collection(db, 'treeNodes'), { treeId, ...dataToSave });
    }

    const q = query(collection(db, 'treeNodes'), where('treeId', '==', treeId));
    const querySnapshot = await getDocs(q);
    const nodesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Node[];
    setNodes(nodesData);
    handleAddNewNode();
  };

  const handleSetAsRoot = async (nodeId: string) => {
    if (!treeId) return;
    const treeRef = doc(db, 'solutionTrees', treeId);
    await updateDoc(treeRef, { rootNodeId: nodeId });
    setRootNodeId(nodeId);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editor de Árbol: {treeTitle}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="h6">Nodos</Typography>
              <Button size="small" onClick={handleAddNewNode}>
                Añadir Nuevo
              </Button>
            </Box>
            <List dense>
              {nodes.map((node) => (
                <ListItemButton
                  key={node.id}
                  selected={selectedNode?.id === node.id}
                  onClick={() => handleSelectNode(node)}
                >
                  {rootNodeId === node.id && (
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <StarIcon fontSize="small" color="warning" />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={node.text}
                    secondary={
                      node.type.charAt(0).toUpperCase() + node.type.slice(1)
                    }
                  />
                  <IconButton
                    title="Marcar como inicio"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetAsRoot(node.id);
                    }}
                  >
                    <StarIcon
                      color={rootNodeId === node.id ? 'warning' : 'disabled'}
                    />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">
              {selectedNode ? `Editando Nodo` : 'Nuevo Nodo'}
            </Typography>
            <TextField
              fullWidth
              label="Texto de la Pregunta o Solución"
              name="text"
              value={formData.text}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Nodo</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Tipo de Nodo"
                onChange={handleFormChange}
              >
                <MenuItem value="question">Pregunta (con opciones)</MenuItem>
                <MenuItem value="solution">Solución (final)</MenuItem>
              </Select>
            </FormControl>

            {formData.type === 'question' && (
              <Box>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="overline">
                    Opciones de Respuesta
                  </Typography>
                </Divider>
                {formData.options.map((option, index) => (
                  <Grid
                    container
                    spacing={2}
                    key={index}
                    sx={{ mb: 2, alignItems: 'center' }}
                  >
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label={`Texto Opción ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(index, 'text', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <FormControl fullWidth>
                        <InputLabel>Enlazar a Nodo Siguiente</InputLabel>
                        <Select
                          value={option.nextNodeId}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              'nextNodeId',
                              e.target.value
                            )
                          }
                          label="Enlazar a Nodo Siguiente"
                        >
                          <MenuItem value="">
                            <em>Ninguno</em>
                          </MenuItem>
                          {nodes
                            .filter((n) => n.id !== selectedNode?.id)
                            .map((n) => (
                              <MenuItem key={n.id} value={n.id}>
                                {n.text}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<AddCircleIcon />} onClick={addOption}>
                  Añadir Opción
                </Button>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleSaveNode}
              sx={{ mt: 3, display: 'block', ml: 'auto' }}
            >
              {selectedNode ? 'Actualizar Nodo' : 'Guardar Nodo'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
