// src/SolutionTreeView.tsx

import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Fade from '@mui/material/Fade';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // <-- NUEVA IMPORTACIÓN

interface Node {
  id: string;
  text: string;
  type: 'question' | 'solution';
  options: { text: string; nextNodeId: string }[];
}

export default function SolutionTreeView() {
  const { treeId } = useParams<{ treeId: string }>();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [rootNode, setRootNode] = useState<Node | null>(null);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [treeTitle, setTreeTitle] = useState('');
  const [showNode, setShowNode] = useState(true);

  // ... (toda la lógica de useEffect y los manejadores de eventos se mantienen igual) ...
  useEffect(() => {
    if (!treeId) return;

    const fetchTree = async () => {
      setIsLoading(true);

      const contentRef = collection(db, 'content');
      const qTitle = query(contentRef, where('treeId', '==', treeId));
      const contentSnap = await getDocs(qTitle);
      if (!contentSnap.empty) {
        setTreeTitle(contentSnap.docs[0].data().title);
      }

      const q = query(
        collection(db, 'treeNodes'),
        where('treeId', '==', treeId)
      );
      const querySnapshot = await getDocs(q);
      const allNodes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Node[];
      setNodes(allNodes);

      const treeRef = doc(db, 'solutionTrees', treeId);
      const treeSnap = await getDoc(treeRef);
      if (treeSnap.exists() && treeSnap.data().rootNodeId) {
        const root = allNodes.find((n) => n.id === treeSnap.data().rootNodeId);
        if (root) {
          setRootNode(root);
          setCurrentNode(root);
        }
      }
      setIsLoading(false);
    };

    fetchTree();
  }, [treeId]);

  const handleOptionClick = (nextNodeId: string) => {
    setShowNode(false);
    setTimeout(() => {
      const nextNode = nodes.find((n) => n.id === nextNodeId);
      setCurrentNode(nextNode || null);
      setShowNode(true);
    }, 300);
  };

  const handleRestart = () => {
    setShowNode(false);
    setTimeout(() => {
      setCurrentNode(rootNode);
      setShowNode(true);
    }, 300);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentNode) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Árbol no Configurado</Typography>
        <Typography sx={{ my: 2 }}>
          Este árbol aún no tiene un nodo inicial. Por favor, marca uno en el
          editor.
        </Typography>
        <Button component={RouterLink} to="/contenido" variant="contained">
          Volver a Contenido
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        position: 'relative', // Necesario para posicionar el botón de volver
      }}
    >
      {/* --- BOTÓN DE VOLVER (NUEVO) --- */}
      <Button
        component={RouterLink}
        to="/contenido"
        startIcon={<ArrowBackIcon />}
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24 },
        }}
      >
        Volver
      </Button>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1, // Hace que el contenido principal ocupe el espacio
        }}
      >
        <Paper sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: '700px' }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            color="text.secondary"
          >
            <BuildIcon fontSize="small" />
            <Typography variant="overline">Árbol de Soluciones</Typography>
          </Stack>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{ mt: 1, mb: 4 }}
            color="primary.main"
          >
            {treeTitle}
          </Typography>

          <Fade in={showNode} timeout={300}>
            <Box key={currentNode.id}>
              {currentNode.type === 'question' && (
                <>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ mb: 4, textAlign: 'center', minHeight: '60px' }}
                  >
                    {currentNode.text}
                  </Typography>
                  <Stack spacing={2}>
                    {currentNode.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="contained"
                        size="large"
                        startIcon={
                          option.text.toLowerCase() === 'sí' ? (
                            <CheckIcon />
                          ) : option.text.toLowerCase() === 'no' ? (
                            <CloseIcon />
                          ) : undefined
                        }
                        onClick={() => handleOptionClick(option.nextNodeId)}
                      >
                        {option.text}
                      </Button>
                    ))}
                  </Stack>
                </>
              )}

              {currentNode.type === 'solution' && (
                <Alert
                  severity="success"
                  variant="outlined"
                  iconMapping={{
                    success: <CheckCircleIcon sx={{ fontSize: 24 }} />,
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 'bold' }}>
                    Solución Encontrada
                  </AlertTitle>
                  {currentNode.text}
                  <Button
                    variant="contained"
                    onClick={handleRestart}
                    sx={{ mt: 2, display: 'block', ml: 'auto' }}
                  >
                    Reiniciar Árbol
                  </Button>
                </Alert>
              )}
            </Box>
          </Fade>
        </Paper>
      </Box>
    </Box>
  );
}
