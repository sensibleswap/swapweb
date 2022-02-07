export default [
  { exact: true, path: '/', component: '@/pages/home' },
  { path: '/swap', component: '@/pages/swapPage' },
  { path: '/swap/:id', component: '@/pages/swapPage' },
  { path: '/pool/add', component: '@/pages/addLiq' },
  { path: '/pool/:id/add', component: '@/pages/addLiq' },
  { path: '/pool/remove', component: '@/pages/remove' },
  { path: '/pool/:id/remove', component: '@/pages/remove' },
  { path: '/pool/create', component: '@/pages/createPair' },
  { path: '/pool/:id/create', component: '@/pages/createPair' },
  { path: '/webwallet', component: '@/pages/webwallet' },
  { path: '/farm', component: '@/pages/farm' },
  { path: '/farm/:id', component: '@/pages/farm' },
];
