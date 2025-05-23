const a = (t, e, r) => {
  const o = t[e];
  return o ? typeof o == "function" ? o() : Promise.resolve(o) : new Promise((f, n) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(
      n.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + e + (e.split("/").length !== r ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
class c {
  static async loadPlugin(e) {
    try {
      const r = await a(/* @__PURE__ */ Object.assign({ "../providers/name/index.ts": () => Promise.resolve().then(() => d) }), `../providers/${e}/index.ts`, 4);
      if (r.register)
        console.log("[Plugin Loader] Register plugin:", e), r.register();
      else
        throw new Error(`[Plugin Loader] No register in ${e}`);
    } catch (r) {
      throw console.error(`[Plugin Loader] Failed to load ${e}:`, r), r;
    }
  }
}
class i {
  static factories = /* @__PURE__ */ new Map();
  static register(e, r) {
    this.factories.set(e, r);
  }
  static getFactory(e) {
    const r = this.factories.get(e);
    if (!r)
      throw new Error(`[Provider Registry] No factory registered for '${e}'`);
    return r;
  }
  static listProviders() {
    return Array.from(this.factories.keys());
  }
}
class y {
  static async getProvider(e) {
    return await c.loadPlugin(e), i.getFactory(e).create();
  }
}
var s = /* @__PURE__ */ ((t) => (t.NAME = "name", t))(s || {});
class l {
  constructor() {
  }
  async start() {
    return console.log("NameProvider start"), !0;
  }
}
class u {
  create() {
    return new l();
  }
}
function g() {
  i.register(s.NAME, new u());
}
const d = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  register: g
}, Symbol.toStringTag, { value: "Module" }));
export {
  s as EnumProvider,
  y as ProviderFacade
};
