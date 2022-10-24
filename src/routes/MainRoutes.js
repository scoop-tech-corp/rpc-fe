import { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
// import { Outlet } from 'react-router-dom';

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const Dashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const Calendar = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const Message = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Customer
const CustomerDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const CustomerList = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const CustomerTemplate = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const CustomerMerge = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const CustomerStaticData = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const CustomerImport = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Staff
const StaffDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const StaffList = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const StaffLeaveApproval = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const StaffAccessControl = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const StaffSecurityGroup = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const StaffStaticData = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Promotion
const PromotionDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const PromotionDiscount = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const PromotionPartner = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Service
const ServiceDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServiceList = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServiceTreatment = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServiceCategory = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServicePolicies = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServiceTemplate = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServiceStaticData = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServiceImport = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Product
const ProductDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ProductList = Loadable(lazy(() => import('pages/product/list/product-list')));
const ProductBundle = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ProductCategory = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ProductPolicies = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ProductRestocks = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ProductDeliveryAgents = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ProductStaticData = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Location
const LocationDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const LocationList = Loadable(lazy(() => import('pages/location/location-list')));
const LocationDetail = Loadable(lazy(() => import('pages/location/detail/location-detail')));
const LocationFacilities = Loadable(lazy(() => import('pages/location/facility/facility-list')));
const LocationFacilitiesDetail = Loadable(lazy(() => import('pages/location/facility/detail/facility-detail')));
const LocationStaticData = Loadable(lazy(() => import('pages/location/static-data/static-data-list')));

// Finance
const FinanceDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const FinanceSales = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const FinanceQuotation = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const FinanceExpenses = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const FinanceStaticData = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Report
const Report = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'calendar', element: <Calendar /> },
        { path: 'message', element: <Message /> },
        { path: 'report', element: <Report /> },
        {
          path: 'customer',
          children: [
            { path: 'dashboard', element: <CustomerDashboard /> },
            { path: 'list', element: <CustomerList /> },
            { path: 'template', element: <CustomerTemplate /> },
            { path: 'merge', element: <CustomerMerge /> },
            { path: 'static-data', element: <CustomerStaticData /> },
            { path: 'import', element: <CustomerImport /> }
          ]
        },
        {
          path: 'staff',
          children: [
            { path: 'dashboard', element: <StaffDashboard /> },
            { path: 'list', element: <StaffList /> },
            { path: 'leave-approval', element: <StaffLeaveApproval /> },
            { path: 'access-control', element: <StaffAccessControl /> },
            { path: 'security-group', element: <StaffSecurityGroup /> },
            { path: 'static-data', element: <StaffStaticData /> }
          ]
        },
        {
          path: 'promotion',
          children: [
            { path: 'dashboard', element: <PromotionDashboard /> },
            { path: 'discount', element: <PromotionDiscount /> },
            { path: 'partner', element: <PromotionPartner /> }
          ]
        },
        {
          path: 'service',
          children: [
            { path: 'dashboard', element: <ServiceDashboard /> },
            { path: 'list', element: <ServiceList /> },
            { path: 'treatment', element: <ServiceTreatment /> },
            { path: 'category', element: <ServiceCategory /> },
            { path: 'policies', element: <ServicePolicies /> },
            { path: 'template', element: <ServiceTemplate /> },
            { path: 'static-data', element: <ServiceStaticData /> },
            { path: 'import', element: <ServiceImport /> }
          ]
        },
        {
          path: 'product',
          children: [
            { path: 'dashboard', element: <ProductDashboard /> },
            { path: 'list', element: <ProductList /> },
            { path: 'bundle', element: <ProductBundle /> },
            { path: 'category', element: <ProductCategory /> },
            { path: 'policies', element: <ProductPolicies /> },
            { path: 'restocks', element: <ProductRestocks /> },
            { path: 'delivery-agent', element: <ProductDeliveryAgents /> },
            { path: 'static-data', element: <ProductStaticData /> }
          ]
        },
        {
          path: 'location',
          children: [
            { path: 'dashboard', element: <LocationDashboard /> },
            { path: 'list', element: <LocationList /> },
            { path: 'add', element: <LocationDetail /> },
            { path: ':code', element: <LocationDetail /> },
            { path: 'facilities', element: <LocationFacilities /> },
            { path: 'facilities/add', element: <LocationFacilitiesDetail /> },
            { path: 'facilities/:id', element: <LocationFacilitiesDetail /> },
            { path: 'static-data', element: <LocationStaticData /> }
          ]
        },
        {
          path: 'finance',
          children: [
            { path: 'dashboard', element: <FinanceDashboard /> },
            { path: 'sales', element: <FinanceSales /> },
            { path: 'quotation', element: <FinanceQuotation /> },
            { path: 'expenses', element: <FinanceExpenses /> },
            { path: 'static-data', element: <FinanceStaticData /> }
          ]
        },
        {
          path: 'sample-page',
          element: <SamplePage />
        }
      ]
    }
  ]
};

export default MainRoutes;
