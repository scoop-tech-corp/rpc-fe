// import axios from 'axios';

export const getTransferProduct = async () => {
  //property
  return {
    data: {
      data: [
        {
          id: 1,
          productName: 'test 1',
          categoryName: 'category test',
          from: 'jogjes',
          to: 'paraingan',
          quantity: 'goks',
          status: 0,
          createdBy: 'Ajeng tirtalisa',
          receivedBy: 'siboss onta',
          createdAt: '21/01/2023'
        }
      ],
      pagination: 1
    }
  };

  // return await axios.get('product/transfer', {
  //   params: {
  //     rowPerPage: property.rowPerPage,
  //     goToPage: property.goToPage,
  //     orderValue: property.orderValue,
  //     orderColumn: property.orderColumn,
  //     search: property.keyword,
  //     locationId: property.locationId.length ? property.locationId : ['']
  //   }
  // });
};

export const getHistoryTransferProduct = async () => {
  //property
  return {
    data: {
      data: [
        {
          id: 1,
          productName: 'test 1',
          categoryName: 'category test',
          from: 'jogjes',
          to: 'paraingan',
          quantity: 'goks',
          status: 0,
          createdBy: 'Ajeng tirtalisa',
          createdAt: '21/01/2023',
          approvedBy: 'siboss onta',
          approvedAt: '21/01/2023'
        }
      ],
      pagination: 1
    }
  };

  // return await axios.get('product/transfer', {
  //   params: {
  //     rowPerPage: property.rowPerPage,
  //     goToPage: property.goToPage,
  //     orderValue: property.orderValue,
  //     orderColumn: property.orderColumn,
  //     search: property.keyword,
  //     locationId: property.locationId.length ? property.locationId : ['']
  //   }
  // });
};

export const exportHistoryTransferProduct = async (param) => {
  return await axios.get('product/transfer/history/export', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      locationId: param.locationId.length ? param.locationId : ['']
    }
  });
};
