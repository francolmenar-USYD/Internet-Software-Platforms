import AlbumView from "./AlbumView.js";
import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';
import AlbumList from './AlbumListView'
import CustomLayout from "./Layout";

const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("AlbumView Container Tests", () => {
    let props;
    let albumView;
    let push_counter;
    const historyMock = {
        push: function () {
            push_counter++;
        }
    };

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
            history: historyMock,
        };
        push_counter = 0;
        albumView = shallow(<AlbumView {...props} history={historyMock}/>);
    });

    it("Does not crash", () => {
    });

    it("As the user is not authenticated it is redirected", () => {
        props.isAuthenticated = false;
        albumView = shallow(<AlbumView {...props} history={historyMock}/>);
        expect(push_counter).toBe(1);
    });

    it("As the user is  authenticated it is not redirected", () => {
        expect(push_counter).toBe(0);
    });

    it("Only one AlbumList", () => {
        expect(albumView.find(AlbumList).length).toBe(1);
    });

    it("Props passed correctly to ArtistList", () => {
        expect(albumView.find(AlbumList).props().props).toEqual(props);
    });

    it("Only one CustomLayout", () => {
        expect(albumView.find(CustomLayout).length).toBe(1);
    });

    it("Props passed correctly to CustomLayout", () => {
        expect(albumView.find(CustomLayout).props().app).toEqual(props);
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


