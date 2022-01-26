import https from 'https';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import fs from 'fs';

export const isMonetized = async (url, views, subs) => {


    return new Promise((resolve, reject) => {
        const request = https.request(url, (response) => {

            let data = '';
            response.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            response.on('end', () => {
                const body = data;
                if (data.includes('ads') && views>=4000 && subs >= 1000) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            });
        })

        request.on('error', (error) => {
            reject(new Error(error));
        });

        request.end()




    });
}



export const WEB_LIST = async (KeyWord,IS_CANAL=false) => {


    return new Promise((resolve, reject) => {
        let vid='EgIQAQ%253D%253D',can='EgIQAg%253D%253D';
        const request = https.request(`https://www.youtube.com/results?search_query=${KeyWord}&sp=${IS_CANAL?can:vid}`, (response) => {

            let data = '';
            response.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            response.on('end', () => {
                const body = data;


                let parser = new JSDOM(body);
                let document = parser.window.document;
                let rawJS = '';
                Object.values(document.querySelectorAll('script')).map(script=>{
                    if(script.innerHTML.includes('var ytInitialData')){
                        rawJS = script.innerHTML;
                    }
                });
                let res =  new Function(rawJS+`
                    return ytInitialData;
                `);
                let videolist = res().contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
                resolve(videolist);
            });
        })

        request.on('error', (error) => {
            reject(new Error(error));
        });

        request.end()

    });
}


// --------------------------------------------------------------------------------------------------------------------------
export let apiUrl = {
    baseUrl: 'https://www.googleapis.com/youtube/v3/search?',
    part: 'snippet',
    type: 'video',
    //order: 'viewCount',
    maxResults: '',
    q: '',
    //key: 'AIzaSyAuc9S4fEC3oGMoLJbUQdV0SZ7KIon4vf8',
    key: 'AIzaSyBdgAYC6bjc0U90msoR15V03nBfvj6MN9o',
    /*prevPageToken: '',
    nextPageToken: ''*/
}

export let apiStatistics = {
    baseUrlStatistics: 'https://www.googleapis.com/youtube/v3/videos?',
    partStatistics: 'id,snippet,contentDetails,status,statistics,topicDetails',
    //partStatistics: 'statistics,snippet,contentDetails',
    //keyStatistics: 'AIzaSyAuc9S4fEC3oGMoLJbUQdV0SZ7KIon4vf8',
    keyStatistics: 'AIzaSyBdgAYC6bjc0U90msoR15V03nBfvj6MN9o',
    maxResultsStatistics: '',
    //orderStatistics: 'viewCount',
    id: ''
}




export const ListVideos = async (q,maxResults) => {




    // apiStatistics.maxResultsStatistics = data.results;

    const {
        baseUrl,
        part,
        type,
        order,

        key
    } = apiUrl;

    const apiUrlVideos = `${baseUrl}part=${part}&type=${type}&q=${q}&maxResults=${maxResults}&key=${key}`;

    let res = await axios.get(apiUrlVideos).catch(console.log)


    let nextPage = res.data.nextPageToken;
    let prevPage = res.data.prevPageToken

    let responseVideos = res.data.items;
    let textConcatVideosIds = '';

    for (var i = 0; i < responseVideos.length; i++) {
        textConcatVideosIds += responseVideos[i].id.videoId + ",";
    }

    apiStatistics.id = textConcatVideosIds;

    const {
        baseUrlStatistics,
        partStatistics,
        orderStatistics,
        id,
        maxResultsStatistics,
        keyStatistics
    } = apiStatistics;
    const urlStatistics = `${baseUrlStatistics}part=${partStatistics}&id=${id}&maxResults=${maxResults}&key=${keyStatistics}`;

    let rest = await axios.get(urlStatistics).catch(console.log);

    let responseStatistics = rest.data.items;
    // console.log('videos', responseStatistics)
    return {
        responseStatistics,
        nextPage,
        prevPage
    };


}








export const PrevPage = async (apiUrl) => {



    const {
        baseUrl,
        part,
        type,
        order,
        maxResults,
        q,
        key,
        prevPageToken
    } = apiUrl;

    const apiUrlVideos = `${baseUrl}part=${part}&type=${type}&q=${q}&maxResults=${maxResults}&key=${key}&pageToken=${prevPageToken}`;

    let res = await axios.get(apiUrlVideos).catch(console.log);


    let nextPage = res.data.nextPageToken;
    let prevPage = res.data.prevPageToken

    let responseVideos = res.data.items;
    let textConcatVideosIds = '';

    for (var i = 0; i < responseVideos.length; i++) {
        textConcatVideosIds += responseVideos[i].id.videoId + ",";
    }

    apiStatistics.id = textConcatVideosIds;


    let rest = await axios.get(urlStatistics).catch(console.log);

    let responseStatistics = rest.data.items;

    return {
        responseStatistics,
        nextPage,
        prevPage
    };

}


