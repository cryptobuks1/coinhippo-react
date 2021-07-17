import React, { Fragment, useState, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardHeader, CardBody, Badge } from 'reactstrap';
import { message } from 'antd';
import { Copy } from 'react-feather';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Widgets = props => {
  const currency = useSelector(content => content.Preferences.vs_currency);
  const theme = useSelector(content => content.Preferences.theme);
  const useWindowSize = () => {
    const [size, setSize] = useState(null);
    useLayoutEffect(() => {
      const updateSize = () => setSize(window.screen.width);
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  };
  const width = useWindowSize();

  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            <Card className="bg-transparent border-0" style={{ boxShadow: 'none' }}>
              <h1>
                <div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : 'f-24'} text-${width <= 575 ? 'left' : 'center'} mb-2`} style={{ lineHeight: 'initial' }}>{"Widgets"}</div>
                <div className={`f-w-300 text-info f-${width <= 575 ? 10 : 14} text-${width <= 575 ? 'left mt-2' : 'center'}`} style={{ lineHeight: 1.5 }}>{"Embed "}{process.env.REACT_APP_APP_NAME}{"'s cryptocurrency widgets to your website or blog for free."}</div>
              </h1>
              <Row>
                <Col lg="5" md="12" xs="12">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Coin Price Update"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/coin/bitcoin?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}`} title="Bitcoin" frameBorder="0" width={width <= 575 ? width <= 400 ? width - 32 : 400 : 400} height={width <= 575 ? 360 : 360} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/coin/bitcoin?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}" title="Bitcoin" frameborder="0" width="${width <= 575 ? width <= 400 ? width - 32 : 400 : 400}" height="${width <= 575 ? 360 : 360}"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="7" md="12" xs="12" className="mt-4 mt-lg-0">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 d-flex align-items-center mb-0">{"Coin Price Update"}<Badge color="light" pill className="f-w-300 text-secondary ml-1">{"Extended"}</Badge></h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/coin/bitcoin?extended=true&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}`} title="Bitcoin" frameBorder="0" width={width <= 640 ? width - 32 : width <= 1200 ? 576 : 640} height={width <= 640 ? 672 : 376} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/coin/bitcoin?extended=true&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}" title="Bitcoin" frameborder="0" width="${width <= 640 ? width - 32 : width <= 1200 ? 576 : 640}" height="${width <= 640 ? 672 : 376}"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="12" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Global"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/global?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}`} title="Global" frameBorder="0" width={width - (width <= 575 ? 32 : 64)} height={48} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/global?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}" title="Global" frameborder="0" width="${width - (width <= 575 ? 32 : 64)}" height="48"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Top 10 Coins"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/coins?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10`} title="Top 10 Coins" frameBorder="0" width={width <= 575 ? width - 32 : 432} height={712} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/coins?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10" title="Top 10 Coins" frameborder="0" width="${width <= 575 ? width - 32 : 432}" height="712"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Top 10 DeFi"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/coins/defi?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10`} title="Top 10 DeFi" frameBorder="0" width={width <= 575 ? width - 32 : 432} height={712} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/coins/defi?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10" title="Top 10 DeFi" frameborder="0" width="${width <= 575 ? width - 32 : 432}" height="712"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Top 10 NFTs"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/coins/nfts?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10`} title="Top 10 NFTs" frameBorder="0" width={width <= 575 ? width - 32 : 432} height={712} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/coins/nfts?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10" title="Top 10 NFTs" frameborder="0" width="${width <= 575 ? width - 32 : 432}" height="712"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Top 10 BSC"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/coins/bsc?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10`} title="Top 10 BSC" frameBorder="0" width={width <= 575 ? width - 32 : 432} height={712} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/coins/bsc?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10" title="Top 10 BSC" frameborder="0" width="${width <= 575 ? width - 32 : 432}" height="712"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Top 10 Polkadot"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/coins/polkadot?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10`} title="Top 10 Polkadot" frameBorder="0" width={width <= 575 ? width - 32 : 432} height={712} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/coins/polkadot?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10" title="Top 10 Polkadot" frameborder="0" width="${width <= 575 ? width - 32 : 432}" height="712"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Watchlist"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/coins/watchlist?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&coins=bitcoin,ethereum,binancecoin,dogecoin,matic-network,solana,uniswap,chainlink,theta-token,enjincoin`} title="Watchlist" frameBorder="0" width={width <= 575 ? width - 32 : 432} height={712} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/coins/watchlist?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&coins=bitcoin,ethereum,binancecoin,dogecoin,matic-network,solana,uniswap,chainlink,theta-token,enjincoin" title="Watchlist" frameborder="0" width="${width <= 575 ? width - 32 : 432}" height="712"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Top 10 Exchanges"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/exchanges?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10`} title="Top 10 Exchanges" frameBorder="0" width={width <= 575 ? width - 32 : 456} height={688} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/exchanges?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10" title="Top 10 Exchanges" frameborder="0" width="${width <= 575 ? width - 32 : 456}" height="688"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Top 10 DEX"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/exchanges/dex?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10`} title="Top 10 DEX" frameBorder="0" width={width <= 575 ? width - 32 : 456} height={728} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/exchanges/dex?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10" title="Top 10 DEX" frameborder="0" width="${width <= 575 ? width - 32 : 456}" height="728"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="12" xs="12" className="mt-4">
                  <Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent py-3 px-0" style={{ borderBottom: 'none' }}>
                      <h1 className="f-18 mb-0">{"Top 10 Derivatives"}</h1>
                    </CardHeader>
                    <CardBody className="p-0" style={{ display: 'grid' }}>
                      <iframe src={`${process.env.REACT_APP_SITE_URL}/widget/exchanges/derivatives?currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10`} title="Top 10 Derivatives" frameBorder="0" width={width <= 575 ? width - 32 : 456} height={752} className="mx-auto" />
                      <CopyToClipboard
                        text={`<iframe src="${process.env.REACT_APP_SITE_URL}/widget/exchanges/derivatives?&currency=${currency}&theme=${theme === 'dark-only' ? 'dark' : 'light'}&n=10" title="Top 10 Derivatives" frameborder="0" width="${width <= 575 ? width - 32 : 456}" height="752"></iframe>`}
                        className="f-14 f-w-400 text-info text-left d-flex align-items-center mt-3 mx-auto"
                      >
                        <Badge
                          color="light"
                          pill
                          onClick={() => { message.destroy(); message.success('Copied'); }}
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                        >
                          {"Copy iframe"}
                          <Copy className="mb-1 ml-1" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </Badge>
                      </CopyToClipboard>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

export default Widgets;
