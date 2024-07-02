
import React, {useState,useEffect, FunctionComponent} from 'react';
import {IUserInfo, ReduxRoot} from "../../interfaces";
import { Hub } from "aws-amplify/utils";

import {
	storeUserInfoAction,
	clearUserInfo
} from "../../redux/actions";
import ApiHandler from "../../common/api";
import { fetchAuthSession,signInWithRedirect } from "aws-amplify/auth";
import {useDispatch,useSelector} from "react-redux";
import {useHistory} from "react-router-dom";

type Props = {
  children: string | JSX.Element | JSX.Element[] | {(): JSX.Element}
}


export function Authenticator(props: Props): JSX.Element  {

	const [error, setError] = useState<unknown>(null);
	const dispatch = useDispatch();
	const history = useHistory();

		function createReadPermissions(groups: string[]) {
			let accountMap = new Map();
			let permissions = {
				requester: false,
				reviewer: false,
				auditor: false,
			};

			console.log("Groups",groups);
			for (var group of groups) {
					if (group === 'aws-temp#Reviewer') {
							ApiHandler.reviewer = permissions.reviewer = true;
							console.log("Groups",group);
					} else if (group === 'aws-temp#Auditor') {
							ApiHandler.auditor = permissions.auditor = true;
							console.log("Groups",group);
					} else {
							let words = group.split('#');
							let account = words[2]
							let role = words[1]
							if (accountMap.has(account)) {
									accountMap.get(account).push(role)
							} else {
									let roles: Array<string> = [];
									roles.push(role);
									accountMap.set(account, roles)
							}
							
							ApiHandler.requester = permissions.requester = true;
					}
			}
			return {
				accountMap,
				...permissions,
			};
	}

		useEffect(() => {
			const unsubscribe = Hub.listen("auth", ({ payload }) => {
				console.log("Handling event", JSON.stringify(payload))
				switch (payload.event) {
					case "signInWithRedirect":
						setUser();
						break;
					case 'tokenRefresh':
						setUser();
						break;
					case 'signedOut':
						signOut();
						
						break;
					case "signInWithRedirect_failure":
						setError("An error has occurred during the OAuth flow.");
						break;
				}
			});

			setUser();

			return unsubscribe;
		}, []);

		const signOut = async(): Promise<void> => {
			dispatch(clearUserInfo());
			history.push("/");
		}

		const setUser = async (): Promise<void> => {
			try {
				const session = await fetchAuthSession()
				
				const idToken = session.tokens?.idToken;
				const accessToken = session.tokens?.accessToken;
				
				if(session.tokens?.idToken){
					const groups = session.tokens.idToken.payload['cognito:groups'] as string[];
					
					const userInfo: IUserInfo =  {
						...createReadPermissions(groups ?? []),
						token: "",
						user: "",
						isLogged: true
					} 

					userInfo.user = `${idToken?.payload['email']}` ?? "" as string;
			

					const authorization_value1 = 'Bearer '.concat(accessToken?.toString() ??  "");
					const authorization_value2 = authorization_value1.concat(' ');
					const authorization_value3 = authorization_value2.concat(idToken?.toString() ?? "");

					userInfo.token = authorization_value3;
					
						
					dispatch(storeUserInfoAction(userInfo));
					return;

				}
			} catch (error) {
				console.error(error);
				console.log("Not signed in");
			}
			return
		};

		return (
			<>
				{props.children}	
			</>
		)
}

export const useAuthentication = () => {

	const userInfo = useSelector( (state:ReduxRoot) => {
    return state.breakGlassReducerState.userInfo
  });

	const signOut = () => {
		signOut();	
	}

	return { user: userInfo, 	signInWithRedirect, signOut} 
}