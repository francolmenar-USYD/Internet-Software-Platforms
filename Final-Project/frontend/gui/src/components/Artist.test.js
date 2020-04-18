import {List, Card} from 'antd';
import Artists from "./Artist.js";
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


describe("Artist Component", () => {
    let props;
    let artists;
    let click_counter;
    let click_item;

    beforeEach(() => {
        props = {
            loading: false,
            data: [
                {
                    id: 265,
                    name: "X Ambassadors",
                    public: false,
                }],
            func: function (item) {
                click_item = item;
                click_counter++;
            },
        };
        click_counter = 0;
        artists = shallow(<Artists loading={props.loading} data={props.data} func={props.func}/>);
    });

    it("Only one list", () => {
        expect(artists.find(List).length).toBe(1);
    });

    it("Loading correctly assigned", () => {
        expect(artists.props().loading).toBe(props.loading);
    });

    it("DataSource correctly assigned", () => {
        expect(artists.props().dataSource).toEqual(props.data);
    });

    it("Does not crash when rendering", () => {
        render(artists);
    });

    it("Render one Card", () => {
        let card = shallow(artists.props().renderItem(props.data[0]));
        expect(card.find(Card).length).toBe(1);
    });

    it("Correct title assigned to the Card", () => {
        let item = shallow(artists.props().renderItem(props.data[0]));
        let component = item.find(Card).children();
        let title = component.props().title;
        expect(title).toEqual(props.data[0].name);
    });

    it("Click on a Card", () => {
        let card = shallow(artists.props().renderItem(props.data[0]));
        card.simulate('click');
        expect(click_counter).toBe(1);
    });

    it("No click on a Card", () => {
        expect(click_counter).toBe(0);
    });

    it("Correct item clicked", () => {
        let card = shallow(artists.props().renderItem(props.data[0]));
        card.simulate('click');
        expect(click_item).toEqual(props.data[0]);
    });
});
