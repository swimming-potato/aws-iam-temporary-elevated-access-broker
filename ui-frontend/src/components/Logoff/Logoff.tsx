import React, {FunctionComponent, useEffect} from 'react';
import {useAuthentication} from '../Authentication/Authenticator';

const LogoffForm: FunctionComponent = () => {

	const {signOut} = useAuthentication();


  useEffect( () => {
		signOut();
		
  });

  return <div />
}

export default LogoffForm;