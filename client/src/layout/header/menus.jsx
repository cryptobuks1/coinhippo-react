export const menus = [
	{
		id: 0,
		title: 'Markets',
		subMenu: [
			[{
				title: 'Coins',
				subMenu: [
					{ path: '/coins', title: 'Market Cap' },
					{ path: '/coins/high-volume', title: 'High Volume' },
					{ path: '/coins/categories', title: 'Categories' },
				]
			},
			{
				title: 'Derivatives',
				subMenu: [
					{ path: '/derivatives', title: 'Perpetuals' },
					{ path: '/derivatives/futures', title: 'Futures' },
				]
			},
			{
				title: 'Public Companies',
				subMenu: [
					{ path: '/public-companies/bitcoin', title: 'Bitcoin Treasury' },
					{ path: '/public-companies/ethereum', title: 'Ethereum Treasury' },
				]
			}],
			{
				title: 'Categories',
				subMenu: [
					{ path: '/coins/defi', title: 'DeFi', fixed: true, preset: true },
					{ path: '/coins/nfts', title: 'NFTs', fixed: true, preset: true },
					{ path: '/coins/bsc', title: 'BSC Eco', preset: true },
					{ path: '/coins/polkadot', title: 'Polkadot Eco', preset: true },
					{ path: '/coins/solana-ecosystem', title: 'Solana Eco' },
					{ path: '/coins/polygon-ecosystem', title: 'Polygon Eco' },
					{ path: '/coins/stablecoins', title: 'Stablecoins' },
					{ path: '/coins/yield-farming', title: 'Yield Farming' },
					{ path: '/coins/meme-token', title: 'Meme Tokens' },
				]
			},
			{
				title: 'Explorers',
				subMenu: [
					{ path: '/explorer/ethereum', title: 'Ethereum', chain_id: '1', network: 'mainnet', unit: 'Ether', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/ethereum-eth-logo.png', altExplorerUrl: 'https://etherscan.io/address/{address}' },
					{ path: '/explorer/bsc', title: 'BSC', chain_id: '56', network: 'mainnet', unit: 'BNB', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/binance-coin-bnb-logo.png', altExplorerUrl: 'https://bscscan.com/address/{address}' },
					{ path: '/explorer/matic', title: 'Polygon', chain_id: '137', network: 'mainnet', unit: 'MATIC', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/polygon-matic-logo.png', altExplorerUrl: 'https://polygonscan.com/address/{address}' },
					{ path: '/explorer/avalanche', title: 'Avalanche', chain_id: '43114', network: 'mainnet', unit: 'AVAX', gas_unit: 'nAVAX', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/avalanche-avax-logo.png', altExplorerUrl: 'https://avascan.info/blockchain/c/address/{address}' },
					{ path: '/explorer/fantom', title: 'Fantom', chain_id: '250', network: 'mainnet', unit: 'FTM', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/fantom-ftm-logo.png', altExplorerUrl: 'https://ftmscan.com/address/{address}' },
					{ path: '/explorer/rsk', title: 'RSK', chain_id: '30', network: 'mainnet', unit: 'RBTC', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/rsk-mainnet-logo.png', altExplorerUrl: 'https://explorer.rsk.co/address/{address}' },
					{ path: '/explorer/arbitrum', title: 'Arbitrum', chain_id: '42161', network: 'mainnet', unit: 'Ether', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/arbitrum-mainnet-logo.png', altExplorerUrl: 'https://explorer.arbitrum.io/address/{address}' },
					{ path: '/explorer/moonbeam-moonriver', title: 'Moonbeam', chain_id: '1285', network: 'moonriver', unit: 'MOVR', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/moonbeam-logo.png', altExplorerUrl: 'https://moonriver.subscan.io/account/{address}' },
					{ path: '/explorer/moonbeam-moonbase', title: 'Moonbeam', chain_id: '1287', network: 'moonbase-alpha', unit: 'DEV', logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/moonbeam-logo.png', altExplorerUrl: 'https://moonbase.subscan.io/account/{address}' },
				],
				isReload: true
			},
		]
	},
	{
		id: 1,
		title: 'Exchanges',
		subMenu: [
			{ path: '/exchanges', title: 'Spot' },
			{ path: '/exchanges/dex', title: 'DEX' },
			{ path: '/exchanges/derivatives', title: 'Derivatives' },
		]
	},
	{
		id: 2,
		title: 'Resources',
		subMenu: [
			{ path: '/news', title: 'News & Updates' },
			{ path: '/blog/beginner-guide-2021', title: 'Blog' },
			{ path: '/widgets', title: 'Widgets' },
		]
	},
];

export const currenciesGroups = [
	{
		id: 0,
		title: 'Suggested currencies',
		currencies: [
			{ id: 'usd', title: 'US Dollar', symbol: '$', flag: 'us' },
			{ id: 'eur', title: 'Euro', symbol: '€', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/32px-Flag_of_Europe.svg.png', imgStyle: { width: '1rem', height: '.825rem' } },
			{ id: 'gbp', title: 'British Pound Sterling', symbol: '£', flag: 'gb' },
			{ id: 'btc', title: 'Bitcoin', symbol: '₿', image: 'https://assets.coingecko.com/coins/images/1/thumb_2x/bitcoin.png' },
			{ id: 'eth', title: 'Ethereum', symbol: 'Ξ', image: 'https://assets.coingecko.com/coins/images/279/thumb_2x/ethereum.png' },
		]
	},
	{
		id: 1,
		title: 'Fiat currencies',
		currencies: [
			{ id: 'usd', title: 'US Dollar', symbol: '$', flag: 'us' },
			{ id: 'aud', title: 'Australian Dollar', symbol: 'A$', flag: 'au' },
			{ id: 'brl', title: 'Brazil Real', symbol: 'R$', flag: 'br' },
			{ id: 'cad', title: 'Canadian Dollar', symbol: 'CA$', flag: 'ca' },
			{ id: 'chf', title: 'Swiss Franc', flag: 'ch' },
			{ id: 'clp', title: 'Chilean Peso', flag: 'cl' },
			{ id: 'cny', title: 'Chinese Yuan', symbol: 'CN¥', flag: 'cn' },
			{ id: 'czk', title: 'Czech Koruna', flag: 'cz' },
			{ id: 'dkk', title: 'Danish Krone', flag: 'dk' },
			{ id: 'eur', title: 'Euro', symbol: '€', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/32px-Flag_of_Europe.svg.png', imgStyle: { width: '1rem', height: '.825rem' } },
			{ id: 'gbp', title: 'British Pound Sterling', symbol: '£', flag: 'gb' },
			{ id: 'hkd', title: 'Hong Kong Dollar', symbol: 'HK$', flag: 'hk' },
			{ id: 'huf', title: 'Hungarian Forint', flag: 'hu' },
			{ id: 'idr', title: 'Indonesian Rupiah', flag: 'id' },
			{ id: 'ils', title: 'Israeli New Shekel', symbol: '₪', flag: 'il' },
			{ id: 'inr', title: 'Indian Rupee', symbol: '₹', flag: 'in' },
			{ id: 'jpy', title: 'Japanese Yen', symbol: '¥', flag: 'jp' },
			{ id: 'krw', title: 'South Korean Won', symbol: '₩', flag: 'kr' },
			{ id: 'kwd', title: 'Kuwaiti Dinar', flag: 'kw' },
			{ id: 'lkr', title: 'Sri Lankan Rupee', flag: 'lk' },
			{ id: 'mmk', title: 'Burmese Kyat', flag: 'mm' },
			{ id: 'mxn', title: 'Mexican Peso', symbol: 'MX$', flag: 'mx' },
			{ id: 'myr', title: 'Malaysian Ringgit', symbol: 'RM', flag: 'my' },
			{ id: 'ngn', title: 'Nigerian Naira', flag: 'ng' },
			{ id: 'nok', title: 'Norwegian Krone', flag: 'no' },
			{ id: 'nzd', title: 'New Zealand Dollar', symbol: 'NZ$', flag: 'nz' },
			{ id: 'php', title: 'Philippine Peso', symbol: '₱', flag: 'ph' },
			{ id: 'pkr', title: 'Pakistani Rupee', flag: 'pk' },
			{ id: 'pln', title: 'Polish Zloty', flag: 'pl' },
			{ id: 'rub', title: 'Russian Ruble', flag: 'ru' },
			{ id: 'sar', title: 'Saudi Riyal', flag: 'sa' },
			{ id: 'sek', title: 'Swedish Krona', flag: 'se' },
			{ id: 'sgd', title: 'Singapore Dollar', symbol: 'S$', flag: 'sg' },
			{ id: 'thb', title: 'Thai Baht', flag: 'th' },
			{ id: 'try', title: 'Turkish Lira', flag: 'tr' },
			{ id: 'twd', title: 'New Taiwan Dollar', symbol: 'NT$', flag: 'tw' },
			{ id: 'uah', title: 'Ukrainian hryvnia', flag: 'ua' },
			{ id: 'vef', title: 'Venezuelan bolívar fuerte', flag: 've' },
			{ id: 'vnd', title: 'Vietnamese đồng', flag: 'vn' },
			{ id: 'zar', title: 'South African Rand', flag: 'za' },
		]
	},
	{
		id: 2,
		title: 'Cryptocurrencies',
		currencies: [
			{ id: 'btc', title: 'Bitcoin', symbol: '₿', image: 'https://assets.coingecko.com/coins/images/1/thumb_2x/bitcoin.png' },
			{ id: 'eth', title: 'Ethereum', symbol: 'Ξ', image: 'https://assets.coingecko.com/coins/images/279/thumb_2x/ethereum.png' },
			{ id: 'xrp', title: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/thumb_2x/xrp-symbol-white-128.png' },
			{ id: 'bch', title: 'Bitcoin Cash', image: 'https://assets.coingecko.com/coins/images/780/thumb_2x/bitcoin-cash-circle.png' },
			{ id: 'ltc', title: 'Litecoin', image: 'https://assets.coingecko.com/coins/images/2/thumb_2x/litecoin.png' },
		]
	},
];
