const texts = {
  home_title: 'Now Hiring',
  home_content:
    'Scrypt developers and Node.js developers to deliver the first onchain dex based on BSV. We are here to present to the world the potential of Bitcoin protocol, to prove that Bitcoin can do anything all the other chains can do.',
  twitter_url: 'DM on Twitter',
  email: 'Email: hello@tokenswap.pro',
  swap: '交易',
  pool: '资金池',
  explore: '浏览',

  market: '市价',
  limit: '限价',
  done: '完成',

  about: '关于',
  txs: '交易',
  website: '网站',
  per: '每',
  pair_stat: '交易对数据',
  total_liq: '所有流动性资产',
  volume: '交易量',
  hrs: '小时',
  fees: '手续费',
  pooled_tokens: '加入资产池的资产',

  name: '名称',
  total_value: '总额',
  time: '时间',

  connect_wallet: '连接钱包',
  connected_account: '已连接的钱包',
  copy_account: '复制账户地址',
  switch_wallet: '切换钱包',
  go_to_infopage: '账户页面',
  disconnect_account: '解绑钱包',
  copied: '已复制',

  you_pay: '支付',
  your_balance: '余额',
  you_receive: '收到',
  estimated: '预估',
  price: '价格',
  slippage_tolerance: '滑点容忍值',
  enter_amount: '输入金额',
  minimum_received: '最少收到',
  price_impact: '价格影响幅度',
  fee: 'Fee',

  tx_settings: '交易设置',
  reset: '重置',
  tolerance_desc: '价格变化超过此值后你的订单会撤销/不会成交',

  select_token: '选择资产',

  search_token_holder: '用TokenID，名称或地址进行搜索',
  swapping_for: '用 %1 交换 %2',
  time_left: '预估剩余时间 %s',
  view_tx_detail: '查看交易细节',
  tx_details: '交易详情',
  status: '状态',
  volt_account: 'Volt 账户',
  paid: '支付',
  received: '收到',
  swap_fee: '矿工费',
  date: '日期',
  onchain_tx: '链上交易',
  confirmation: '已确认',

  pair_liq_pool: '资产对流动性池',
  add_liq: '提供流动性',
  add_liq_short: '提供流动性',
  remove_liq: '移除流动性',
  remove_liq_short: '移除流动性',
  create_pair: '创建交易对',
  select_pair: '选择交易对',
  promote: '完成',
  input: '添加',
  balance: '余额',
  pool_share: '价格和占池子份额',
  pooled: '池子中的资产',
  your_share: '你占据池子的比例',
  select_a_token_pair: '选择一个交易对',
  supply_liq: '提供流动性',
  pair_created: '成功创建了交易对',
  share_pair: '分享交易对 %s 的链接',

  volume_24: '24小时交易量',
  txs_24: '24小时交易笔数',
  fees_24: '24小时手续费',
  users_24: '24小时用户数',
  tokens_coins: '资产',
  asset: '资产',
  change_24: '24小时价格变化',
  last_7: '过去7天',
  market_cap: '市值',

  select_wallet_title: '选择钱包',
  permission_request: 'TokenSwap 授权请求',
  permis_tips_1: '用你的Volt账号登录',
  permis_tips_2: '使用你的Volt数据(头像, Paymail)',
  permis_tips_3: '获取你的账户余额',
  permis_tips_4: '发起交易',
  agree_switch: '同意切换',
  cancel: '取消',

  your_account: '你的账户',
  your_active: '你的活动轨迹',
  your_balances: '余额',
  your_liq: '你的流动性资产池数据',
  manage: '管理',
  no_liq: '你没有为任何交易对提供流动性',
  your_open_order: '你的限价单挂单',
  no_order: '你没有挂单',
  open_order: '挂单',
  no_active: '你最近没有任何记录',
  explore_tokens: '浏览资产概况',
  adds: '添加流动性',
  swaps: '交易',
  liq: '流动性',
  all: '所有',
  pair: '交易对',
  expires_in: '失效',
  cancel_all: '取消所有',
  total: '所有',

  back_prort: '回到你的资产组合',
  your_total_liq: '你所有的流动性',
  include_fees: '包括费用',
  fees_earned: '转到的费用收入',
  cumulative: '累积的',

  back: '返回',
  add: '添加',
  remove: '移除',
  max: '最大',
  liq_removed: '移除的流动性',
  your_pos: '你移除的仓位',
  your_re_liq: '你赎回的流动性',
  earned: 'Earned',

  connect_volt: '连接你的Volt钱包',
  scan_app: '用你的Volt钱包扫描解锁',
  refresh_url: '点击刷新二维码',
  download_app_1: '从',
  download_app_2: '或以下渠道下载',

  use_tokenswap: '交易',
  tokenswap: 'TokenSwap',
  tokenswap_desc: '基于比特币协议的链上去中心化交易所',
  documentation: '文档',
  comparisons: '比较',
  comp_ts: 'TokenSwap和其他类型交易所的异同对比',
  comp_ts_h5: '比较TokenSwap',
  feature: '关键功能',
  cex: '中心化交易所',
  other_dex: '其他 DEX',
  lb_1: '资产保存在自管钱包',
  lb_2: '链上去信任交易',
  lb_3: '充值0确认/即时确认',
  lb_4: '提币0确认/即时到账l',
  lb_5: '提币0手续费用',
  lb_6: '无 TPS性能限制 (与ETH，BTC等比较)',
  lb_7: '无需担心因交易所账户信息泄露导致资金被盗',
  lb_8: '免于中心化交易所拔网线，操纵数据，伪造数据侵害用户利益',
  lb_9: '没有抢跑交易从而损害正常交易用户利益',
  lb_10: '超低费用的即时交易撮合，即时完成交易',

  swap_anyway: '继续交易',
  select: '选择',
  first_liq_er: 'You are the first liquidity provider.',
  first_liq_er_desc:
    'The ratio of tokens you add will set the price of this pool. Once you are happy with the rate click supply to review.',
  login: '登录',
  lac_balance: '余额不足',
  lac_token_balance: '%s 余额不足',
  no_pair: '没有该交易对',
  not_enough: '超出了%s资金池存量',
  lower_amount: '金额不足',

  create_pair_tips: 'Understanding Impermanent Loss',
  create_pair_desc:
    'Before becoming a Liquidity Provider, please understand the risks involved with Impermanent Loss. You can learn more about it  here.',
  create_pair_rewards: 'Liquidity Provider Rewards',
  create_pair_rewords_desc1: 'Liquidity Providers earn a 0.35% fee',
  create_pair_rewords_desc2:
    'on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.',
  pay_account_title: 'Payment',
  from_your: 'From Your',
  send_to: 'Send to',
  pay: '支付',
  just: '刚刚',
  minute_ago: ' 分钟前',
  minutes_ago: ' 分钟前',
  hour_ago: ' 小时前',
  hours_age: ' 小时前',
  day_ago: ' 天前',
  days_ago: ' 天前',
  week_ago: ' 周前',
  weeks_ago: ' 周前',
  month_ago: ' 月前',
  months_ago: ' 月前',
  year_ago: ' 年前',
  years_ago: ' 年前',
  start_swapping: 'Start Swapping',
  start_pooling: 'Start Pooling',
  wallet_connected: 'Wallet connected',
  no_wallet_connected: 'No wallet is connected',
  account: '账户',
  withdraw: '提币',

  web_wallet: '网页钱包',
  web_wallet_tips:
    '提示：Web钱包的私钥是通过用户的用户名和密码实时计算得到，不会上传服务器，也不会保存在本地。仅供方便用户测试之用，不适合存放大量资金，建议用户妥善保管用户名+密码组合以防资金丢失，或在使用完成之后将剩余资金转移。用户名+密码组合丢失(忘记，被盗等情形)会导致资产丢失',
  web_wallet: '网页钱包',
  deposit_title: '充值',
  withdraw_title: '提款',
  availabel: '可用余额',
  amount: '金额',
  address: '地址',
  all_balance: '所有余额',
  back_to_swap: '返回到交易页面',
  swap_question: '你需要等额提供BSV/Token交易对里的两种资产到资金池',
  withdraw_success: '提币成功!',
  add_success: '增加成功',
};
module.exports = texts;
