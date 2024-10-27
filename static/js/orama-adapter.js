import { create, search as oramaSearch, insertMultiple } from "https://cdn.jsdelivr.net/npm/@orama/orama@latest/+esm";
import { pluginQPS } from 'https://cdn.jsdelivr.net/npm/@orama/plugin-qps@latest/+esm'
import { pluginPT15 } from 'https://cdn.jsdelivr.net/npm/@orama/plugin-pt15@latest/+esm'
//import { pluginEmbeddings } from 'https://cdn.jsdelivr.net/npm/@orama/plugin-embeddings@latest/+esm'
//import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core';
//import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl';


//import { createTokenizer } from '@orama/tokenizers/japanese'
//import { stopwords as japaneseStopwords } from "@orama/stopwords/japanese";

let searchEngine = null;

async function init() {
    async function initIndex( index ){
/*
		const embeddings = await pluginEmbeddings({
			embeddings: {
				// Property used to store generated embeddings. Must be defined in the schema.
				defaultProperty: 'embeddings',
				onInsert: {
					// Generate embeddings at insert-time.
					// Turn off if you're inserting documents with embeddings already generated.
					generate: true,
					// Properties to use for generating embeddings at insert time.
					// These properties will be concatenated and used to generate embeddings.
					properties: ['description'],
					verbose: true,
				}
			}
		});
*/
		searchEngine = await create({
			schema: {
				title: 'string',
				content: 'string',
 				uri: 'string',
				breadcrumb: 'string',
				description: 'string',
				tags: 'string[]',
//				embeddings: 'vector[1]'
			},
			plugins: [
//				embeddings,
//				pluginQPS()
				pluginPT15()
			],
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
	const searchResponse = await oramaSearch(searchEngine, {
//		mode: 'hybrid', // vector search seems not to work
		term: term,
		properties: '*',
		threshold: 0, // only show results where all keywords were found
		limit: 99,
		boost: { // doesn't seem to make a difference in score
			tags: 1.8,
			title: 1.5,
			descriptoin: 1.3,
			breadcrumb: 1.2,
		},
//		distinctOn: 'title', // just to filter out changelog/releasenotes if having the same title
//		exact: true, // not for PT15
//		tolerance: 1, // not for PT15
	});
	console.log( "new term", term )
	searchResponse.hits.forEach( hit => console.log(hit.score, hit.document.uri) );
	return searchResponse.hits.map( hit => ({ matches: [ term, ...term.split(' ') ], page: hit.document }) );
}

export { init, search };
