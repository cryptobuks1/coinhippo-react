import Landing from '../components/landing';
import Coin from '../components/coins/coin';
import MarketCap from '../components/coins/marketcap';
import HighVolume from '../components/coins/high-volume';
import Categories from '../components/coins/categories';
import Defi from '../components/coins/defi';
import Nfts from '../components/coins/nfts';
import Bsc from '../components/coins/bsc';
import Polkadot from '../components/coins/polkadot';
import Category from '../components/coins/category';
import Address from '../components/explorers/address';
import Transaction from '../components/explorers/transaction';
import Perpetuals from '../components/derivatives/perpetuals';
import Futures from '../components/derivatives/futures';
import PublicCompanies from '../components/public-companies';
import SpotExchanges from '../components/exchanges/spot';
import DexExchanges from '../components/exchanges/dex';
import DerivativesExchanges from '../components/exchanges/derivatives';
import Exchange from '../components/exchanges/exchange';
import News from '../components/news/news';
import Updates from '../components/news/updates';
import Events from '../components/news/events';
import Blog from '../components/blog';
import Terms from '../pages/statics/terms';
import Privacy from '../pages/statics/privacy';
import Disclaimer from '../pages/statics/disclaimer';
import AboutUs from '../pages/statics/aboutus';
import Widgets from '../components/widgets';
import WidgetCoin from '../components/widgets/coins/coin';
import WidgetGlobal from '../components/widgets/global';
import WidgetMarketCap from '../components/widgets/coins/marketcap';
import WidgetDefi from '../components/widgets/coins/defi';
import WidgetNfts from '../components/widgets/coins/nfts';
import WidgetBsc from '../components/widgets/coins/bsc';
import WidgetPolkadot from '../components/widgets/coins/polkadot';
import WidgetCategory from '../components/widgets/coins/category';
import WidgetWatchlist from '../components/widgets/coins/watchlist';
import WidgetSpot from '../components/widgets/exchanges/spot';
import WidgetDex from '../components/widgets/exchanges/dex';
import WidgetDerivatives from '../components/widgets/exchanges/derivatives';
import WidgetHippoAlert from '../components/widgets/hippo-alert';
import Error404 from '../pages/errors/error404';

export const routes = [
  { path: '/', Component: Landing, exact: true },
  { path: '/coins', Component: MarketCap, exact: true },
  { path: '/coins/high-volume', Component: HighVolume, exact: true },
  { path: '/coins/categories', Component: Categories, exact: true },
  { path: '/coins/defi', Component: Defi, exact: true },
  { path: '/coins/nfts', Component: Nfts, exact: true },
  { path: '/coins/bsc', Component: Bsc, exact: true },
  { path: '/coins/polkadot', Component: Polkadot, exact: true },
  { path: '/coins/:category_id', Component: Category, exact: true },
  { path: '/coin/:coin_id', Component: Coin, exact: true },
  { path: '/explorer/:chain', Component: Address, exact: true },
  { path: '/explorer/:chain/:address', Component: Address, exact: true },
  { path: '/explorer/:chain/tx/:tx_hash', Component: Transaction, exact: true },
  { path: '/derivatives', Component: Perpetuals, exact: true },
  { path: '/derivatives/futures', Component: Futures, exact: true },
  { path: '/public-companies/:coin_id', Component: PublicCompanies, exact: true },
  { path: '/exchanges', Component: SpotExchanges, exact: true },
  { path: '/exchanges/dex', Component: DexExchanges, exact: true },
  { path: '/exchanges/derivatives', Component: DerivativesExchanges, exact: true },
  { path: '/exchange/:exchange_id', Component: Exchange, exact: true },
  { path: '/news', Component: News, exact: true },
  { path: '/updates', Component: Updates, exact: true },
  { path: '/events', Component: Events, exact: true },
  { path: '/blog', Component: Blog, exact: true },
  { path: '/blog/:category_id', Component: Blog, exact: true },
  { path: '/blog/:category_id/:post_id', Component: Blog, exact: true },
  { path: '/terms', Component: Terms, exact: true, static: true },
  { path: '/privacy', Component: Privacy, exact: true, static: true },
  { path: '/disclaimer', Component: Disclaimer, exact: true, static: true },
  { path: '/about', Component: AboutUs, exact: true, static: true },
  { path: '/widgets', Component: Widgets, exact: true },
  { path: '/widget/coin/:coin_id', Component: WidgetCoin, exact: true },
  { path: '/widget/global', Component: WidgetGlobal, exact: true },
  { path: '/widget/coins', Component: WidgetMarketCap, exact: true },
  { path: '/widget/coins/defi', Component: WidgetDefi, exact: true },
  { path: '/widget/coins/nfts', Component: WidgetNfts, exact: true },
  { path: '/widget/coins/bsc', Component: WidgetBsc, exact: true },
  { path: '/widget/coins/polkadot', Component: WidgetPolkadot, exact: true },
  { path: '/widget/coins/watchlist', Component: WidgetWatchlist, exact: true },
  { path: '/widget/coins/:category_id', Component: WidgetCategory, exact: true },
  { path: '/widget/exchanges', Component: WidgetSpot, exact: true },
  { path: '/widget/exchanges/dex', Component: WidgetDex, exact: true },
  { path: '/widget/exchanges/derivatives', Component: WidgetDerivatives, exact: true },
  { path: '/widget/hippo-alert', Component: WidgetHippoAlert, exact: true },
  { Component: Error404 },
];
