import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';
import Login from "./Login"
import {Form, Icon, Input, Button, Checkbox, message} from 'antd';

const FormItem = Form.Item;
const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("Signup Tests", () => {
    let props;
    let login;
    let push_counter;
    const historyMock = {
        push: function () {
            push_counter++;
        }
    };

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
            history: historyMock,
        };
        login = shallow(<Login {...props} history={historyMock}/>);
        push_counter = 0;
    });

    it("Does not crash", () => {
    });

    it("As the user is authenticated it is redirected", () => {
        props.isAuthenticated = true;
        login = shallow(<Login {...props} history={historyMock}/>);
        expect(push_counter).toBe(1);
    });

    it("As the user is not authenticated it is not redirected", () => {
        expect(push_counter).toBe(0);
    });

    it("Only one Form", () => {
        expect(login.find(Form).length).toBe(1);
    });

    it("Four Form Item", () => {
        expect(login.find(FormItem).length).toBe(4);
    });

    it("Two Inputs", () => {
        expect(login.find(Input).length).toBe(2);
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
