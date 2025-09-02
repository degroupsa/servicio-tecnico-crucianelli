/// src/DashboardPage.tsx

import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';

// Firebase
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Iconos
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PeopleIcon from '@mui/icons-material/People';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

// --- Interfaces para Tipos de Datos ---
interface SearchData {
  id: string;
  term: string;
  count: number;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
}

// --- Componente Reutilizable para Tarjetas de KPI ---
function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              padding: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// --- Datos de prueba para el widget de Contenido Popular ---
const mockPopularContent = [
  { title: 'Video: Limpieza de inyectores', views: 2340 },
  { title: 'PDF: Diagrama eléctrico motor 2KD', views: 1890 },
  { title: 'Árbol: Diagnóstico de sobrecalentamiento', views: 1523 },
];

// --- Componente Principal de la Página del Dashboard ---
export default function DashboardPage() {
  const [searches, setSearches] = useState<SearchData[]>([]);

  useEffect(() => {
    const fetchSearches = async () => {
      const querySnapshot = await getDocs(collection(db, 'searches'));
      const searchesData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            term: doc.data().term,
            count: doc.data().count,
          } as SearchData)
      );
      setSearches(searchesData);
    };
    fetchSearches();
  }, []);

  return (
    <Box>
      {/* Fila de KPIs con sintaxis de Grid actualizada */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Usuarios Totales" value="150" icon={<GroupIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Contenidos" value="45" icon={<LibraryBooksIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Usuarios Activos" value="89" icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Búsquedas (24h)"
            value="215"
            icon={<QueryStatsIcon />}
          />
        </Grid>
      </Grid>

      {/* Fila de Widgets con sintaxis de Grid actualizada */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Búsquedas Frecuentes
              </Typography>
              <List dense>
                {searches.map((search) => (
                  <ListItem
                    key={search.id}
                    disablePadding
                    secondaryAction={
                      <Typography variant="body2" color="text.secondary">
                        {search.count}
                      </Typography>
                    }
                  >
                    <ListItemText primary={search.term} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Contenido Popular
              </Typography>
              <List dense>
                {mockPopularContent.map((content) => (
                  <ListItem
                    key={content.title}
                    disablePadding
                    secondaryAction={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'text.secondary',
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: '1rem' }} />
                        <Typography variant="body2">{content.views}</Typography>
                      </Box>
                    }
                  >
                    <ListItemText primary={content.title} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
