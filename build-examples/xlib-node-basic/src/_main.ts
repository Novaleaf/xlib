import * as xlib from "xlib"


// const callXlibKyTest = ( async (): Promise<string> => {

// 	// const res = await xlib.ky( "https://httpbin.org/bytes/16" )
// 	// const reader = await res.body?.getReader().read()
// 	// if ( reader == null ) {
// 	// 	return "NULL"
// 	// } else {
// 	// 	const result = new TextDecoder( "utf-8" ).decode( reader.value )
// 	// 	return result
// 	// }

// 	const resp = await xlib.ky.get( "https://httpbin.org/base64/aGVsbG8gZnJvbSB0aGUgaW50ZXJuZXQ=" )
// 	const reader = await resp.body?.getReader().read()
// 	if ( reader == null ) {
// 		return "ERROR"
// 	}
// 	const result = new TextDecoder( "utf-8" ).decode( reader.value )

// 	console.log( result )
// 	return result

// } );

// ( () => {
// 	void callXlibKyTest().then( ( val ) => console.log( val ), ( err ) => console.log( err ) )

// } )()

//const result = xlib.f( "hello papa" )



//console.log( result )

//console.log( "first" )



//console.log( "hi from verify-node watched two hmmhmm...." )


const log = new xlib.diag.Logger( "xlib verify, main" )
log.info( "first" )


export function f(): void { // neeeeeee

}



