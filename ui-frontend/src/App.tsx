import React, {ComponentType, FunctionComponent} from 'react';
import {BrowserRouter as Router, Route, useHistory} from 'react-router-dom';
import NorthStarThemeProvider from 'aws-northstar/components/NorthStarThemeProvider';
import AppLayout from "./components/AppLayout";
import { Amplify } from 'aws-amplify';
import {HomepageContent} from "./components/Home/HomePageContent";
import RequestDashboard from "./components/Request/RequestDashboard";
import ReviewDashboard from "./components/Review/ReviewDashboard";
import AuditDashboard from "./components/Audit/AuditDashboard";
import RequestForm from "./components/Request/RequestForm";
import LogoffForm from "./components/Logoff/Logoff";
import Login from "./components/Login/Login";
import { Authenticator }from "./components/Authentication/Authenticator";


Amplify.configure({
	Auth:
	{
		Cognito: {
			userPoolClientId: "3of948ccoaeep0tsh1dracu12b",
			userPoolId: "us-east-1_yB68XVcak",
			// OPTIONAL - Hosted UI configuration
			loginWith: {
				oauth: {
				domain: 'broker-test-witek.auth.us-east-1.amazoncognito.com',
				scopes: [
					'email',
					'profile',
					'openid',
				],
				redirectSignIn: ['https://dkjxr61d2pssw.cloudfront.net'],
				redirectSignOut: ['https://dkjxr61d2pssw.cloudfront.net'],
				responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
				}
			},
		},
		
	}
});


const withLayout = (Component: ComponentType): FunctionComponent => (props) => (
    <AppLayout>
      <Component {...props} />
    </AppLayout>);

const App = () => {
  const history = useHistory();



/*
  const restoreOriginalUri = (_oktaAuth:any, originalUri:any) => {
    history.replace(toRelativeUrl(originalUri, window.location.origin));
  }
  
  */

  return (
      <NorthStarThemeProvider>
        <Router>
						<Authenticator>
							<Route exact path='/' component={withLayout(HomepageContent)}></Route>
							<Route exact path='/Request-dashboard' component={withLayout(RequestDashboard)}/>
							<Route exact path='/Review-dashboard' component={withLayout(ReviewDashboard)}/>
							<Route exact path='/Audit-dashboard' component={withLayout(AuditDashboard)}/>
							<Route exact path='/Create-request' component={withLayout(RequestForm)}/>
							<Route exact path='/Logoff' component={withLayout(LogoffForm)}></Route>
							<Route exact path='/Login' component={withLayout(Login)}></Route>
						</Authenticator>
        </Router>
      </NorthStarThemeProvider>
      
  );
}

export default App;
