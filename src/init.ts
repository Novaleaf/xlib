/** allows internal xlib modules to hook the xlib.initialize() method */
import promise = require( "./core/promise" );
import * as environment from './core/environment';
import bb = promise.bluebird;


export function isInitializeStarted() {
    return isStarted;
}

let isStarted = false;
let finishedPromise: promise.IExposedPromise<any>;

const initWorkArray: Array<promise.IocCallback<any, void>> = [];

export async function initialize<TArgs>( args?: any ) {
    args = { ...args };

    if ( isStarted ) {
        throw new Error( "initialize already started and trying to start it again" );
    }
    isStarted = true;
    finishedPromise = promise.CreateExposedPromise<any>();


    for ( let i = 0; i < initWorkArray.length; i++ ) {
        const initWork = initWorkArray[ i ];
        if ( typeof initWork === "function" ) {
            await bb.method( initWork )( args );
        } else {
            await bb.resolve( initWork );
        }
    }


    finishedPromise.fulfill( args );
};





/** do work during the .initialize() call.   returning promise yields once all initialize work is complete. */
export async function onInitialize<TArgs>( /**if your code needs to do asynchronous work during initialize, initialize won't finish until the promise is resolved. */  initWork?: promise.IocCallback<TArgs, void> ) {

    if ( isStarted ) {
        throw new Error( "initialize already started and you are trying to schedule init work" );
    }

    if ( initWork != null ) {
        initWorkArray.push( initWork );
        // if ( typeof initWork === "function" ) {
        //     initWorkArray.push( bb.try( initWork ) );
        // } else {
        //     initWorkArray.push( bb.resolve( initWork ) );
        // }
    }

    return finishedPromise;


}
