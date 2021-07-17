export const menus = [
  {
    id: 0,
    title: process.env.REACT_APP_APP_NAME,
    subMenu: [
      { path: '/about', title: 'About Us' },
      { path: '/terms', title: 'Terms of Service' },
      { path: '/privacy', title: 'Privacy Policy' },
      { path: '/disclaimer', title: 'Disclaimer' },
    ]
  },
  {
    id: 1,
    title: 'Resources',
    subMenu: [
      { path: '/news', title: 'News & Updates' },
      { path: '/blog/beginner-guide-2021', title: 'Blog' },
      { path: '/widgets', title: 'Widgets' },
    ]
  },
  {
    id: 2,
    title: 'Donations',
    subMenu: [
      { path: `https://www.blockchain.com/btc/address/${process.env.REACT_APP_BITCOIN_ADDRESS}`, title: 'Bitcoin', target: '_blank', outer: true, image: 'https://assets.coingecko.com/coins/images/1/thumb_2x/bitcoin.png' },
      { path: `https://etherscan.io/address/${process.env.REACT_APP_ETHEREUM_ADDRESS}`, title: 'Ethereum', target: '_blank', outer: true, image: 'https://assets.coingecko.com/coins/images/279/thumb_2x/ethereum.png' },
      { path: `https://bscscan.com/address/${process.env.REACT_APP_BINANCE_ADDRESS}`, title: 'BNB', target: '_blank', outer: true, image: 'https://assets.coingecko.com/coins/images/825/thumb_2x/binance-coin-logo.png' },
      { path: `https://blockchair.com/litecoin/address/${process.env.REACT_APP_LITECOIN_ADDRESS}`, title: 'Litecoin', target: '_blank', outer: true, image: 'https://assets.coingecko.com/coins/images/2/thumb_2x/litecoin.png' },
    ]
  },
  {
    id: 3,
    title: 'Socials',
    subMenu: [
      // { path: `https://www.facebook.com/`, title: 'Facebook', target: '_blank', outer: true },
      { path: `https://www.twitter.com/${process.env.REACT_APP_TWITTER_NAME}`, title: 'Twitter', target: '_blank', outer: true },
      { path: `https://t.me/${process.env.REACT_APP_TELEGRAM_NAME}`, title: 'Telegram', target: '_blank', outer: true },
    ]
  },
];
