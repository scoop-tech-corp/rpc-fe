import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import TransactionPetHotel from 'pages/transaction/pages/pet-hotel';
import TransactionPetSalon from 'pages/transaction/pages/pet-salon';
import TransactionBreeding from 'pages/transaction/pages/breeding';
import TransactionPetShop from 'pages/transaction/pages/pet-shop';
import FormTransactionPetShop from 'pages/transaction/pages/pet-shop/form-transaction';
import TransactionDataStatic from 'pages/transaction/pages/material-data';
// import { Outlet } from 'react-router-dom';

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const Dashboard = Loadable(lazy(() => import('pages/dashboard')));
const Calendar = Loadable(lazy(() => import('pages/calendar')));
const TransactionPetClinic = Loadable(lazy(() => import('pages/transaction/pages/pet-clinic')));
const Message = Loadable(lazy(() => import('pages/message')));

// Customer
const CustomerDashboard = Loadable(lazy(() => import('pages/customer/dashboard')));
const CustomerList = Loadable(lazy(() => import('pages/customer/customer-list')));
const CustomerForm = Loadable(lazy(() => import('pages/customer/customer-list/form')));
const CustomerTemplate = Loadable(lazy(() => import('pages/customer/template')));
const CustomerMerge = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const CustomerStaticData = Loadable(lazy(() => import('pages/customer/static-data')));
const CustomerImport = Loadable(lazy(() => import('pages/customer/import')));

// Staff
const StaffDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const StaffList = Loadable(lazy(() => import('pages/staff/staff-list')));
const StaffForm = Loadable(lazy(() => import('pages/staff/staff-list/form')));
const StaffLeaveApproval = Loadable(lazy(() => import('pages/staff/leave')));
const StaffAccessControl = Loadable(lazy(() => import('pages/staff/access-control')));
const StaffSecurityGroup = Loadable(lazy(() => import('pages/staff/security-group')));
const StaffSecurityGroupForm = Loadable(lazy(() => import('pages/staff/security-group/form')));
const StaffSchedule = Loadable(lazy(() => import('pages/staff/schedule')));
const StaffViewProfile = Loadable(lazy(() => import('pages/staff/profile/view')));
const StaffEditProfile = Loadable(lazy(() => import('pages/staff/profile/edit')));
const StaffStaticData = Loadable(lazy(() => import('pages/staff/static-data')));
const StaffAbsent = Loadable(lazy(() => import('pages/staff/absent')));

// Promotion
const PromotionDashboard = Loadable(lazy(() => import('pages/promotion/dashboard')));
const PromotionDiscount = Loadable(lazy(() => import('pages/promotion/discount')));
const PromotionDiscountForm = Loadable(lazy(() => import('pages/promotion/discount/form')));
const PromotionPartner = Loadable(lazy(() => import('pages/promotion/partner')));
const PromotionPartnerForm = Loadable(lazy(() => import('pages/promotion/partner/form')));
const PromotionStaticData = Loadable(lazy(() => import('pages/promotion/static-data')));

// Service
const ServiceDashboard = Loadable(lazy(() => import('pages/service/dashboard')));
const ServiceList = Loadable(lazy(() => import('pages/service/service-list/')));
const ServiceListForm = Loadable(lazy(() => import('pages/service/service-list/form')));
const ServiceTreatment = Loadable(lazy(() => import('pages/service/treatment/')));
const ServiceTreatmentForm = Loadable(lazy(() => import('pages/service/treatment/form/form-treatment-step2')));

const ServiceCategory = Loadable(lazy(() => import('pages/service/category')));

const ServicePolicies = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServiceTemplate = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ServiceStaticData = Loadable(lazy(() => import('pages/service/static-data')));
const ServiceImport = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Product
const ProductDashboard = Loadable(lazy(() => import('pages/product/dashboard')));
const ProductList = Loadable(lazy(() => import('pages/product/product-list/product-list')));
const ProductSellForm = Loadable(lazy(() => import('pages/product/product-list/product-sell/form')));
const ProductClinicForm = Loadable(lazy(() => import('pages/product/product-list/product-clinic/form')));
const ProductInventoryDetail = Loadable(lazy(() => import('pages/product/product-list/product-inventory/detail')));
const ProductBundle = Loadable(lazy(() => import('pages/product/bundle')));
const ProductBundleForm = Loadable(lazy(() => import('pages/product/bundle/form')));
const ProductCategory = Loadable(lazy(() => import('pages/product/category')));
const ProductSupplier = Loadable(lazy(() => import('pages/product/supplier')));
const ProductSupplierForm = Loadable(lazy(() => import('pages/product/supplier/form')));
const ProductPolicies = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ProductRestock = Loadable(lazy(() => import('pages/product/restock')));
const ProductRestockForm = Loadable(lazy(() => import('pages/product/restock/form')));
const ProductTransfer = Loadable(lazy(() => import('pages/product/transfer')));
const ProductDeliveryAgents = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ProductStaticData = Loadable(lazy(() => import('pages/product/static-data')));

