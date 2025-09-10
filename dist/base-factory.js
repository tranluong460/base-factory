import { CoreLogger as o } from "@vitechgroup/mkt-elec-core";
const c = (e, t, r) => {
  const s = e[t];
  return s ? typeof s == "function" ? s() : Promise.resolve(s) : new Promise((I, a) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(
      a.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + t + (t.split("/").length !== r ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
class g {
  static async loadPlugin(t) {
    const r = o.getInstance();
    try {
      const s = await c(/* @__PURE__ */ Object.assign({ "../providers/business/index.ts": () => Promise.resolve().then(() => w), "../providers/www/index.ts": () => Promise.resolve().then(() => B) }), `../providers/${t}/index.ts`, 4);
      if (s.register)
        s.register();
      else
        throw new Error(`[Plugin Loader] No register in ${t}`);
    } catch (s) {
      throw r.error(`[Plugin Loader] Failed to load ${t}:`, s), s;
    }
  }
}
class $ {
  static async getProvider(t) {
    return await g.loadPlugin(t.type), i.getFactory(t.type).create(t);
  }
}
class i {
  static factories = /* @__PURE__ */ new Map();
  static register(t, r) {
    this.factories.set(t, r);
  }
  static getFactory(t) {
    const r = this.factories.get(t);
    if (!r)
      throw new Error(`[Provider Registry] No factory registered for '${t}'`);
    return r;
  }
  static listProviders() {
    return Array.from(this.factories.keys());
  }
}
const l = {}, k = {
  log_process_run: l
}, u = {}, x = {
  log_process_run: u
}, d = {}, N = {
  log_process_run: d
};
var n = /* @__PURE__ */ ((e) => (e.WWW = "www", e.BUSINESS = "business", e))(n || {});
class p {
  logger;
  constructor() {
    this.logger = o.getInstance();
  }
  async startApi() {
    this.logger.info("BusinessApiActions start");
  }
}
class y {
  logger;
  constructor() {
    this.logger = o.getInstance();
  }
  async startAutomated() {
    this.logger.info("BusinessAutomatedActions start");
  }
}
class h {
  logger;
  constructor() {
    this.logger = o.getInstance();
  }
  async startScripted() {
    this.logger.info("BusinessScriptedActions start");
  }
}
class f {
  get useApi() {
    return new p();
  }
  get useAutomated() {
    return new y();
  }
  get useScripted() {
    return new h();
  }
}
class W {
  create() {
    return new f();
  }
}
function A() {
  i.register(n.BUSINESS, new W());
}
const w = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  register: A
}, Symbol.toStringTag, { value: "Module" }));
class m {
  logger;
  payload;
  constructor(t) {
    this.logger = o.getInstance(), this.payload = t;
  }
  async startApi() {
    this.logger.info("payload", this.payload), this.logger.info("WWWApiActions start");
  }
}
class _ {
  logger;
  payload;
  constructor(t) {
    this.logger = o.getInstance(), this.payload = t;
  }
  async startAutomated() {
    this.logger.info("payload", this.payload), this.logger.info("WWWAutomatedActions start");
  }
}
class v {
  logger;
  payload;
  constructor(t) {
    this.logger = o.getInstance(), this.payload = t;
  }
  async startScripted() {
    this.logger.info("payload", this.payload), this.logger.info("WWWScriptedActions start");
  }
}
class S {
  automated;
  scripted;
  api;
  constructor(t) {
    this.automated = new _(t), this.scripted = new v(t), this.api = new m(t);
  }
  get useAutomated() {
    return this.automated;
  }
  get useScripted() {
    return this.scripted;
  }
  get useApi() {
    return this.api;
  }
}
class P {
  create(t) {
    return new S(t);
  }
}
function b() {
  i.register(n.WWW, new P());
}
const B = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  register: b
}, Symbol.toStringTag, { value: "Module" }));
export {
  k as EN,
  n as EnumFacebookProvider,
  g as FacebookPluginLoader,
  $ as FacebookProviderFacade,
  i as FacebookProviderRegistry,
  x as KO,
  N as VI
};
