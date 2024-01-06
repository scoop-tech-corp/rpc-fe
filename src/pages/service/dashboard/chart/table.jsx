import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { Chip, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';

// table data
const createData = (badgeText, badgeType, subject, dept, date) => ({
  badgeText,
  badgeType,
  subject,
  dept,
  date
});

const rows = [
  createData('Open', 'default', 'Website down for one week', 'Support', 'Today 2:00'),
  createData('Progress', 'primary', 'Loosing control on server', 'Support', 'Yesterday'),
  createData('Closed', 'secondary', 'Authorizations keys', 'Support', '27, Aug'),
  createData('Open', 'default', 'Restoring default settings', 'Support', 'Today 9:00'),
  createData('Progress', 'primary', 'Loosing control on server', 'Support', 'Yesterday'),
  createData('Closed', 'secondary', 'Authorizations keys', 'Support', '27, Aug'),
  createData('Open', 'default', 'Restoring default settings', 'Support', 'Today 9:00'),
  createData('Closed', 'secondary', 'Authorizations keys', 'Support', '27, Aug')
];

// ==========================|| DATA WIDGET - RECENT TICKETS CARD ||========================== //

const RecentTickets = () => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ pl: 3 }}>Service</TableCell>
          <TableCell align="right" sx={{ pr: 3 }}>
            Bookings
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow hover key={index}>
            <TableCell sx={{ pl: 3 }}>{row.subject}</TableCell>
            <TableCell align="right" sx={{ pr: 3 }}>
              {Math.floor(Math.random() * 100) + 1}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default RecentTickets;
