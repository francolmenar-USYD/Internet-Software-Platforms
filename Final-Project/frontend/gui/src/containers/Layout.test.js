import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';
import { Layout, Menu, Icon, Button, Input, Modal, Form, message, BackTop} from 'antd';
import CustomLayout from './Layout'

const { Header, Content, Footer, Sider} = Layout;
const SubMenu = Menu.SubMenu;
const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("Layout Tests", () => {
    let app;
    let layout;

    beforeEach(() => {
        app = {
            isAuthenticated: true,
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
        layout = shallow(<CustomLayout app={app}/>);
    });

    it("Does not crash", () => {
    });

    it("Only one Sider", () => {
        expect(layout.find(Sider).length).toBe(1);
    });

    it("Only one Logo", () => {
        expect(layout.find('div.logo').length).toBe(1);
    });

    it("Only one Modal", () => {
        expect(layout.find(Modal).length).toBe(1);
    });

    it("Only one Form", () => {
        expect(layout.find(Form).length).toBe(1);
    });

    it("Only one Menu", () => {
        expect(layout.find(Menu).length).toBe(1);
    });

    it("There are 7 menu options", () => {
        expect(layout.find(Menu.Item).length).toBe(7);
    });

    it("There are 2 SubMenus", () => {
        expect(layout.find(SubMenu).length).toBe(2);
    });

    it("Only one Footer", () => {
        expect(layout.find(Footer).length).toBe(1);
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