// Location
const LocationDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const LocationList = Loadable(lazy(() => import('pages/location/location-list')));
const LocationDetail = Loadable(lazy(() => import('pages/location/location-list/detail')));
const LocationFacilities = Loadable(lazy(() => import('pages/location/facility/facility-list')));
const LocationFacilitiesDetail = Loadable(lazy(() => import('pages/location/facility/detail')));
const LocationStaticData = Loadable(lazy(() => import('pages/location/static-data/static-data-list')));

// Finance
const FinanceDashboard = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const FinanceSales = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const FinanceQuotation = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const FinanceExpenses = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const FinanceStaticData = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// Report
const Report = Loadable(lazy(() => import('pages/report')));
const ReportDetail = Loadable(lazy(() => import('pages/report/report-detail')));

// Menus
const TimeKeeperAbsent = Loadable(lazy(() => import('pages/menus/time-keeper-absent')));
const MenuGroup = Loadable(lazy(() => import('pages/menus/group')));
const MenuGroupChildren = Loadable(lazy(() => import('pages/menus/children')));
const MenuGroupGrandChildren = Loadable(lazy(() => import('pages/menus/grand-children')));
const MenuProfile = Loadable(lazy(() => import('pages/menus/profile')));
const MenuSetting = Loadable(lazy(() => import('pages/menus/setting')));
const MenuReport = Loadable(lazy(() => import('pages/menus/report')));

