import { Box, Grid, Link } from '@mui/material';
import AnalyticEcommerce from 'components/dashboard/card';
import { ReactTable } from 'components/third-party/ReactTable';
import ProductSellDetail from 'pages/product/product-list/product-sell/detail';
import { getProductSellDetail } from 'pages/product/product-list/service';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { snackbarError } from 'store/reducers/snackbar';
import { formatThousandSeparator } from 'utils/func';

export default function ProductsCost({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;
  const [extData, setExtData] = useState({
    location: []
  });
  const [openDetail, setOpenDetail] = useState({ isOpen: false, name: '', detailData: null });
  const dispatch = useDispatch();

  const getPrepareDataForProductsTable = async () => {
    const getLoc = await getLocationList();

    setExtData((prevState) => ({ ...prevState, location: getLoc }));
  };

  useEffect(() => {
    getPrepareDataForProductsTable();
  }, []);

  const getLocationColumns = () => {
    return extData.location?.map((locationItem) => ({
      Header: locationItem.label,
      accessor: (row) => {
        const locationData = row.quantities.find((quantity) => quantity.location === locationItem.label);
        return locationData ? locationData.qty : 0;
      }
    }));
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'product.name',
        Cell: (data) => {
          const getId = data.row.original.product.id;
          const getName = data.row.original.product.name;

          const onClickDetail = async () => {
            await getProductSellDetail(getId)
              .then((resp) => {
                let categories = '';
                if (resp.data.details.categories.length) {
                  resp.data.details.categories.map((dt, idx) => {
                    categories += dt.categoryName + (idx + 1 !== resp.data.details.categories.length ? ',' : '');
                  });
                }

                let reminders = '';
                if (resp.data.reminders.length) {
                  resp.data.reminders.map((dt, idx) => {
                    reminders += dt.timing + `(${dt.unit})` + (idx + 1 !== resp.data.reminders.length ? ',' : '');
                  });
                }

                const detailData = {
                  id: getId,
                  fullName: resp.data.fullName,
                  details: {
                    sku: resp.data.details.sku,
                    status: +resp.data.details.status,
                    supplierId: +resp.data.details.productSupplierId,
                    supplierName: resp.data.details.supplierName,
                    brandName: resp.data.details.brandName,
                    categories,
                    reminders
                  },
                  shipping: {
                    isShipped: +resp.data.isShipped,
                    length: resp.data.length,
                    height: resp.data.height,
                    width: resp.data.width,
                    weight: resp.data.weight
                  },
                  description: {
                    introduction: resp.data.introduction,
                    description: resp.data.description
                  },
                  inventory: {
                    locationName: resp.data.location.locationName,
                    stock: resp.data.location.inStock,
                    lowStock: resp.data.location.lowStock,
                    status: resp.data.location.status.toLowerCase()
                  },
                  location: {
                    id: resp.data.location.locationId
                  },
                  pricing: {
                    price: `Rp ${formatThousandSeparator(resp.data.price)}`,
                    pricingStatus: resp.data.pricingStatus,
                    marketPrice: resp.data.marketPrice,
                    priceLocations: resp.data.priceLocations,
                    customerGroups: resp.data.customerGroups,
                    quantities: resp.data.quantities
                  },
                  settings: {
                    isCustomerPurchase: +resp.data.setting.isCustomerPurchase ? true : false,
                    isCustomerPurchaseOnline: +resp.data.setting.isCustomerPurchaseOnline ? true : false,
                    isCustomerPurchaseOutStock: +resp.data.setting.isCustomerPurchaseOutStock ? true : false,
                    isStockLevelCheck: +resp.data.setting.isStockLevelCheck ? true : false,
                    isNonChargeable: +resp.data.setting.isNonChargeable ? true : false,
                    isOfficeApproval: +resp.data.setting.isOfficeApproval ? true : false,
                    isAdminApproval: +resp.data.setting.isAdminApproval ? true : false
                  }
                };

                setOpenDetail({ isOpen: true, name: getName, detailData });
              })
              .catch((err) => {
                if (err) {
                  dispatch(snackbarError(createMessageBackend(err)));
                }
              });
          };

          return <Link onClick={() => onClickDetail()}>{data.value}</Link>; // href={`/product/product-list/sell/${getId}`}
        }
      },
      {
        Header: <FormattedMessage id="brand" />,
        accessor: 'brandName'
      },
      {
        Header: <FormattedMessage id="supplier" />,
        accessor: 'supplierName'
      },
      {
        Header: <FormattedMessage id="average-price" />,
        accessor: 'averagePrice',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="average-cost" />,
        accessor: 'averageCost',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      ...getLocationColumns()
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extData.location]
  );

  const dataDummy = useMemo(
    () => [
      {
        productName: 'Zoletil Inj (1 ml)',
        brandName: 'KLN',
        supplierName: 'PT Emvi Indonesia',
        averagePrice: 0,
        averageCost: 0,
        quantities: [
          {
            location: 'RPC Buaran Klender',
            qty: 0
          },
          {
            location: 'RPC Condet',
            qty: 0
          },
          {
            location: 'RPC Pulogebang',
            qty: 20
          },
          {
            location: 'RPC Karawang Tengah',
            qty: 0
          },
          {
            location: 'RPC Karawaci',
            qty: 10
          },
          {
            location: 'RPC Lippo Cikarang',
            qty: 0
          },
          {
            location: 'RPC Pulogebang',
            qty: 0
          },
          {
            location: 'RPC Rawamangu',
            qty: 0
          }
        ]
      },
      {
        productName: 'Zentonil Advance (SAme) Kapsul (1 Kapsul)',
        brandName: 'KLN',
        supplierName: 'Online',
        averagePrice: 0,
        averageCost: 1400,
        quantities: [
          {
            location: 'RPC Buaran Klender',
            qty: 0
          },
          {
            location: 'RPC Condet',
            qty: 0
          },
          {
            location: 'RPC Hankam Pondok Gede',
            qty: 0
          },
          {
            location: 'RPC Karawang Tengah',
            qty: 0
          },
          {
            location: 'RPC Karawaci',
            qty: 0
          },
          {
            location: 'RPC Lippo Cikarang',
            qty: 0
          },
          {
            location: 'RPC Pulogebang',
            qty: 0
          },
          {
            location: 'RPC Rawamangu',
            qty: 0
          }
        ]
      },
      {
        productName: 'Yummy Raw Food Turkey 500gr',
        brandName: 'PTS',
        supplierName: 'Online',
        averagePrice: 80500,
        averageCost: 8000,
        quantities: [
          {
            location: 'RPC Buaran Klender',
            qty: 0
          },
          {
            location: 'RPC Condet',
            qty: 0
          },
          {
            location: 'RPC Hankam Pondok Gede',
            qty: 0
          },
          {
            location: 'RPC Karawang Tengah',
            qty: 0
          },
          {
            location: 'RPC Karawaci',
            qty: 0
          },
          {
            location: 'RPC Lippo Cikarang',
            qty: 0
          },
          {
            location: 'RPC Pulogebang',
            qty: 0
          },
          {
            location: 'RPC Rawamangu',
            qty: 0
          }
        ]
      }
    ],
    []
  );

  const statisticsTotal = useMemo(() => {
    const totalProducts = dataDummy.length;
    const totalQuantity = dataDummy.reduce((acc, item) => acc + item.quantities.reduce((sum, q) => sum + q.qty, 0), 0);
    const totalCost = dataDummy.reduce((acc, item) => acc + item.averageCost, 0);

    return {
      totalProducts,
      totalQuantity,
      totalCost
    };
  }, [dataDummy]);

  if (!extData.location.length) return null;

  return (
    <div>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={3} sx={{ marginBottom: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce title="Products" count={statisticsTotal?.totalProducts} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce title="Total quantity" count={statisticsTotal?.totalQuantity} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce title="Total cost (Rp)" count={formatThousandSeparator(statisticsTotal?.totalCost)} />
          </Grid>
        </Grid>
      </Box>

      <ReactTable
        columns={columns}
        data={tablesData}
        totalPagination={totalPagination || 0}
        colSpanPagination={extData.location.length + 5}
        setPageNumber={filter.goToPage}
        onGotoPage={(event) => setFilter((e) => ({ ...e, goToPage: event }))}
        setPageRow={filter.rowPerPage}
        onPageSize={(event) => setFilter((e) => ({ ...e, rowPerPage: event }))}
        onOrder={(event) => {
          setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
        }}
      />

      <ProductSellDetail
        title={openDetail.name}
        open={openDetail.isOpen}
        data={openDetail.detailData}
        onClose={(e) => {
          setOpenDetail({ isOpen: !e.isOpen, name: '', detailData: null });
          if (e.isRefreshIndex) fetchData();
        }}
      />
    </div>
  );
}
