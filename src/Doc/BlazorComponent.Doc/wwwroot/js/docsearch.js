if (window.BlazorComponent === undefined)
    window.BlazorComponent = {}

window.BlazorComponent.DocSearch = {
    instance: {},
    init: locale => {
        if (!docsearch) {
            return;
        }
        const lang = locale === 'zh-CN' ? 'cn' : 'en';
        window.BlazorComponent.DocSearch.instance = docsearch({
            apiKey: '93dc26e7c963c887f9b096b349dd47ce',
            indexName: 'ant-design-blazor-docs',
            appId: 'C9UTAZSOWW',
            inputSelector: '#search-box input',
            algoliaOptions: { facetFilters: [`tags:${lang}`] },
            transformData(hits) {
                hits.forEach(hit => {
                    hit.url = hit.url.replace('antblazor.com', window.location.host);
                    hit.url = hit.url.replace('https:', window.location.protocol);
                });
                return hits;
            },
            debug: false
        });
    },
    localeChange: locale => {
        if (!docsearch || !window.BlazorComponent.DocSearch.instance) {
            return;
        }
        const lang = locale === 'zh-CN' ? 'cn' : 'en';
        window.BlazorComponent.DocSearch.instance.algoliaOptions.facetFilters = [`tags:${lang}`]
    }
};
