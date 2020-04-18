import AlbumList from './AlbumListView'
import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';
import Albums from '../components/Album'

const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("AlbumListView Container Test", () => {
    let props;
    let albumList;

    beforeEach(() => {
        props = {
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
            history: {
                push: function (path) {

                }
            }
        };
        albumList = shallow(<AlbumList  props={props}/>);
    });

    it("Does not crash when rendering", () => {
        render(albumList);
    });

    it("Only one Album Component", () => {
        expect(albumList.find(Albums).length).toBe(1);
    });

    it("Albums empty", () => {
        expect(albumList.data).toEqual(undefined);
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
