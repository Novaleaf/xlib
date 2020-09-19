import * as React from "react"
import { ToggleSwitch, IToggleEventArgs } from "./ToggleSwitch"




import * as xlib from "xlib"

const callXlibKyTest = ( async (): Promise<string> => {

	// const res = await xlib.ky( "https://httpbin.org/bytes/16" )
	// const reader = await res.body?.getReader().read()
	// if ( reader == null ) {
	// 	return "NULL"
	// } else {
	// 	const result = new TextDecoder( "utf-8" ).decode( reader.value )
	// 	return result
	// }

	//const resp = await xlib.net.ky.get( "https://httpbin.org/base64/aGVsbG8gZnJvbSB0aGUgaW50ZXJuZXQ=" )
	//const 
	//const reader = await resp.body?.getReader().read()
	// if ( reader == null ) {
	// 	return "ERROR"
	// }
	// const result = new TextDecoder( "utf-8" ).decode( reader.value )
	// return result
	return ( await xlib.net._internal.gaxios.request<string>( { url: "https://httpbin.org/base64/aGVsbG8gZnJvbSB0aGUgaW50ZXJuZXQ=" } ) ).data

} )


class Deferred<T> extends React.Component<{
	promise: Promise<T>,
	pendingRender?: () => React.ReactNode,
	thenRender?: ( val: T ) => React.ReactNode,
	catchRender?: ( err: Error ) => React.ReactNode,
}, { value: T, error?: Error }> {
	public constructor( props ) {
		super( props )
		this.state = { ...this.state }
	}
	public componentDidMount(): void {
		void this.props.promise.then( value => {
			this.setState( { value } )
		} ).catch( ( error ) => this.setState( { error } ) )
	}
	public render(): React.ReactNode {

		if ( this.state.value === undefined ) {
			return this.props.pendingRender?.() ?? "..."
		}
		if ( this.state.error != null ) {
			return this.props.catchRender?.( this.state.error ) ?? "ERROR"
		}


		return this.props.thenRender?.( this.state.value ) ?? <div>{ this.state.value }</div>


		//return <div>{ this.state.value }</div>
		//const then = this.props.then || ( value => <span>{ value }</span> )
		//return then( this.state.value )
	}
}



/**
 * This React component renders the application page.
 */
export class ExampleApp extends React.Component {
	public render(): React.ReactNode {
		const appStyle: React.CSSProperties = {
			backgroundColor: "#ffffff",
			padding: "20px",
			borderRadius: "5px",
			width: "400px"
		}

		return (
			<div style={ { padding: "20px" } }>
				<div style={ appStyle }>
					<h2>Hello, world!</h2>
          Here is an example control:
					<ToggleSwitch leftColor={ "#800000" } rightColor={ "#008000" } onToggle={ this._onToggle } />
				</div>
				<br />
				<div style={ appStyle }>
					<h3>Testing Xlib network subpackage (ky, roundtrip api call)</h3>
					<code><Deferred promise={ callXlibKyTest() } /></code>
				</div>
			</div>
		)
	}


	// React event handlers should be represented as fields instead of methods to ensure the "this" pointer
	// is bound correctly.  This form does not work with virtual/override inheritance, so use regular methods
	// everywhere else.
	private _onToggle = ( sender: ToggleSwitch, args: IToggleEventArgs ): void => {
		console.log( "Toggle switch changed: " + args.sliderPosition )
	};
}
