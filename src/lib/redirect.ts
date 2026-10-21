/** Leaves the app for an external page, e.g. a payment provider's checkout. */
export function redirectToExternal(url: string) {
    window.location.assign(url);
}
