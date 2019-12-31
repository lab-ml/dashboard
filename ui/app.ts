import { ScreenContainer } from "./screen"
import { Router } from "./weya/router"
import {AjaxHttpPort} from "./io/ajax"

export let ROUTER = new Router({
    emulateState: false,
    hashChange: false,
    pushState: true,
    root: '/',
    onerror: (e) => { console.error("Error", e) }
})

export let SCREEN = new ScreenContainer()

export let PORT = new AjaxHttpPort("http", "localhost", 8082, '/api')
