import React, {FunctionComponent} from 'react';
import { Container, Box, Button} from "aws-northstar";
import Stack from "aws-northstar/layouts/Stack";
import './styles.css';

import {useAuthentication} from '../Authentication/Authenticator';


import {useHistory} from "react-router-dom";

const Homepage: FunctionComponent = () => {
    return <Stack>
        <HomepageContent/>
    </Stack>
}



// The content in the main content area of the App layout
export function HomepageContent() {

    const history = useHistory();

		const {user} = useAuthentication();

    const onOpenClick = () => {
				history.push(getLink());
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

      return "/Login"
        
    }

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
                                <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ultricies massa tortor, non varius ipsum eleifend et. Etiam dapibus rutrum enim, in maximus diam tincidunt non. Vivamus lacinia molestie mauris at sagittis. Maecenas auctor erat dui. Proin fermentum tempor viverra. Mauris vulputate, nibh in faucibus congue, magna lorem posuere tortor, quis consectetur lectus odio ultrices est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla facilisi. Mauris ipsum ex, ultrices id dolor eu, dictum maximus sem. Nulla facilisi. Etiam eget orci id odio mattis sagittis. Aliquam non metus ut justo aliquam dictum sed et ligula. Nunc nibh ante, scelerisque ut egestas a, interdum nec neque. Duis auctor ligula in augue faucibus, ac maximus nulla faucibus. Proin in orci laoreet, tincidunt erat nec, auctor eros.</div>
                                <div>
                                    <br/>
                                </div>
                                <Box>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<Button variant="primary" onClick={onOpenClick}>{user && user.isLogged ? 'Open dahboard' : 'Login'}</Button>&nbsp;&nbsp;&nbsp;&nbsp;
                                </Box>
                                <div className="awsui-util-container-header">
                                    {/*<h2>How it works</h2>*/}
                                </div>
                            </div>
                        </Container>

                    </div>

                </div>
            </div>
        </div>
    );
}



