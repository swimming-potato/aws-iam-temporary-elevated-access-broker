import React, {FunctionComponent, useEffect} from 'react';

import {useAuthentication} from '../Authentication/Authenticator';


const LogoffForm: FunctionComponent = () => {

	const {signInWithRedirect} = useAuthentication();


  useEffect( () => {
		signInWithRedirect();
  });

  return <div />
}

export default LogoffForm;