export default defineAppConfig({
  pages: [
    'pages/today/index',
    'pages/register/index',
    'pages/records/index',
    'pages/confirm/index',
    'pages/ranking/index',
    'pages/complaint-detail/index',
    'pages/customer-search/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '客诉协商',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F8F7FC',
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#6B5CE7',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/today/index',
        text: '今日待办',
      },
      {
        pagePath: 'pages/register/index',
        text: '快速登记',
      },
      {
        pagePath: 'pages/records/index',
        text: '协商记录',
      },
      {
        pagePath: 'pages/confirm/index',
        text: '赔付确认',
      },
      {
        pagePath: 'pages/ranking/index',
        text: '门店排行',
      },
    ],
  },
});
