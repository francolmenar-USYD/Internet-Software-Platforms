import ArtistList from './ArtistListView'
import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';
import Artists from '../components/Artist'

const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("ArtistListView Container Test", () => {
    let props;
    let artistList;

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
        artistList = shallow(<ArtistList  props={props}/>);
    });

    it("Does not crash when rendering", () => {
        render(artistList);
    });

    it("Only one Artist Component", () => {
        expect(artistList.find(Artists).length).toBe(1);
    });

    it("Artist empty", () => {
        expect(artistList.data).toEqual(undefined);
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
