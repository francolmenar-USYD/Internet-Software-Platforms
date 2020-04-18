import React from "react";
import {Route} from "react-router-dom";


export default ({component: C, props: cProps, ...rest}) =>
    <Route {...rest} render={props => (
        cProps.isAuthenticate == true
            ? <C {...props} {...cProps} />
            : <C {...props} {...cProps} />
    )}/>;
