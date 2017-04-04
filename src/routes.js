import React from 'react';
import { IndexRoute, Route } from 'react-router';
import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import { ArticlesLayout } from 'layouts';
import {
  App, Home, Chat, Login, LoginSuccess, WorldPage, NotFound,
  NewArticlePage, ArticlesPage, ArticlePage
} from 'containers';

export default (store) => {
  const requireLogin = (nextState, replace, cb) => {
    function checkAuth() {
      const { auth: { user }} = store.getState();
      if (!user) {
        // oops, not logged in, so can't be here!
        replace('/');
      }
      cb();
    }

    if (!isAuthLoaded(store.getState())) {
      store.dispatch(loadAuth()).then(checkAuth);
    } else {
      checkAuth();
    }
  };

  return (
    <Route path="/" component={App}>
      { /* Home (main) route */ }
      <IndexRoute component={Home} />

      { /* Routes requiring login */ }
      <Route onEnter={requireLogin}>
        <Route path="loginSuccess" component={LoginSuccess}/>
        <Route path="chat" component={Chat} />
      </Route>

      { /* Routes */ }
      <Route path="login" component={Login} />
      <Route path="world" component={WorldPage} />

      <Route path="articles" component={ArticlesLayout}>
        <IndexRoute component={ArticlesPage} />
        <Route path="/article/:id" component={ArticlePage} />
        <Route path="add" component={NewArticlePage} />
      </Route>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
