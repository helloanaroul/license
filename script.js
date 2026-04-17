
!function () {
    var DB = "https://microsax-db-default-rtdb.firebaseio.com";
    var CACHE = "bls_";
    var TTL = 3600000;
    var cfg = window.__BLS__ || {};
    var tid = cfg.id;

    if (!tid) return go();

    function go() { location.replace("about:blank"); }

    function asset(tag, k, v) {
        var e = document.createElement(tag);
        if (tag === "link") { e.rel = "stylesheet"; e.href = v; }
        else { e.src = v; e.async = 1; }
        document.head.appendChild(e);
    }

    function apply(d) {
        if (!d || !d.active) return go();
        var h = location.hostname;
        if (d.domain && d.domain !== "*") {
            var ok = d.domain.split(",").some(function (x) {
                x = x.trim();
                return h === x || h.endsWith("." + x);
            });
            if (!ok) return go();
        }
        if (d.expires && d.expires !== "lifetime" && new Date() > new Date(d.expires)) return go();
        if (d.custom_css) asset("link", "href", d.custom_css);
        if (d.custom_js) asset("script", "src", d.custom_js);
    }

    function fromCache() {
        try {
            var raw = sessionStorage.getItem(CACHE + tid);
            if (!raw) return null;
            var p = JSON.parse(raw);
            if (Date.now() - p.t > TTL) { sessionStorage.removeItem(CACHE + tid); return null; }
            return p.d;
        } catch (e) { return null; }
    }

    function toCache(d) {
        try { sessionStorage.setItem(CACHE + tid, JSON.stringify({ t: Date.now(), d: d })); } catch (e) { }
    }

    var cached = fromCache();
    if (cached) { apply(cached); return; }

    fetch(DB + "/licenses/" + tid + ".json?shallow=false", { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { toCache(d); apply(d); })
        .catch(go);
}();
