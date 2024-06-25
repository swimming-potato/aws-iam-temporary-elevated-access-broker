import React, {FunctionComponent, useEffect, useState} from 'react';
import {ColumnLayout, Container, Box, Button} from "aws-northstar";
import Stack from "aws-northstar/layouts/Stack";
import './styles.css';
import TEA from "./TEA.png";
import { signInWithRedirect,fetchAuthSession, JWT } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

import {IUserInfo} from "../../interfaces";
import {useDispatch} from "react-redux";

import {
    storeUserInfoAction
} from "../../redux/actions";
import ApiHandler from "../../common/api";
import {useHistory} from "react-router-dom";

const Homepage: FunctionComponent = () => {
    return <Stack>
        <HomepageContent/>
    </Stack>
}

// The content in the main content area of the App layout
export function HomepageContent() {

		const [user, setUser] = useState<IUserInfo | undefined>(undefined);
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
						getUser();
						break;
					case 'tokenRefresh':
						getUser();
						break;
					case "signInWithRedirect_failure":
						setError("An error has occurred during the OAuth flow.");
						break;
				}
			});
	
			getUser();
	
			return unsubscribe;
		}, []);
	
		const getUser = async (): Promise<void> => {
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
					} 

					userInfo.user = `${idToken?.payload['email']}` ?? "" as string;
			

          const authorization_value1 = 'Bearer '.concat(accessToken?.toString() ??  "");
          const authorization_value2 = authorization_value1.concat(' ');
          const authorization_value3 = authorization_value2.concat(idToken?.toString() ?? "");
    
          userInfo.token = authorization_value3;
            
          dispatch(storeUserInfoAction(userInfo));
					setUser(userInfo);
					return;

				}
			} catch (error) {
				console.error(error);
				console.log("Not signed in");
			}

			setUser(undefined);
			return

		};
	
    const onOpenClick = () => {
			if(user)
			 history.push(getLink());
			else
				signInWithRedirect();
    }

    const getLink = () => {

			if(user){
        if (user?.requester) {
            return "/Request-dashboard";
        } else if (user?.reviewer) {
            return "/Review-dashboard";
        } else if (user.auditor) {
            return "/Audit-dashboard"
				}
			}

      return "/"
        
    }

		useEffect(() => {
			onOpenClick();
		});

    return (
        <div>
            <div className="awsui-grid awsui-util-p-s">
                <div className="awsui-util-pt-xxl awsui-row">
                    <div
                        className="custom-home-main-content-area col-xxs-10 offset-xxs-1 col-s-6 col-l-5 offset-l-2 col-xl-6">

                        <Container headingVariant='h4'
                                   title="Security & Control">
                            <div className="awsui-util-container back_ground_white text_black border_black">
                                <h1 className="awsui-text-large">
                                    <strong>&nbsp;&nbsp;Temporary elevated access broker</strong>
                                </h1>
                                <div><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Allow users to request
                                    temporary elevated access to your AWS environment</strong></div>
                                <div>
                                    <br/>
                                </div>
                                <Box>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<Button variant="primary" onClick={onOpenClick}>Open
                                    dashboard</Button>&nbsp;&nbsp;&nbsp;&nbsp;
                                </Box>
                                <div className="awsui-util-container-header">
                                    {/*<h2>How it works</h2>*/}
                                </div>
                            </div>
                        </Container>

                        <Container headingVariant='h4'
                                   title="Architecture">
                            <div className="awsui-util-container back_ground_white text_black border_black">
                                <div className="awsui-util-container-header">
                                    {/*<h2>How it works</h2>*/}
                                </div>
                                <img src={TEA} width="50%" height="50%" alt="temporary elevated access"/>
                            </div>
                        </Container>

                        <Container headingVariant='h4'
                                   title="How it works">
                            <div className="awsui-util-container">

                                <div>
                                    <ColumnLayout>

                                        <div data-awsui-column-layout-root={true}>
                                            <ul>
                                                <li>
                                                    Configure this tool to integrate with your identity provider (IdP)
                                                    using OpenID Connect (see documentation for details)
                                                </li>

                                                <li>
                                                    Once configured, the tool will use the IdP to authenticate users,
                                                    and to authorize them based on their group memberships
                                                </li>

                                                <li>
                                                    Create IAM roles in your AWS environment for temporary elevated
                                                    access by giving them a trust policy that allows them to invoked via
                                                    this tool (see documentation for details)
                                                </li>

                                                <li>
                                                    Users can request temporary elevated access to your AWS environment
                                                    if they are eligible to do so, based on their group memberships in
                                                    the IdP
                                                </li>

                                                <li>
                                                    The tool infers that a user is eligible to request temporary
                                                    elevated access to IAM role «role» in AWS account ID «account» if
                                                    they belong to a group named "aws-temp#«role»#«account»"
                                                    <ul>
                                                        <li>Example: A user is eligible to request temporary elevated
                                                            access to IAM role "S3Admin" in AWS account ID
                                                            "111122223333" if they belong to a group named
                                                            "aws-temp#S3Admin#111122223333"
                                                        </li>
                                                        <li>Note: The tool can be modified to apply more sophisticated
                                                            mappings between IdP groups and role-account combinations,
                                                            as required - for example, using business rules or an
                                                            internal policy store
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li>
                                                    While raising a request, a user is prompted to supply additional
                                                    information
                                                    <ul>
                                                        <li>Note: By default, the tool prompts the user for a free-text
                                                            justification field, an “Emergency” switch, and a duration.
                                                            The justification and “Emergency” field are for
                                                            informational purposes only. The duration is the length of
                                                            time during which they can invoke sessions. It does not
                                                            affect the length of each session.
                                                        </li>
                                                        <li>Note: The tool can be modified to capture additional data
                                                            such as change ticket or incident ticket IDs
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li>
                                                    Once raised, a request is evaluated to determine whether it will be
                                                    approved or rejectedOnce raised, a request is evaluated to determine
                                                    whether it will be approved or rejected
                                                    <ul>
                                                        <li>The default evaluation process is a simple, single-step
                                                            human approval
                                                        </li>
                                                        <li>An approver is any user who belongs to a group in the IdP
                                                            named "aws-temp#Approver"
                                                        </li>
                                                        <li>Note: The tool can be modified to substitute your own
                                                            evaluation process, based on your requirements
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li>
                                                    Users are notified when their requests are approved or rejected
                                                </li>

                                                <li>
                                                    A user can log in and see their previous requests, including the
                                                    approval status of each request they have raised
                                                </li>

                                                <li>
                                                    From the time when a user's request is approved to when the
                                                    requested duration ends:
                                                    <ul>
                                                        <li>The user can click the "Access console" button next to that
                                                            request, to invoke a session in the AWS Management Console
                                                            using the approved IAM role and AWS account
                                                        </li>
                                                        <li>The user can also click the "CLI" button next to that
                                                            request to obtain temporary credentials which they can use
                                                            with the AWS CLI, for the same role and account
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li>
                                                    Each session lasts 1 hour
                                                </li>

                                                <li>
                                                    A user can invoke as many sessions as they need to, for the duration
                                                    of their approved request
                                                </li>

                                                <li>
                                                    When the elevated access period ends, the user can no longer invoke
                                                    sessions
                                                    <ul>
                                                        <li>If they need further access they must raise another
                                                            request
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li>
                                                    Users can raise multiple concurrent requests for different
                                                    role-account combinations, as long as they are eligible
                                                </li>
                                            </ul>

                                        </div>

                                    </ColumnLayout>
                                </div>
                            </div>
                        </Container>

                    </div>

                </div>
            </div>
        </div>
    );
}



