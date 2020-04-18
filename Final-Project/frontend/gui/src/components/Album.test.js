import {List, Card} from 'antd';
import Albums from "./Album.js";
import React from "react";
import Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {shallow, mount, render} from 'enzyme';

const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;
global.window = window;
global.document = window.document;
enzyme.configure({adapter: new Adapter()});


describe("Albums Component", () => {
    let props;
    let albums;
    let click_counter;
    let click_item;

    beforeEach(() => {
        props = {
            loading: false,
            data: [
                {
                    album_cover_url: "https://i.scdn.co/image/882c7c77ed3ea011d275b8fee78e1f63573285b7",
                    artist: 265,
                    artist_name: "X Ambassadors",
                    id: 378,
                    name: "Love Songs Drug Songs",
                    public: false,
                }],
            func: function (item) {
                click_item = item;
                click_counter++;
            },
        };
        click_counter = 0;
        albums = shallow(<Albums loading={props.loading} data={props.data} func={props.func}/>);
    });

    it("Only one list", () => {
        expect(albums.find(List).length).toBe(1);
    });

    it("Loading correctly assigned", () => {
        expect(albums.props().loading).toBe(props.loading);
    });

    it("DataSource correctly assigned", () => {
        expect(albums.props().dataSource).toEqual(props.data);
    });

    it("Does not crash when rendering", () => {
        render(albums);
    });

    it("Render one Card", () => {
        let card = shallow(albums.props().renderItem(props.data[0]));
        expect(card.find(Card).length).toBe(1);
    });

    it("Correct img assigned to the Card", () => {
        let item = shallow(albums.props().renderItem(props.data[0]));
        let card = item.find(Card);
        let src = card.props().cover.props.src;
        expect(src).toEqual(props.data[0].album_cover_url);
    });

    it("Correct title assigned to the Card", () => {
        let item = shallow(albums.props().renderItem(props.data[0]));
        let component = item.find(Card).children();
        let title = component.props().title;
        expect(title).toEqual(props.data[0].name);
    });

    it("Click on a Card", () => {
        let card = shallow(albums.props().renderItem(props.data[0]));
        card.simulate('click');
        expect(click_counter).toBe(1);
    });

    it("No click on a Card", () => {
        expect(click_counter).toBe(0);
    });

    it("Correct item clicked", () => {
        let card = shallow(albums.props().renderItem(props.data[0]));
        card.simulate('click');
        expect(click_item).toEqual(props.data[0]);
    });
});
