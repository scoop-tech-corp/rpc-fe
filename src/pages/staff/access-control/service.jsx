import { swapKeysAndValuesForObject } from 'service/service-global';
import axios from 'utils/axios';

const url = 'accesscontrol';

export const getAccessControl = async () => await axios.get(url);

export const updateAccessControlMenu = async (property) => {
  const parameter = {
    menuId: property.menuId,
    roleName: property.roleName,
    type: property.type
  };

  return await axios.put(url + '/menu', parameter);
};

export const privilageStatus = {
  3: 'none', // tidak bisa semua
  4: 'full', // full. insert, view, edit, delete
  2: 'write', // insert dan view, tidak bisa edit dan delete
  1: 'read' // cuman view, tidak bisa edit dan delete
};

export const getAccesControlUser = async (property) => {
  return await axios.get(url + '/user', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const getAccesControlHistory = async (property) => {
  return await axios.get(url + '/history', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const getAccessControlMasterMenu = async () => {
  const getResp = await axios.get(url + '/menumaster');

  return getResp.data.map((dt) => {
    return { label: dt.masterName, value: +dt.id };
  });
};

export const getAccessControlTypeAccess = async () => {
  const getResp = await axios.get(url + '/accesstype');

  return getResp.data.map((dt) => {
    return { label: dt.accessType, value: +dt.id };
  });
};

export const swapePrivilageStatus = () => swapKeysAndValuesForObject(privilageStatus);

// const dataDummy = {
//   roles: ['administrator', 'manager', 'veterinarian', 'receptionis'],
//   lists: [
//     {
//       module: 'Location',
//       menus: [
//         {
//           menuId: 1,
//           menuName: 'Dashboard',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 2,
//           receptionisRef: useRef(null)
//         },
//         {
//           menuId: 2,
//           menuName: 'Location List',
//           administrator: 3,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 2,
//           receptionisRef: useRef(null)
//         }
//       ]
//     },
//     {
//       module: 'Product',
//       menus: [
//         {
//           menuId: 3,
//           menuName: 'Dashboard',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         },
//         {
//           menuId: 4,
//           menuName: 'Product List',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         }
//       ]
//     },
//     {
//       module: 'Product',
//       menus: [
//         {
//           menuId: 3,
//           menuName: 'Dashboard',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         },
//         {
//           menuId: 4,
//           menuName: 'Product List',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         }
//       ]
//     },
//     {
//       module: 'Product',
//       menus: [
//         {
//           menuId: 3,
//           menuName: 'Dashboard',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         },
//         {
//           menuId: 4,
//           menuName: 'Product List',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         }
//       ]
//     },
//     {
//       module: 'Product',
//       menus: [
//         {
//           menuId: 3,
//           menuName: 'Dashboard',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         },
//         {
//           menuId: 4,
//           menuName: 'Product List',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         }
//       ]
//     },
//     {
//       module: 'Product',
//       menus: [
//         {
//           menuId: 3,
//           menuName: 'Dashboard',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         },
//         {
//           menuId: 4,
//           menuName: 'Product List',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         }
//       ]
//     },
//     {
//       module: 'Product',
//       menus: [
//         {
//           menuId: 3,
//           menuName: 'Dashboard',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         },
//         {
//           menuId: 4,
//           menuName: 'Product List',
//           administrator: 1,
//           administratorRef: useRef(null),
//           manager: 2,
//           managerRef: useRef(null),
//           veterinarian: 1,
//           veterinarianRef: useRef(null),
//           receptionis: 0,
//           receptionisRef: useRef(null)
//         }
//       ]
//     }
//   ]
// };

/* <tr>
    <th>Account</th>
    <th>Administrator</th>
    <th>Manager</th>
    <th>Veternarian</th>
    <th>Receptionist</th>
  </tr>
  <tr>
    <td>Billing</td>
    <td className="status-full">Full</td>
    <td>Write</td>
    <td>Read</td>
    <td>None</td>
  </tr>
  <tr>
    <td>Company Details</td>
    <td>Full</td>
    <td>Write</td>
    <td>Read</td>
    <td>None</td>
  </tr>
  <tr>
    <td>Notifications</td>
    <td>Full</td>
    <td>Write</td>
    <td>Read</td>
    <td>None</td>
  </tr>
  <tr className="last-row">
    <td>Signatures</td>
    <td>Full</td>
    <td>Write</td>
    <td>Read</td>
    <td>None</td>
  </tr>

  <tr>
    <th>Finance</th>
    <th>Administrator</th>
    <th>Manager</th>
    <th>Veternarian</th>
    <th>Receptionist</th>
  </tr>
  <tr>
    <td>Signatures</td>
    <td>Full</td>
    <td>Write</td>
    <td>Read</td>
    <td>None</td>
  </tr>
  <tr>
    <th>Finance</th>
    <th>Administrator</th>
    <th>Manager</th>
    <th>Veternarian</th>
    <th>Receptionist</th>
  </tr>
  <tr>
    <td>Signatures</td>
    <td>Full</td>
    <td>Write</td>
    <td>Read</td>
    <td>None</td>
  </tr> */
