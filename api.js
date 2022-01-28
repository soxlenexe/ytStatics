import https from 'https';
import axios from 'axios';
import {
    JSDOM
} from 'jsdom';

export const isMonetized = async (url) => {


    return new Promise((resolve, reject) => {
        const request = https.request(url, (response) => {

            let data = '';
            response.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            response.on('end', () => {
                const body = data;
                let parser = new JSDOM(body);
                let document = parser.window.document;
                let rawJS = '';
                Object.values(document.querySelectorAll('script')).map(script => {
                    if (script.innerHTML.includes('var ytInitialData')) {
                        rawJS = script.innerHTML;
                    }
                });
                let res = new Function(rawJS + `
                    return ytInitialData;
                `);

                let subs = res().contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer.owner.videoOwnerRenderer.subscriberCountText ?.simpleText;


                if (subs == undefined) {
                    subs = 0;
                } else {
                    subs.split(' ')[0];
                }



                let views = res().contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.viewCount.videoViewCountRenderer.viewCount ?.simpleText;
                if (views == undefined) {
                    views = 0;
                } else {
                    views.split(' ')[0];
                }

                let likes = res().contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons[0].toggleButtonRenderer.defaultText?.simpleText
                likes = likes ? likes : 0;

                if(likes != 0){
                    if(likes.includes(',')){
                        likes = parseInt(likes.replace(',','')) * 10000;

                    }else{
                        likes = parseInt(likes.replace('.',''));

                    }

                }

                if (subs != 0) {

                    if (subs.includes(',')) {
                        subs = parseInt(subs.replace(',', '')) * 10000;
                    } else if (subs.includes('.')) {
                        subs = parseInt(subs.replace('.', ''));
                    } else {
                        subs = parseInt(subs);
                    }
                }
                if (views != 0) {

                    if (views.includes(',')) {
                        views = parseInt(views.replace(',', '')) * 10000;
                    } else if (views.includes('.')) {
                        views = parseInt(views.replace('.', ''));
                    } else {
                        views = parseInt(views);
                    }
                }

                let monteized = false;
                if (data.includes('ads') && views >= 4000 && subs >= 1000) {
                   monteized = true;
                } 
                    resolve([monteized,likes])
                
            });
        })

        request.on('error', (error) => {
            reject(new Error(error));
        });

        request.end()




    });
}



export const VIDEO_LIST = async (KeyWord, filter = null) => {


    return new Promise((resolve, reject) => {
        let vid = 'EgIQAQ%253D%253D';
        const request = https.request(`https://www.youtube.com/results?search_query=${KeyWord}&sp=${filter?filter:vid}`, (response) => {

            let data = '';
            response.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            response.on('end', async () => {
                const body = data;


                let parser = new JSDOM(body);
                let document = parser.window.document;
                let rawJS = '';
                Object.values(document.querySelectorAll('script')).map(script => {
                    if (script.innerHTML.includes('var ytInitialData')) {
                        rawJS = script.innerHTML;
                    }
                });
                let res = new Function(rawJS + `
                    return ytInitialData;
                `);

                let videolist = res().contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
                videolist = Object.values(videolist);

                let finalList = [];

                await Promise.all(videolist.map(async v => {
                    let vi = v;
                    if (v.videoRenderer ?.videoId) {
                        let data= await isMonetized('https://www.youtube.com/watch?v=' + vi.videoRenderer.videoId);
                        vi.videoRenderer.isMonetized = data[0];
                        vi.videoRenderer.likes = data[1];
                        finalList.push(vi);
                    }
                }));

                resolve(finalList);
            });
        })

        request.on('error', (error) => {
            reject(new Error(error));
        });

        request.end()

    });
}


export const CANAL_LIST = async (KeyWord) => {


    return new Promise((resolve, reject) => {
        let can = 'EgIQAg%253D%253D';
        const request = https.request(`https://www.youtube.com/results?search_query=${KeyWord}&sp=${can}`, (response) => {

            let data = '';
            response.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            response.on('end', () => {
                const body = data;


                let parser = new JSDOM(body);
                let document = parser.window.document;
                let rawJS = '';
                Object.values(document.querySelectorAll('script')).map(script => {
                    if (script.innerHTML.includes('var ytInitialData')) {
                        rawJS = script.innerHTML;
                    }
                });
                let res = new Function(rawJS + `
                    return ytInitialData;
                `);

                let videolist = res().contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
                videolist = Object.values(videolist);



                resolve(videolist);
            });
        })

        request.on('error', (error) => {
            reject(new Error(error));
        });

        request.end()

    });
}






