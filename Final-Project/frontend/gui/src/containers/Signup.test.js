import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';
import { Form, Input, Tooltip, Icon, Row, Col, Checkbox, Button} from 'antd';

const FormItem = Form.Item;import SignupForm from "./Signup";
const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("Signup Tests", () => {
    let props;
    let signup;

    beforeEach(() => {
        props = {
            isAuthenticated: false,
            handleLogout: function () {

            },
            handleFold: function () {

            },
            fold: false,
            open_playlist: false,
            open_service: false,
            handleOpen: function () {

            },
            setAuthenticated: function () {

            },
            location: {
                search: function () {

                },
                pathname: "/songs"
            },
        };
        signup = render(shallow(<SignupForm {...props}/>));
    });

    it("Does not crash", () => {
    });
});


class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = value.toString();
    }

    removeItem(key) {
        delete this.store[key];
    }
}

global.localStorage = new LocalStorageMock;
