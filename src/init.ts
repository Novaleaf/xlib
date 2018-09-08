/** allows internal xlib modules to hook the xlib.initialize() method */
import promise = require( "./core/promise" );
import * as environment from './core/environment';
import bb = promise.bluebird;

export type IInitArgs = {
    disableEnvAutoRead?: boolean,
    logLevel?: environment.LogLevel,
    envLevel?: environment.EnvLevel,
    testLevel?: environment.TestLevel,
    suppressStartupMessage?: boolean,
};

export async function initialize( args?: IInitArgs ) {
    args = { ...args };

    if ( isStarted ) {
        throw new Error( "initialize already started and trying to start it again" );
    }
    isStarted = true;

    await bb.all( initWorkArray );

    finishedPromise.fulfill( args );
};




let isStarted = false;
const finishedPromise: promise.IExposedPromise<IInitArgs> = promise.CreateExposedPromise<IInitArgs>();

const initWorkArray: bb<void>[] = [];


/** do work during the .initialize() call.   returning promise yields once all initialize work is complete. */
export async function onInitialize( /**if your code needs to do asynchronous work during initialize, initialize won't finish until the promise is resolved. */  initWork?: Promise<void> | ( () => Promise<void> ) | ( () => void ) ) {

    if ( isStarted ) {
        throw new Error( "initialize already started and you are trying to schedule init work" );
    }

    if ( initWork != null ) {

        if ( typeof initWork === "function" ) {
            initWorkArray.push( bb.try( initWork ) );
        } else {
            initWorkArray.push( bb.resolve( initWork ) );
        }
    }

    return finishedPromise;


}