// Maintenance Page
const ForbiddenPage = Loadable(lazy(() => import('pages/maintenance/403')));

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
        { path: 'report-detail', element: <ReportDetail /> },
        {
          path: 'transaction',
          children: [
            { path: 'pet-clinic', element: <TransactionPetClinic /> },
            { path: 'pet-hotel', element: <TransactionPetHotel /> },
            { path: 'pet-salon', element: <TransactionPetSalon /> },
            { path: 'breeding', element: <TransactionBreeding /> },
            { path: 'pet-shop', element: <TransactionPetShop /> },
            { path: 'pet-shop/create', element: <FormTransactionPetShop /> },
            { path: 'pet-shop/edit/:id', element: <FormTransactionPetShop /> },
            { path: 'material-data', element: <TransactionDataStatic /> }
          ]
        },
        {
          path: 'customer',
          children: [
            { path: '', element: <Navigate to="/customer/dashboard" /> },
            { path: 'dashboard', element: <CustomerDashboard /> },
            { path: 'list', element: <CustomerList /> },
            { path: 'list/form', element: <CustomerForm /> },
            { path: 'list/form/:id', element: <CustomerForm /> },
            { path: 'template', element: <CustomerTemplate /> },
            { path: 'merge', element: <CustomerMerge /> },
            { path: 'material-data', element: <CustomerStaticData /> },
            { path: 'import', element: <CustomerImport /> }
          ]
        },
        {
          path: 'staff',
          children: [
            { path: '', element: <Navigate to="/staff/list" /> },
            { path: 'dashboard', element: <StaffDashboard /> },
            { path: 'list', element: <StaffList /> },
            { path: 'list/form', element: <StaffForm /> },
            { path: 'list/form/:id', element: <StaffForm /> },
            { path: 'leave-approval', element: <StaffLeaveApproval /> },
            { path: 'access-control', element: <StaffAccessControl /> },
            { path: 'security-group', element: <StaffSecurityGroup /> },
            { path: 'security-group/form', element: <StaffSecurityGroupForm /> },
            { path: 'security-group/form/:id', element: <StaffSecurityGroupForm /> },
            { path: 'schedule', element: <StaffSchedule /> },
            { path: 'profile/view/:id', element: <StaffViewProfile /> },
            { path: 'profile/edit/:id', element: <StaffEditProfile /> },
            { path: 'material-data', element: <StaffStaticData /> },
            { path: 'absent', element: <StaffAbsent /> }
          ]
        },
        {
          path: 'promotion',
          children: [
            { path: '', element: <Navigate to="/promotion/dashboard" /> },
            { path: 'dashboard', element: <PromotionDashboard /> },
            { path: 'discount', element: <PromotionDiscount /> },
            { path: 'partner', element: <PromotionPartner /> },
            { path: 'partner/form', element: <PromotionPartnerForm /> },
            { path: 'partner/form/:id', element: <PromotionPartnerForm /> },
            { path: 'material-data', element: <PromotionStaticData /> },
            { path: 'discount/form', element: <PromotionDiscountForm /> }
          ]
        },
        {
          path: 'service',
          children: [
            { path: '', element: <Navigate to="/service/dashboard" /> },
            { path: 'dashboard', element: <ServiceDashboard /> },
            { path: 'list', element: <ServiceList /> },
            { path: 'list/form', element: <ServiceListForm /> },
            { path: 'list/form/:id', element: <ServiceListForm /> },
            { path: 'treatment', element: <ServiceTreatment /> },
            { path: 'treatment/:id', element: <ServiceTreatmentForm /> },
            { path: 'category', element: <ServiceCategory /> },
            { path: 'policies', element: <ServicePolicies /> },
            { path: 'template', element: <ServiceTemplate /> },
            { path: 'material-data', element: <ServiceStaticData /> },
            { path: 'import', element: <ServiceImport /> }
          ]
        },
        {
          path: 'product',
          children: [
            { path: '', element: <Navigate to="/product/dashboard" /> },
            { path: 'dashboard', element: <ProductDashboard /> },
            { path: 'product-list', element: <ProductList /> },
            { path: 'product-list/sell/form', element: <ProductSellForm /> },
            { path: 'product-list/sell/form/:id', element: <ProductSellForm /> },
            { path: 'product-list/clinic/add', element: <ProductClinicForm /> },
            { path: 'product-list/clinic/form/:id', element: <ProductClinicForm /> },
            { path: 'product-list/inventory/add', element: <ProductInventoryDetail /> },
            { path: 'bundle', element: <ProductBundle /> },
            { path: 'bundle/form', element: <ProductBundleForm /> },
            { path: 'bundle/form/:id', element: <ProductBundleForm /> },
            { path: 'category', element: <ProductCategory /> },
            { path: 'supplier', element: <ProductSupplier /> },
            { path: 'supplier/form', element: <ProductSupplierForm /> },
            { path: 'supplier/form/:id', element: <ProductSupplierForm /> },
            { path: 'policies', element: <ProductPolicies /> },
            { path: 'restock', element: <ProductRestock /> },
            { path: 'restock/form', element: <ProductRestockForm /> },
            { path: 'restock/form/:id', element: <ProductRestockForm /> },
            { path: 'transfer', element: <ProductTransfer /> },
            { path: 'delivery-agent', element: <ProductDeliveryAgents /> },
            { path: 'material-data', element: <ProductStaticData /> }
          ]
        },
        {
          path: 'location',
          children: [
            { path: '', element: <Navigate to="/location/dashboard" /> },
            { path: 'dashboard', element: <LocationDashboard /> },
            { path: 'location-list', element: <LocationList /> },
            { path: 'location-list/add', element: <LocationDetail /> },
            { path: 'location-list/:code', element: <LocationDetail /> },
            { path: 'facilities', element: <LocationFacilities /> },
            { path: 'facilities/add', element: <LocationFacilitiesDetail /> },
            { path: 'facilities/:id', element: <LocationFacilitiesDetail /> },
            { path: 'material-data', element: <LocationStaticData /> }
          ]
        },
        {
          path: 'finance',
          children: [
            { path: 'dashboard', element: <FinanceDashboard /> },
            { path: 'sales', element: <FinanceSales /> },
            { path: 'quotation', element: <FinanceQuotation /> },
            { path: 'expenses', element: <FinanceExpenses /> },
            { path: 'material-data', element: <FinanceStaticData /> }
          ]
        },
        {
          path: 'menu',
          children: [
            { path: 'time-keeper', element: <TimeKeeperAbsent /> },
            { path: 'group', element: <MenuGroup /> },
            { path: 'children', element: <MenuGroupChildren /> },
            { path: 'grand-children', element: <MenuGroupGrandChildren /> },
            { path: 'profile', element: <MenuProfile /> },
            { path: 'setting', element: <MenuSetting /> },
            { path: 'report', element: <MenuReport /> }
          ]
        },
        {
          path: '403',
          element: <ForbiddenPage />
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
