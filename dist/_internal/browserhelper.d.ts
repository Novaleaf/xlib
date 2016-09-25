/** DEPRECATED:  use jsHelper.platformType instead.
determine if running in a browser (if false, most likely running in node.js) */
export declare var isBrowser: boolean;
/** detect ie version, or undefined if ie10+ or non ie browser.
usage:  if(ieVersion<9){...}*/
export declare var ieVersion: number;
/** detects if we are running any ie, even 10  (looks for 'trident' in user agent) */
export declare var isIE: boolean;
/** provides onload() capabilities that work on old versions of IE too */
export declare function onLoad(domElement: HTMLElement | any, callback: any): void;
/** get the first attribute and return it"s value from a dom element
example:
var amdMain = getFirstAttribute("script","data-amd-main");
*/
export declare function getDomAttribute(elementType: string, attribute: string, searchTopDown?: boolean): string | null;
/** get the first html element found and return it.  */
export declare function getDomElement(elementType: string, 
    /** if not null, finds an element with this attribute */
    attribute?: string, attributeValue?: string, searchTopDown?: boolean): HTMLElement | null;
/** obatin all cookies */
export declare var getCookies: () => {
    [key: string]: string;
};
export declare function getCookie(key: string, valueIfNullOrEmpty?: string | null): string | null;
export declare var getQuerystringVariables: () => {};
export declare function getQuerystringVariable(key: string, valueIfNullOrEmpty?: string | null): string | null;
