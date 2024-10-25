import {
	create,
	search as oramaSearch,
	insertMultiple,
} from "https://cdn.jsdelivr.net/npm/@orama/orama@latest/+esm";
// "https://unpkg.com/browse/@orama/orama@latest/dist/esm/index.js";
// https://cdn.jsdelivr.net/npm/@orama/orama@3.0.1/dist/esm/index.js


//import { createTokenizer } from '@orama/tokenizers/japanese'
//import { stopwords as japaneseStopwords } from "@orama/stopwords/japanese";

let searchEngine = null;

async function init() {
    async function initIndex( index ){
		searchEngine = await create({
			schema: {
				title: 'string',
				content: 'string',
				uri: 'string',
				breadcrumb: 'string',
				description: 'string',
				tags: 'string[]',
			},
	/*
			defaultLanguage: 'french',
			components: {
				tokenizer: {
					stemmingFn: stemmer,
				},
			},
	*/
		});
		await insertMultiple(searchEngine, index);

        window.relearn.isSearchEngineReady = true;
        window.relearn.executeInitialSearch();
    }

	if( window.index_js_url ){
        var js = document.createElement("script");
        js.src = index_js_url;
        js.setAttribute("async", "");
        js.onload = function(){
            initIndex(relearn_searchindex);
        };
        js.onerror = function(e){
            console.error('Error getting Hugo index file');
        };
        document.head.appendChild(js);
    }
}

async function search( term ){
	const searchResponse = await oramaSearch(searchEngine, {term: term, properties: '*'});
	return searchResponse.hits.map( hit => ({ page: hit.document }) );
}

export { init, search };
