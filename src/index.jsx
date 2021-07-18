import React, { Fragment, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { routes } from './route';
import store from './store'
import * as serviceWorker from './serviceWorker';
import App from './components/app';
import './index.scss';
import ConfigDB from './data/customizer/config';
import { dynamicPaths } from './utils';

import { createBrowserHistory } from 'history';
const history = createBrowserHistory();
const root = document.getElementById('root');
if (root) {
  const path = (/#!(\/.*)$/.exec(window.location.hash) || [])[1];
  if (path) {
    history.replace(path);
  }
}

const Root = props => {
  const [anim, setAnim] = useState('');
  const animation = localStorage.getItem('animation') || ConfigDB.data.router_animation || 'fade';

  useEffect(() => {
    const abortController = new AbortController();
    setAnim(animation);
    console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
    console.disableYellowBox = true;
    return function cleanup() {
      abortController.abort();
    };
  }, [animation]);

  return (
    <Fragment>
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <App>
              <TransitionGroup className="w-100">
                {routes.map(({ path, Component, exact }) => (
                  <Route key={path ? path : ''} path={path} exact={exact}>
                    {({ location, match }) => {
                      if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
                        let redirectPath = location.pathname;
                        while (redirectPath.endsWith('/')) {
                          redirectPath = redirectPath.substring(0, redirectPath.length - 1);
                        }
                        return (<Redirect to={redirectPath} />);
                      }
                      else if (location.pathname.split('/').filter(p => p).length === 1) {
                        const pathSplitted = location.pathname.split('/').filter(p => p);
                        if (dynamicPaths.indexOf(pathSplitted[0]) > -1) {
                          return (<Redirect to={`${pathSplitted[0]}s`} />);
                        }
                      }
                      if (!path && match) {
                        if (match.isExact || location.key) {
                          match = null;
                        }
                        else {
                          if (routes.filter(route => route.path).findIndex(route => {
                            const routeSplited = route.path.split('/');
                            const pathSplited = location.pathname.split('/');
                            if (routeSplited.length !== pathSplited.length)
                              return false;
                            return routeSplited.findIndex((x, i) => !(x === pathSplited[i] || x.startsWith(':'))) > -1 ? false : true;
                          }) > -1) {
                            match = null;
                          }
                        }
                      }
                      if (match && match.url !== match.path && routes.findIndex(route => route.path === match.url) > -1) {
                        match = null;
                      }
                      return (
                        <CSSTransition
                          in={match !== null}
                          timeout={100}
                          classNames={anim}
                          unmountOnExit
                        >
                          <div className={`mt-0 mt-lg-1 pt-${location.pathname.indexOf('/widget/global') > -1 ? 0 : 3}`}><Component match={match} /></div>
                        </CSSTransition>
                      );
                    }}
                  </Route>
                ))}
              </TransitionGroup>
            </App>
          </Switch>
        </BrowserRouter>
      </Provider>
    </Fragment>
  );
};

ReactDOM.render(<Root/>, root);
serviceWorker.register();
