/// <reference path="../vite-env.d.ts" />
export declare const constantRoute: ({
    path: string;
    component: () => Promise<typeof import("*.vue")>;
    name: string;
    meta: {
        keywords: string;
        description: string;
        title?: undefined;
    };
    redirect?: undefined;
} | {
    path: string;
    component: () => Promise<typeof import("*.vue")>;
    name: string;
    meta: {
        title: string;
        keywords: string;
        description: string;
    };
    redirect?: undefined;
} | {
    path: string;
    component: () => Promise<typeof import("*.vue")>;
    meta: {
        title: string;
        keywords: string;
        description: string;
    };
    name?: undefined;
    redirect?: undefined;
} | {
    path: string;
    component: () => Promise<typeof import("*.vue")>;
    name: string;
    meta: {
        title: string;
        keywords?: undefined;
        description?: undefined;
    };
    redirect?: undefined;
} | {
    path: string;
    redirect: string;
    name: string;
    component?: undefined;
    meta?: undefined;
})[];
declare const router: import("vue-router").Router;
export default router;
