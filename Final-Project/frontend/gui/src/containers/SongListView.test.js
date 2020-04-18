import SongListView from "./SongListView.js"
import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';
import CustomLayout from './Layout'
import {Table, Button, Input, Popover, List, Pagination, message} from 'antd'
import AudioPlayer from '../components/audioPlayer';

const Search = Input.Search;
const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("SongListView Tests", () => {
    let props;
    let songListView;
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
            location: {
                search: function () {

                },
                pathname: "/songs"
            },
            history: historyMock,
        };
        push_counter = 0;
        songListView = shallow(<SongListView {...props} history={historyMock}/>);
    });

    it("Does not crash", () => {
    });

    it("As the user is not authenticated it is redirected", () => {
        props.isAuthenticated = false;
        push_counter = 0;
        songListView = shallow(<SongListView {...props} history={historyMock}/>);
        expect(push_counter).toBeGreaterThan(0);
    });

    it("As the user is  authenticated it is not redirected", () => {
        expect(push_counter).toBe(0);
    });

    it("Only one Search", () => {
        expect(songListView.find(Search).length).toBe(1);
    });

    it("Only one CustomLayout", () => {
        expect(songListView.find(CustomLayout).length).toBe(1);
    });

    it("Props passed correctly to CustomLayout", () => {
        expect(songListView.find(CustomLayout).props().app).toEqual(props);
    });

    it("Only one AudioPlayer", () => {
        expect(songListView.find(AudioPlayer).length).toBe(1);
    });

    it("Only one Table", () => {
        expect(songListView.find(Table).length).toBe(1);
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
