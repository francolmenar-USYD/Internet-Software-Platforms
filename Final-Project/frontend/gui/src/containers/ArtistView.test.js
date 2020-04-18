import ArtistView from "./ArtistView"
import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';
import CustomLayout from './Layout'
import ArtistList from './ArtistListView'

const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("AlbumView Container Tests", () => {
    let props;
    let artistView;

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
        };
        artistView = shallow(<ArtistView {...props}/>);

    });

    it("Does not crash", () => {
    });

    it("Only one ArtistList", () => {
        expect(artistView.find(ArtistList).length).toBe(1);
    });

    it("Props passed correctly to ArtistList", () => {
        expect(artistView.find(ArtistList).props().props).toEqual(props);
    });

    it("Only one CustomLayout", () => {
        expect(artistView.find(CustomLayout).length).toBe(1);
    });

    it("Props passed correctly to CustomLayout", () => {
        expect(artistView.find(CustomLayout).props().app).toEqual(props);
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
